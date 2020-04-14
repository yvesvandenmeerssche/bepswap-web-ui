import { all, takeEvery, put, fork, call, delay } from 'redux-saga/effects';
import { isEmpty as _isEmpty } from 'lodash';
import byzantine from '@thorchain/byzantine-module';
import * as actions from './actions';
import * as api from '../../helpers/apiHelper';

import {
  saveBasePriceAsset,
  getBasePriceAsset,
} from '../../helpers/webStorageHelper';
import { getAssetDetailIndex, getPriceIndex } from './utils';
import { NET, getNet } from '../../env';
import { UnpackPromiseResponse } from '../../types/util';

export const MIDGARD_MAX_RETRY = 3;
export const MIDGARD_RETRY_DELAY = 2000; // ms

export function* getApiBasePath(net: NET, noCache = false) {
  if (net === NET.DEV) {
    return api.getMidgardBasePathByIP(api.MIDGARD_DEV_API_DEV_IP);
  }

  try {
    yield put(actions.getApiBasePathPending());
    const fn = byzantine;
    const basePath: UnpackPromiseResponse<typeof fn> = yield call(
      fn,
      net === NET.MAIN,
      noCache,
    );
    yield put(actions.getApiBasePathSuccess(basePath));
    return basePath;
  } catch (error) {
    yield put(actions.getApiBasePathFailed(error));
    throw new Error(error);
  }
}

export function* getPools() {
  yield takeEvery(actions.GET_POOLS_REQUEST, function*() {
    for (let i = 0; i < MIDGARD_MAX_RETRY; i++) {
      try {
        const noCache = i > 0;
        const basePath: string = yield call(getApiBasePath, getNet(), noCache);
        let midgardApi = api.getMidgardDefaultApi(basePath);
        const fn = midgardApi.getPools;
        const { data }: UnpackPromiseResponse<typeof fn> = yield call({
          context: midgardApi,
          fn,
        });

        if (data && !_isEmpty(data)) {
          // We do need to check `basePath` again here
          midgardApi = api.getMidgardDefaultApi(basePath);
          const fn = midgardApi.getAssetInfo;
          const {
            data: assetDetails,
          }: UnpackPromiseResponse<typeof fn> = yield call(
            {
              context: midgardApi,
              fn,
            },
            data.join(),
          );

          const assetDetailIndex = getAssetDetailIndex(assetDetails);
          const baseTokenTicker = getBasePriceAsset() || 'RUNE';
          const priceIndex = getPriceIndex(assetDetails, baseTokenTicker);
          const assetsPayload: actions.SetAssetsPayload = {
            assetDetails,
            assetDetailIndex,
          };

          yield put(actions.setAssets(assetsPayload));
          yield put(actions.setPriceIndex(priceIndex));

          yield put(
            actions.getPoolData({ assets: data, overrideAllPoolData: true }),
          );

          yield put(actions.getPoolsSuccess(data));
        } else {
          const error = new Error('No pools available');
          yield put(actions.getPoolsFailed(error));
        }
      } catch (error) {
        if (i < MIDGARD_MAX_RETRY - 1) {
          yield delay(MIDGARD_RETRY_DELAY);
        } else {
          yield put(actions.getPoolsFailed(error));
        }
      }
    }
  });
}

export function* getPoolData() {
  yield takeEvery(actions.GET_POOL_DATA_REQUEST, function*({
    payload,
  }: actions.GetPoolData) {
    const { assets, overrideAllPoolData } = payload;
    for (let i = 0; i < MIDGARD_MAX_RETRY; i++) {
      try {
        const noCache = i > 0;
        const basePath: string = yield call(getApiBasePath, getNet(), noCache);
        const midgardApi = api.getMidgardDefaultApi(basePath);
        const fn = midgardApi.getPoolsData;
        const { data }: UnpackPromiseResponse<typeof fn> = yield call(
          { context: midgardApi, fn },
          assets.join(),
        );
        yield put(
          actions.getPoolDataSuccess({
            poolDetails: data,
            overrideAllPoolData,
          }),
        );
      } catch (error) {
        if (i < MIDGARD_MAX_RETRY - 1) {
          yield delay(MIDGARD_RETRY_DELAY);
        } else {
          yield put(actions.getPoolDataFailed(error));
        }
      }
    }
  });
}

export function* getStakerPoolData() {
  yield takeEvery(actions.GET_STAKER_POOL_DATA_REQUEST, function*({
    payload,
  }: actions.GetStakerPoolData) {
    const { address, asset } = payload;

    // TODO (Chris): currently hardcode the Chain as BNB
    const assetId = `BNB.${asset}`;

    for (let i = 0; i < MIDGARD_MAX_RETRY; i++) {
      try {
        const noCache = i > 0;
        const basePath: string = yield call(getApiBasePath, getNet(), noCache);
        const midgardApi = api.getMidgardDefaultApi(basePath);
        const fn = midgardApi.getStakersAddressAndAssetData;
        const response: UnpackPromiseResponse<typeof fn> = yield call(
          { context: midgardApi, fn },
          address,
          assetId,
        );
        const { data } = response;

        yield put(actions.getStakerPoolDataSuccess(data));
      } catch (error) {
        if (i < MIDGARD_MAX_RETRY - 1) {
          yield delay(MIDGARD_RETRY_DELAY);
        } else {
          yield put(actions.getStakerPoolDataFailed(error));
        }
      }
    }
  });
}

export function* getPoolAddress() {
  yield takeEvery(actions.GET_POOL_ADDRESSES_REQUEST, function*() {
    for (let i = 0; i < MIDGARD_MAX_RETRY; i++) {
      try {
        const noCache = i > 0;
        const basePath: string = yield call(getApiBasePath, getNet(), noCache);
        const midgardApi = api.getMidgardDefaultApi(basePath);
        const fn = midgardApi.getThorchainProxiedEndpoints;
        const { data }: UnpackPromiseResponse<typeof fn> = yield call({
          context: midgardApi,
          fn,
        });

        yield put(actions.getPoolAddressSuccess(data));
      } catch (error) {
        if (i < MIDGARD_MAX_RETRY - 1) {
          yield delay(MIDGARD_RETRY_DELAY);
        } else {
          yield put(actions.getPoolAddressFailed(error));
        }
      }
    }
  });
}

export function* getTxByAddress() {
  yield takeEvery(actions.GET_TX_BY_ADDRESS, function*({
    payload,
  }: actions.GetTxByAddress) {
    for (let i = 0; i < MIDGARD_MAX_RETRY; i++) {
      try {
        const noCache = i > 0;
        const { address, offset, limit, type } = payload;
        const basePath: string = yield call(getApiBasePath, getNet(), noCache);
        const midgardApi = api.getMidgardDefaultApi(basePath);
        const fn = midgardApi.getTxDetails;
        const { data }: UnpackPromiseResponse<typeof fn> = yield call(
          { context: midgardApi, fn },
          offset,
          limit,
          address,
          undefined,
          undefined,
          type,
        );

        yield put(actions.getTxByAddressSuccess(data));
      } catch (error) {
        if (i < MIDGARD_MAX_RETRY - 1) {
          yield delay(MIDGARD_RETRY_DELAY);
        } else {
          yield put(actions.getTxByAddressFailed(error));
        }
      }
    }
  });
}

export function* getTxByAddressTxId() {
  yield takeEvery(actions.GET_TX_BY_ADDRESS_TXID, function*({
    payload,
  }: actions.GetTxByAddressTxId) {
    for (let i = 0; i < MIDGARD_MAX_RETRY; i++) {
      try {
        const noCache = i > 0;
        const basePath: string = yield call(getApiBasePath, getNet(), noCache);
        const midgardApi = api.getMidgardDefaultApi(basePath);
        const fn = midgardApi.getTxDetails;
        const { address, txId, offset, limit, type } = payload;
        const { data }: UnpackPromiseResponse<typeof fn> = yield call(
          {
            context: midgardApi,
            fn,
          },
          offset,
          limit,
          address,
          txId,
          undefined,
          type,
        );

        yield put(actions.getTxByAddressTxIdSuccess(data));
      } catch (error) {
        if (i < MIDGARD_MAX_RETRY - 1) {
          yield delay(MIDGARD_RETRY_DELAY);
        } else {
          yield put(actions.getTxByAddressTxIdFailed(error));
        }
      }
    }
  });
}

export function* getTxByAddressAsset() {
  yield takeEvery(actions.GET_TX_BY_ADDRESS_ASSET, function*({
    payload,
  }: actions.GetTxByAddressAsset) {
    for (let i = 0; i < MIDGARD_MAX_RETRY; i++) {
      try {
        const noCache = i > 0;
        const basePath: string = yield call(getApiBasePath, getNet(), noCache);
        const midgardApi = api.getMidgardDefaultApi(basePath);
        const fn = midgardApi.getTxDetails;
        const { address, asset, offset, limit, type } = payload;
        const { data }: UnpackPromiseResponse<typeof fn> = yield call(
          {
            context: midgardApi,
            fn,
          },
          offset,
          limit,
          address,
          undefined,
          asset,
          type,
        );

        yield put(actions.getTxByAddressAssetSuccess(data));
      } catch (error) {
        if (i < MIDGARD_MAX_RETRY - 1) {
          yield delay(MIDGARD_RETRY_DELAY);
        } else {
          yield put(actions.getTxByAddressAssetFailed(error));
        }
      }
    }
  });
}

export function* getTxByAsset() {
  yield takeEvery(actions.GET_TX_BY_ASSET, function*({
    payload,
  }: actions.GetTxByAsset) {
    for (let i = 0; i < MIDGARD_MAX_RETRY; i++) {
      try {
        const noCache = i > 0;
        const { asset, offset, limit, type } = payload;
        const basePath: string = yield call(getApiBasePath, getNet(), noCache);
        const midgardApi = api.getMidgardDefaultApi(basePath);
        const fn = midgardApi.getTxDetails;
        const { data }: UnpackPromiseResponse<typeof fn> = yield call(
          {
            context: midgardApi,
            fn,
          },
          offset,
          limit,
          undefined,
          undefined,
          asset,
          type,
        );

        yield put(actions.getTxByAssetSuccess(data));
      } catch (error) {
        if (i < MIDGARD_MAX_RETRY - 1) {
          yield delay(MIDGARD_RETRY_DELAY);
        } else {
          yield put(actions.getTxByAssetFailed(error));
        }
      }
    }
  });
}

export function* setBasePriceAsset() {
  yield takeEvery(actions.SET_BASE_PRICE_ASSET, function*({
    payload,
  }: actions.SetBasePriceAsset) {
    yield call(saveBasePriceAsset, payload);
  });
}

export default function* rootSaga() {
  yield all([
    fork(getPools),
    fork(getPoolData),
    fork(getStakerPoolData),
    fork(getPoolAddress),
    fork(setBasePriceAsset),
    fork(getTxByAddress),
    fork(getTxByAddressTxId),
    fork(getTxByAddressAsset),
    fork(getTxByAsset),
  ]);
}
