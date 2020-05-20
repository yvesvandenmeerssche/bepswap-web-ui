import {
  Token,
  TickerStatistics,
  Account,
  TxPage,
  OrderList,
  Market,
  WS,
} from '@thorchain/asgardex-binance';
import { RemoteData } from '@devexperts/remote-data-ts';
import { Maybe } from '../../types/bepswap';

export type TransferEventRD = RemoteData<Error, WS.TransferEvent>;

export type State = {
  tokenList: Token[];
  marketList: Market[];
  ticker: Maybe<TickerStatistics>;
  account: Maybe<Account>;
  accountSequence: Maybe<number>;
  transactions: Maybe<TxPage>;
  openOrders: Maybe<OrderList>;
  error: Maybe<Error>;
  loadingToken: boolean;
  loadingMarket: boolean;
  loadingTicker: boolean;
  wsError: Maybe<Error>;
  wsTransferEvent: TransferEventRD;
};
