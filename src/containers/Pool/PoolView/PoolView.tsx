import React from 'react';
import * as H from 'history';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import { notification } from 'antd';
import { SyncOutlined, DatabaseOutlined } from '@ant-design/icons';

import Label from '../../../components/uielements/label';
import AddIcon from '../../../components/uielements/addIcon';
import CoinPair from '../../../components/uielements/coins/coinPair';
import Table from '../../../components/uielements/table';
import Button from '../../../components/uielements/button';
import PoolFilter from '../../../components/poolFilter';

import { ContentWrapper, ActionHeader } from './PoolView.style';
import { getCreatePoolTokens, getPoolData } from '../utils';
import { PoolData } from '../types';
import { getTickerFormat } from '../../../helpers/stringHelper';
import { getAppContainer } from '../../../helpers/elementHelper';
import * as midgardActions from '../../../redux/midgard/actions';
import { RootState } from '../../../redux/store';
import { AssetData, User } from '../../../redux/wallet/types';
import { PoolDataMap, PriceDataIndex } from '../../../redux/midgard/types';
import { getAssetFromString } from '../../../redux/midgard/utils';
import { ViewType, Maybe } from '../../../types/bepswap';
import { PoolDetailStatusEnum } from '../../../types/generated/midgard/api';

type ComponentProps = {
  loading: boolean;
};
type ConnectedProps = {
  history: H.History;
  getPools: typeof midgardActions.getPools;
  pools: string[];
  poolData: PoolDataMap;
  basePriceAsset: string;
  priceIndex: PriceDataIndex;
  assetData: AssetData[];
  user: Maybe<User>;
};

type State = {
  poolStatus: PoolDetailStatusEnum;
};

type Props = ComponentProps & ConnectedProps;

class PoolView extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      poolStatus: PoolDetailStatusEnum.Enabled,
    };
  }

  componentDidMount() {
    const { getPools } = this.props;
    getPools();
  }

  selectPoolStatus = (poolStatus: PoolDetailStatusEnum) => {
    this.setState({
      poolStatus,
    });
  };

  handleNewPool = () => {
    const { assetData, pools, user } = this.props;

    const wallet = user ? user.wallet : null;

    if (!wallet) {
      notification.warning({
        message: 'Create Pool Failed',
        description: 'Please connect your wallet to add a new pool.',
        getContainer: getAppContainer,
      });
    } else {
      const possibleTokens = getCreatePoolTokens(assetData, pools);
      if (possibleTokens.length) {
        const symbol = possibleTokens[0].asset;
        if (getTickerFormat(symbol) !== 'rune') {
          const URL = `/pool/${symbol}/new`;
          this.props.history.push(URL);
        }
      } else {
        notification.warning({
          message: 'Create Pool Failed',
          description: 'You don\'t have available asset to create a new pool.',
          getContainer: getAppContainer,
        });
      }
    }
  };

  renderPoolTable = (poolViewData: PoolData[], view: ViewType) => {
    const { getPools, loading } = this.props;

    const buttonCol = {
      key: 'stake',
      title: (
        <ActionHeader>
          <Button
            onClick={() => {
              getPools();
            }}
            typevalue="outline"
          >
            <SyncOutlined />
            refresh
          </Button>
        </ActionHeader>
      ),
      render: (text: string, record: PoolData) => {
        const { target: symbol } = record;
        if (symbol) {
          const URL = `/pool/${symbol.toUpperCase()}`;
          const dataTest = `stake-button-${symbol.toLowerCase()}`;

          return (
            <Link to={URL}>
              <Button
                style={{ margin: 'auto' }}
                round="true"
                data-test={dataTest}
              >
                <DatabaseOutlined />
                stake
              </Button>
            </Link>
          );
        }
      },
    };

    const mobileColumns = [
      {
        key: 'pool',
        title: 'pool',
        dataIndex: 'pool',
        render: ({ asset, target }: { asset: string; target: string }) => (
          <CoinPair from={asset} to={target} />
        ),
      },
      buttonCol,
    ];
    const desktopColumns = [
      {
        key: 'pool',
        title: 'pool',
        dataIndex: 'pool',
        render: ({ asset, target }: { asset: string; target: string }) => (
          <CoinPair from={asset} to={target} />
        ),
      },
      {
        key: 'asset',
        title: 'asset',
        dataIndex: 'pool',
        render: ({ target }: { target: string }) => <p>{target}</p>,
        sorter: (a: PoolData, b: PoolData) => a.target.localeCompare(b.target),
        sortDirections: ['descend', 'ascend'],
      },
      {
        key: 'poolprice',
        title: 'pool price',
        dataIndex: ['values', 'poolPrice'],
        sorter: (a: PoolData, b: PoolData) => a.poolPrice.minus(b.poolPrice),
        sortDirections: ['descend', 'ascend'],
        defaultSortOrder: 'descend',
      },
      {
        key: 'depth',
        title: 'depth',
        dataIndex: ['values', 'depth'],
        sorter: (a: PoolData, b: PoolData) =>
          a.depth.amount().minus(b.depth.amount()),
        sortDirections: ['descend', 'ascend'],
      },
      {
        key: 'volume24',
        title: '24h vol',
        dataIndex: ['values', 'volume24'],
        sorter: (a: PoolData, b: PoolData) =>
          a.volume24.amount().minus(b.volume24.amount()),
        sortDirections: ['descend', 'ascend'],
      },
      buttonCol,
    ];

    const columnData = {
      desktop: desktopColumns,
      mobile: mobileColumns,
    };
    const columns = columnData[view] || desktopColumns;

    return (
      <Table
        columns={columns}
        dataSource={poolViewData}
        loading={loading}
        rowKey="key"
      />
    );
  };

  renderPoolList = (view: ViewType) => {
    const { pools, poolData, priceIndex } = this.props;
    const { poolStatus } = this.state;

    const poolViewData = pools.map((poolName, index) => {
      const { symbol = '' } = getAssetFromString(poolName);

      const poolInfo = poolData[symbol] || {};

      const poolDataDetail: PoolData = getPoolData(
        'rune',
        poolInfo,
        priceIndex,
      );

      return {
        ...poolDataDetail,
        status: poolInfo?.status ?? null,
        key: index,
      };
    });

    const filteredData = poolViewData.filter(
      poolData => poolData.status === poolStatus,
    );

    return this.renderPoolTable(filteredData, view);
  };

  render() {
    const { poolStatus } = this.state;

    return (
      <ContentWrapper className="pool-view-wrapper">
        <PoolFilter selected={poolStatus} onClick={this.selectPoolStatus} />
        <div className="pool-list-view desktop-view">
          {this.renderPoolList(ViewType.DESKTOP)}
        </div>
        <div className="pool-list-view mobile-view">
          {this.renderPoolList(ViewType.MOBILE)}
        </div>
        <div className="add-new-pool" onClick={this.handleNewPool}>
          <AddIcon />
          <Label size="normal" weight="bold" color="normal">
            ADD NEW POOL
          </Label>
        </div>
      </ContentWrapper>
    );
  }
}

export default compose(
  connect(
    (state: RootState) => ({
      pools: state.Midgard.pools,
      poolData: state.Midgard.poolData,
      loading: state.Midgard.poolLoading,
      priceIndex: state.Midgard.priceIndex,
      basePriceAsset: state.Midgard.basePriceAsset,
      assetData: state.Wallet.assetData,
      user: state.Wallet.user,
    }),
    {
      getPools: midgardActions.getPools,
    },
  ),
  withRouter,
)(PoolView) as React.ComponentClass<ComponentProps, State>;
