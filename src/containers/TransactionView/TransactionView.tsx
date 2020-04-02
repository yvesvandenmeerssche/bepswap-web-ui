import React, { useState, useEffect, useCallback } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import * as RD from '@devexperts/remote-data-ts';
import { FormattedDate, FormattedTime } from 'react-intl';

import Table from '../../components/uielements/table';
import FilterDropdown from '../../components/filterDropdown';
import TxLabel from '../../components/transaction/txLabel';
import TxInfo from '../../components/transaction/txInfo';
import TransactionLoader from '../../components/utility/loaders/transaction';

import {
  ContentWrapper,
  StyledPagination,
  MobileColumeHeader,
} from './TransactionView.style';
import { TxDetails, InlineResponse200 } from '../../types/generated/midgard';
import { ViewType, Maybe } from '../../types/bepswap';

import * as midgardActions from '../../redux/midgard/actions';
import { TxDetailData, TxDetailType } from '../../redux/midgard/types';
import { User } from '../../redux/wallet/types';
import { RootState } from '../../redux/store';
import AddWallet from '../../components/uielements/addWallet';

type ComponentProps = {};

type ConnectedProps = {
  user: Maybe<User>;
  txData: TxDetailData;
  getTxByAddress: typeof midgardActions.getTxByAddress;
};

type Props = ComponentProps & ConnectedProps;

const Transaction: React.FC<Props> = (props): JSX.Element => {
  const { user, txData, getTxByAddress } = props;
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const limit = 5;
  const txTypesPair: { [key: string]: TxDetailType } = {
    swap: 'swap',
    stake: 'stake',
    withdraw: 'unstake',
  };

  useEffect(() => {
    const walletAddress = user?.wallet ?? null;

    if (walletAddress) {
      getTxByAddress({
        address: walletAddress,
        offset: page,
        limit,
        type: txTypesPair[filter],
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChangePage = useCallback(
    (page: number) => {
      setPage(page);

      const address = user?.wallet ?? null;
      if (address) {
        getTxByAddress({
          address,
          offset: (page - 1) * limit,
          limit,
          type: txTypesPair[filter],
        });
      }
    },
    [getTxByAddress, user],
  );

  const renderTxTable = (data: TxDetails[], view: ViewType) => {
    const filterCol = {
      key: 'filter',
      title: <FilterDropdown value={filter} onClick={setFilter} />,
      render: (text: string, rowData: TxDetails) => {
        const { type } = rowData;

        return <TxLabel type={type} />;
      },
    };

    const desktopColumns = [
      filterCol,
      {
        key: 'history',
        title: 'history',
        render: (text: string, rowData: TxDetails) => {
          return <TxInfo data={rowData} />;
        },
      },
      {
        key: 'date',
        title: 'date',
        render: (text: string, rowData: TxDetails) => {
          const { date: timestamp = 0 } = rowData;
          const date = new Date(timestamp * 1000);
          return (
            <>
              <FormattedDate
                value={date}
                year="numeric"
                month="long"
                day="2-digit"
              />{' '}
              <FormattedTime
                value={date}
                hour="numeric"
                minute="numeric"
                second="numeric"
              />
            </>
          );
        },
      },
    ];

    const mobileColumns = [
      {
        key: 'history',
        title: (
          <MobileColumeHeader>
            <div className="mobile-col-title">history</div>
            <div className="mobile-col-filter">
              <FilterDropdown value={filter} onClick={setFilter} />
            </div>
          </MobileColumeHeader>
        ),
        render: (_: string, rowData: TxDetails) => {
          const { type, date: timestamp = 0, in: _in } = rowData;
          const date = new Date(timestamp * 1000);

          return (
            <div className="tx-history-row">
              <div className="tx-history-data">
                <TxLabel type={type} />
                <div className="tx-history-detail">
                  <p>
                    <FormattedDate
                      value={date}
                      year="numeric"
                      month="2-digit"
                      day="2-digit"
                    />{' '}
                    <FormattedTime
                      value={date}
                      hour="2-digit"
                      minute="2-digit"
                      second="2-digit"
                      hour12={false}
                    />
                  </p>
                </div>
              </div>
              <div className="tx-history-info">
                <TxInfo data={rowData} />
              </div>
            </div>
          );
        },
      },
    ];

    const columns = view === ViewType.DESKTOP ? desktopColumns : mobileColumns;

    return (
      <Table
        columns={columns}
        dataSource={data}
        rowKey={(record: TxDetails, index: number) => index}
      />
    );
  };

  const pageContent = (data: TxDetails[], count: number) => {
    // const filteredData = data.filter(eventData => eventData.type === filter);

    return (
      <>
        <ContentWrapper className="transaction-view-wrapper desktop-view">
          {renderTxTable(data, ViewType.DESKTOP)}
        </ContentWrapper>
        <ContentWrapper className="transaction-view-wrapper mobile-view">
          {renderTxTable(data, ViewType.MOBILE)}
        </ContentWrapper>
        {count ? (
          <StyledPagination
            current={page}
            onChange={handleChangePage}
            pageSize={limit}
            total={count}
          />
        ) : (
          ''
        )}
      </>
    );
  };

  const renderPage = () => {
    const walletAddress = user?.wallet ?? null;

    if (walletAddress) {
      return RD.fold(
        () => <div />, // initial
        () => <TransactionLoader />,
        (error: Error) => (
          <ContentWrapper className="transaction-view-wrapper center-align">
            <h2>Loading history data failed.</h2>
            {error && <p>{error.toString()}</p>}
          </ContentWrapper>
        ),
        (data: InlineResponse200): JSX.Element => {
          const { count, txs } = data;
          console.log(txs, count);
          return pageContent(txs || [], count || 0);
        },
      )(txData);
    } else {
      return (
        <ContentWrapper className="transaction-view-wrapper center-align">
          <AddWallet />
        </ContentWrapper>
      );
    }
  };

  return renderPage();
};

export default compose(
  connect(
    (state: RootState) => ({
      user: state.Wallet.user,
      txData: state.Midgard.txData,
    }),
    {
      getTxByAddress: midgardActions.getTxByAddress,
    },
  ),
)(Transaction) as React.FC<ComponentProps>;
