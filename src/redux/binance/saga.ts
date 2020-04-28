import { all, takeEvery, put, fork, call, take } from 'redux-saga/effects';

import { Method, AxiosResponse } from 'axios';
import {
  Token,
  Market,
  TickerStatistics,
  Account,
  TxPage,
  OrderList,
  TransferEvent,
} from '@thorchain/asgardex-binance';
import { eventChannel, END } from 'redux-saga';
import * as actions from './actions';
import {
  getBinanceTestnetURL,
  getBinanceMainnetURL,
  getHeaders,
  axiosRequest,
} from '../../helpers/apiHelper';
import { getTickerFormat } from '../../helpers/stringHelper';
import { getTokenName } from '../../helpers/assetHelper';
import { Maybe, Nothing, FixmeType } from '../../types/bepswap';
import { NET } from '../../env';

const LIMIT = 1000;

export const WS_MAX_RETRY = 5;

export function* getBinanceTokens() {
  yield takeEvery('GET_BINANCE_TOKENS', function*() {
    const params = {
      method: 'get' as Method,
      url: getBinanceTestnetURL(`tokens?limit=${LIMIT}`),
      headers: getHeaders(),
    };

    try {
      const { data }: AxiosResponse<Token[]> = yield call(axiosRequest, params);

      yield put(actions.getBinanceTokensSuccess(data));
    } catch (error) {
      yield put(actions.getBinanceTokensFailed(error));
    }
  });
}

export function* getBinanceMarkets() {
  yield takeEvery('GET_BINANCE_MARKETS', function*() {
    const params = {
      method: 'get' as Method,
      url: getBinanceTestnetURL(`markets?limit=${LIMIT}`),
      headers: getHeaders(),
    };

    try {
      const { data }: AxiosResponse<Market[]> = yield call(
        axiosRequest,
        params,
      );

      yield put(actions.getBinanceMarketsSuccess(data));
    } catch (error) {
      yield put(actions.getBinanceMarketsFailed(error));
    }
  });
}

export function* getBinanceTicker() {
  yield takeEvery('GET_BINANCE_TICKER', function*({
    payload,
  }: ReturnType<typeof actions.getBinanceTicker>) {
    const ticker = getTickerFormat(payload);
    const tokenName = getTokenName(ticker);

    const params = {
      method: 'get' as Method,
      url: getBinanceMainnetURL(`ticker/24hr?symbol=${tokenName}_BNB`),
      headers: getHeaders(),
    };

    try {
      const { data }: AxiosResponse<TickerStatistics[]> = yield call(
        axiosRequest,
        params,
      );

      yield put(actions.getBinanceTickerSuccess(data));
    } catch (error) {
      yield put(actions.getBinanceTickerFailed(error));
    }
  });
}

export function* getBinanceAccount() {
  yield takeEvery('GET_BINANCE_ACCOUNT', function*({
    payload,
  }: ReturnType<typeof actions.getBinanceAccount>) {
    const params = {
      method: 'get' as Method,
      url: getBinanceTestnetURL(`account/${payload}`),
      headers: getHeaders(),
    };

    try {
      const { data }: AxiosResponse<Account> = yield call(axiosRequest, params);

      yield put(actions.getBinanceAccountSuccess(data));
    } catch (error) {
      yield put(actions.getBinanceAccountFailed(error));
    }
  });
}

export function* getBinanceTransactions() {
  yield takeEvery('GET_BINANCE_TRANSACTIONS', function*({
    payload,
  }: ReturnType<typeof actions.getBinanceTransactions>) {
    const { address, symbol, startTime, endTime, limit } = payload;

    const params = {
      method: 'get' as Method,
      url: getBinanceTestnetURL(
        `transactions?address=${address}&txAsset=${symbol}&startTime=${startTime}&endTime=${endTime}&limit=${limit}`,
      ),
      headers: getHeaders(),
    };

    try {
      const { data }: AxiosResponse<TxPage> = yield call(axiosRequest, params);

      yield put(actions.getBinanceTransactionsSuccess(data));
    } catch (error) {
      yield put(actions.getBinanceTransactionsFailed(error));
    }
  });
}

export function* getBinanceOpenOrders() {
  yield takeEvery('GET_BINANCE_OPEN_ORDERS', function*({
    payload,
  }: ReturnType<typeof actions.getBinanceOpenOrders>) {
    const { address, symbol } = payload;

    const params = {
      method: 'get' as Method,
      url: getBinanceTestnetURL(
        `orders/open?address=${address}&symbol=${symbol}`,
      ),
      headers: getHeaders(),
    };

    try {
      const { data }: AxiosResponse<OrderList> = yield call(
        axiosRequest,
        params,
      );

      yield put(actions.getBinanceOpenOrdersSuccess(data));
    } catch (error) {
      yield put(actions.getBinanceOpenOrdersFailed(error));
    }
  });
}

function createWSChannel(ws: WebSocket) {
  return eventChannel(emit => {
    const onOpenHandler = (e: Event) => {
      // console.log('xxx : onOpenHandler', e);
      emit(e);
    };
    const onMessageHandler = (e: MessageEvent) => {
      // console.log('xxx : onMessageHandler', e);
      emit(e);
    };
    const onCloseHandler = (_: CloseEvent) => {
      // console.log('xxx : onCloseHandler', e);
      emit(END);
    };
    const onErrorHandler = (e: Event) => {
      // console.log('xxx : onErrorHandler', e);
      emit(e);
    };

    // setup the subscriptions
    ws.addEventListener('open', onOpenHandler);
    ws.addEventListener('error', onErrorHandler);
    ws.addEventListener('message', onMessageHandler);
    ws.addEventListener('close', onCloseHandler);

    // Unsubscribe function
    // which will be invoked when the saga calls `channel.close` method
    const unsubscribe = () => {
      ws.close();
      ws.removeEventListener('open', onOpenHandler);
      ws.removeEventListener('error', onErrorHandler);
      ws.removeEventListener('message', onMessageHandler);
      ws.removeEventListener('close', onCloseHandler);
    };

    return unsubscribe;
  });
}

const TESTNET_WS_URI =
  process.env.REACT_APP_BINANCE_TESTNET_WS_URI ||
  'wss://testnet-dex.binance.org/api/ws';

const MAINET_WS_URI =
  process.env.REACT_APP_BINANCE_MAINNET_WS_URI ||
  'wss://dex.binance.org/api/ws';

let wsChannel: Maybe<FixmeType> = Nothing;

const initWS = (net: NET) => {
  const url = net === NET.MAIN ? MAINET_WS_URI : TESTNET_WS_URI;
  return new WebSocket(url);
};

const destroyWSChannel = () => {
  // wsChannel will close WS connection, too
  wsChannel?.close();
  wsChannel = Nothing;
};

function* subscribeBinanceTransfers() {
  yield takeEvery('SUBSCRIBE_BINANCE_TRANSFERS', function*({
    payload,
  }: ReturnType<typeof actions.subscribeBinanceTransfers>) {
    console.log('xxx subscribeBinanceTransfers');
    // destroy previous connection if there any
    destroyWSChannel();
    const { net, address } = payload;
    const ws = initWS(net);
    wsChannel = yield call(createWSChannel, ws);

    while (true) {
      try {
        const event: Event = yield take(wsChannel);
        console.log('xxx event:', event);
        if (event.type === 'open') {
          console.log('xxx open', ws);
          (event.target as WebSocket).send(
            JSON.stringify({
              method: 'subscribe',
              topic: 'transfers',
              address,
            }),
          );
        }
        if (event.type === 'close') {
          console.log('xxx close', ws);
          (event.target as WebSocket).send(
            JSON.stringify({
              method: 'unsubscribe',
              topic: 'transfers',
              address,
            }),
          );
        }
        if (event.type === 'message') {
          console.log('xxx message', event);
          try {
            const result = JSON.parse(
              (event as MessageEvent).data,
            ) as TransferEvent;
            console.log('xxx message', result);
            yield put(actions.binanceTransfersMessageReceived(result));
          } catch (error) {
            console.log('xxx message error', error);
            yield put(actions.wsBinanceError(error));
          }
        }
      } catch (error) {
        console.log('xxx ws error:', error);
        destroyWSChannel();
        // TODO (Veado) Retry??
      }
    }
  });
}

function* unSubscribeBinanceTransfers() {
  yield takeEvery('UNSUBSCRIBE_BINANCE_TRANSFERS', function*() {
    console.log('xxx unSubscribeBinanceTransfers');
    yield destroyWSChannel();
  });
}

export default function* rootSaga() {
  yield all([
    fork(getBinanceTokens),
    fork(getBinanceMarkets),
    fork(getBinanceTicker),
    fork(getBinanceAccount),
    fork(getBinanceTransactions),
    fork(getBinanceOpenOrders),
    fork(subscribeBinanceTransfers),
    fork(unSubscribeBinanceTransfers),
  ]);
}
