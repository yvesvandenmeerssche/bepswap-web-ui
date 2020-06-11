import React, { useState, useEffect } from 'react';
import * as H from 'history';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import { notification, Row, Col } from 'antd';
import { SyncOutlined, SwapOutlined, DatabaseOutlined } from '@ant-design/icons';

// import { bn } from '@thorchain/asgardex-util';
import Label from '../../../components/uielements/label';
import AddIcon from '../../../components/uielements/addIcon';
import CoinPair from '../../../components/uielements/coins/coinPair';
import CoinIcon from '../../../components/uielements/coins/coinIcon';
// import Trend from '../../../components/uielements/trend';
import Button from '../../../components/uielements/button';
import Table from '../../../components/uielements/table';

import { getSwapData } from '../utils';
import { SwapTableRowType, SwapCardType } from './types';
import * as midgardActions from '../../../redux/midgard/actions';
import { PriceDataIndex, PoolDataMap } from '../../../redux/midgard/types';
import { FixmeType, Maybe, ViewType, Nothing  } from '../../../types/bepswap';

import { ContentWrapper, ActionHeader } from './SwapView.style';
import { getCreatePoolTokens } from '../../Pool/utils';
import { getTickerFormat } from '../../../helpers/stringHelper';
import { getAppContainer } from '../../../helpers/elementHelper';
import { RootState } from '../../../redux/store';
import { AssetData, User } from '../../../redux/wallet/types';
import { getAssetFromString } from '../../../redux/midgard/utils';
import { PoolInfoType } from '../../Pool/types';
import { PoolDetailStatusEnum } from '../../../types/generated/midgard/api';
import PoolFilter from '../../../components/poolFilter';


type ComponentProps = {};

type ConnectedProps = {
  history: H.History;
  pools: string[];
  poolData: PoolDataMap;
  priceIndex: PriceDataIndex;
  assetData: AssetData[];
  basePriceAsset: string;
  loading: boolean;
  getPools: typeof midgardActions.getPools;
  user: Maybe<User>;
};

type Props = ComponentProps & ConnectedProps;

const SwapView: React.FC<Props> = (props): JSX.Element => {
  const {
    pools,
    poolData,
    priceIndex,
    loading,
    getPools,
    user,
    assetData,
  } = props;

  const wallet: Maybe<string> = user ? user.wallet : Nothing;

  const [poolStatus, selectPoolStatus] = useState<PoolDetailStatusEnum>(
    PoolDetailStatusEnum.Enabled,
  );

  useEffect(() => {
    getPools();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet]);

  const handleNewPool = () => {
    // const { assetData, pools } = this.props;

    // const wallet = user ? user.wallet : null;

    if (!wallet) {
      notification.warning({
        message: 'Create Pool Failed',
        description: 'Please connect your wallet to add a new pool.',
        getContainer: getAppContainer,
      });
    } else {
      console.log(assetData);
      const possibleTokens = getCreatePoolTokens(assetData, pools);
      console.log(possibleTokens);
      if (possibleTokens.length) {
        const symbol = possibleTokens[0].asset;
        if (getTickerFormat(symbol) !== 'rune') {
          const URL = `/pool/${symbol}/new`;
          props.history.push(URL);
        }
      } else {
        notification.warning({
          message: 'Create Pool Failed',
          description: 'You cannot create a new pool.',
          getContainer: getAppContainer,
        });
      }
    }
  };

  const renderSwapTable = (
    swapViewData: SwapTableRowType[],
    view: ViewType,
  ) => {
    const btnCol = {
      key: 'swap',
      // width: '30%',
      title: (
        <ActionHeader>
          <Button onClick={getPools} typevalue="outline">
            <SyncOutlined />
            refresh
          </Button>
        </ActionHeader>
      ),
      render: (text: string, record: SwapTableRowType) => {
        const {
          pool: { asset, target },
        } = record;
        const URL = `/swap/${asset.toLowerCase()}-${target.toLowerCase()}`;
        const dataTest = `swap-button-${target.toLowerCase()}`;

        const URL_stake = `/pool/${asset.toUpperCase()}`;
        const dataTest_stake = `stake-button-${asset.toLowerCase()}`;

        return (
          <div>
            <Row>
              <Col xs={12}>
                <Link to={URL_stake}>
                  <Button
                    style={{ margin: 'auto' }}
                    round="true"
                    typevalue="outline"
                    data-test={dataTest_stake}
                  >
                    <DatabaseOutlined />
                    stake
                  </Button>
                </Link>
              </Col>
              <Col xs={12}>
                <Link to={URL}>
                  <Button
                    style={{ margin: 'auto' }}
                    round="true"
                    data-test={dataTest}
                    disabled={poolStatus === PoolDetailStatusEnum.Bootstrapped}
                  >
                    <SwapOutlined />
                    swap
                  </Button>
                </Link>
              </Col>
            </Row>
          </div>
        );
      },
    };

    const mobileColumns = [
      {
        key: 'pool',
        title: 'pool',
        dataIndex: 'pool',
        render: ({ asset, target }: PoolInfoType) => (
          <CoinPair from={asset} to={target} />
        ),
      },
      btnCol,
    ];

    const desktopColumns = [
      {
        key: 'pool',
        title: 'pool',
        dataIndex: 'pool',
        render: ({ target }: PoolInfoType) => (
          // <div style={{ marginLeft:'20px' }}>
          //   <CoinIcon type={target} />
          // </div>
          <Row>
            <Col
              xs={24}
              style={{ display: 'flex',
          alignItems: 'center',
          justifyContent: 'center' }}
            >
              <CoinIcon type={target} />
            </Col>
          </Row>

        ),
      },
      {
        key: 'asset',
        title: 'asset',
        dataIndex: 'pool',
        render: ({ target }: { target: string }) => <p>{target}</p>,
        sorter: (a: SwapTableRowType, b: SwapTableRowType) =>
          a.pool.target.localeCompare(b.pool.target),
        sortDirections: ['descend', 'ascend'],
      },
      {
        key: 'poolprice',
        title: 'pool price',
        dataIndex: 'poolPrice',
        sorter: (a: SwapTableRowType, b: SwapTableRowType) =>
          a.raw.poolPrice.minus(b.raw.poolPrice),
        sortDirections: ['descend', 'ascend'],
        defaultSortOrder: 'descend',
      },
      {
        key: 'depth',
        title: 'depth',
        dataIndex: 'depth',
        sorter: (a: SwapTableRowType, b: SwapTableRowType) =>
          a.raw.depth.minus(b.raw.depth),
        sortDirections: ['descend', 'ascend'],
      },
      {
        key: 'vol',
        title: '24h vol',
        dataIndex: 'volume',
        sorter: (a: SwapTableRowType, b: SwapTableRowType) =>
          a.raw.volume.minus(b.raw.volume),
        sortDirections: ['descend', 'ascend'],
      },
      // {
      //   key: 'slip',
      //   title: 'avg. slip',
      //   dataIndex: 'slip',
      //   render: (slip: string) => <Trend amount={bn(slip)} />,
      //   sorter: (a: SwapTableRowType, b: SwapTableRowType) =>
      //     a.raw.slip.minus(b.raw.slip),
      //   sortDirections: ['descend', 'ascend'],
      // },
      // {
      //   key: 'roiAT',
      //   title: 'historical ROI',
      //   dataIndex: 'roiAT',
      //   sorter: (a: SwapTableRowType, b: SwapTableRowType) => a.raw.roiAT - b.raw.roiAT,
      //   sortDirections: ['descend', 'ascend'],
      // },
      btnCol,
    ];

    const columnData: { desktop: FixmeType; mobile: FixmeType } = {
      desktop: desktopColumns,
      mobile: mobileColumns,
    };
    const columns = columnData[view] || desktopColumns;

    return (
      <Table
        columns={columns}
        dataSource={swapViewData}
        loading={loading}
        rowKey="key"
      />
    );
  };

  const renderSwapList = (view: ViewType) => {
    let key = 0;
    const swapViewData = pools.reduce((result: FixmeType[], pool) => {
      const { symbol } = getAssetFromString(pool);
      const poolInfo = symbol ? poolData[symbol] : Nothing;

      const swapCardData: Maybe<SwapCardType> = getSwapData(
        'rune',
        poolInfo,
        priceIndex,
      );

      if (swapCardData) {
        result.push({
          ...swapCardData,
          key,
          status: poolInfo?.status ?? Nothing,
        });
        key += 1;
      }

      return result;
    }, []);

    const filteredData = swapViewData.filter(
      poolData => poolData.status === poolStatus,
    );

    return renderSwapTable(filteredData, view);
  };


  return (
    <ContentWrapper className="swap-view-wrapper">
      <PoolFilter selected={poolStatus} onClick={selectPoolStatus} />
      <div className="swap-list-view desktop-view">
        {renderSwapList(ViewType.DESKTOP)}
      </div>
      <div className="swap-list-view mobile-view">
        {renderSwapList(ViewType.MOBILE)}
      </div>
      <div className="add-new-pool" onClick={handleNewPool}>
        <AddIcon />
        <Label size="normal" weight="bold" color="normal">
          ADD NEW POOL
        </Label>
      </div>
    </ContentWrapper>
  );
};

export default compose(
  connect(
    (state: RootState) => ({
      pools: state.Midgard.pools,
      poolData: state.Midgard.poolData,
      priceIndex: state.Midgard.priceIndex,
      basePriceAsset: state.Midgard.basePriceAsset,
      loading: state.Midgard.poolLoading,
      user: state.Wallet.user,
    }),
    {
      getPools: midgardActions.getPools,
    },
  ),
  withRouter,
)(SwapView) as React.FC<ComponentProps>;
