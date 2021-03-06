import { crypto } from '@binance-chain/javascript-sdk';
import { Coin, SignedSend } from '@binance-chain/javascript-sdk/lib/types';
import {
  TokenAmount,
  BaseAmount,
  tokenAmount,
  tokenToBase,
} from '@thorchain/asgardex-token';
import base64js from 'base64-js';

import { FixmeType, Maybe } from 'types/bepswap';

import { CHAIN_ID } from '../../env';
import { getSwapMemo, getWithdrawMemo, getStakeMemo } from '../memoHelper';
import { BncResponse } from './types';

// TODO: implement the exact types and remove all FixmeTypes

const NETWORK_ID = 714;
const RUNE = 'RUNE-B1A'; // RUNE symbol in the mainnet

type SendTrustSignedTxParams = {
  walletConnect: FixmeType;
  bncClient: FixmeType;
  walletAddress: string;
  sendOrder: Maybe<SignedSend>;
  memo: string;
};

/** Reference link
 * https://developer.trustwallet.com/wallet-connect/dapp#sign-transaction
 * https://github.com/trustwallet/wallet-core/blob/master/src/proto/Binance.proto
 * https://docs.binance.org/guides/concepts/encoding/amino-example.html#transfer
 * https://github.com/binance-chain/javascript-sdk/blob/master/src/tx/index.ts
 * https://github.com/binance-chain/javascript-sdk/blob/master/src/types/msg/send.ts
 */
/**
 * Sign the Tx by trustwallet and send raw transaction using binance sdk
 * @param walletConnect wallet connect object
 * @param bncClient     binance client
 * @param walletAddress User wallet address
 * @param sendOrder     Order to be signed by trustwallet
 * @param memo          memo for tx
 */
export const sendTrustSignedTx = ({
  walletConnect,
  bncClient,
  walletAddress,
  sendOrder,
  memo = '',
}: SendTrustSignedTxParams) => {
  return new Promise((resolve, reject) => {
    if (walletConnect && bncClient && sendOrder && walletAddress) {
      bncClient
        .getAccount(walletAddress)
        .then((response: BncResponse) => {
          if (!response) {
            reject(Error('binance client getAccount error!'));
            return;
          }

          const account = response?.result;
          console.log('AccountInfo:', account);
          const tx: FixmeType = {
            accountNumber: account.account_number.toString(),
            chainId: CHAIN_ID,
            sequence: account.sequence.toString(),
            memo,
          };

          tx.send_order = sendOrder;

          walletConnect
            .trustSignTransaction(NETWORK_ID, tx)
            .then((result: FixmeType) => {
              console.log('Successfully signed stake tx msg:', result);
              bncClient
                .sendRawTransaction(result, true)
                .then((response: BncResponse) => {
                  console.log('Response', response);
                  resolve(response);
                })
                .catch((error: Error) => {
                  console.log('sendRawTransaction error: ', error);
                  reject(error);
                });
            })
            .catch((error: Error) => {
              console.log('trustSignTransaction error: ', error);

              reject(error);
            });
        })
        .catch((error: Error) => {
          console.log('getAccount error: ', error);

          reject(error);
        });
    } else {
      // eslint-disable-next-line prefer-promise-reject-errors
      reject(Error('Transaction Error'));
    }
  });
};

/** Reference
 * https://github.com/binance-chain/javascript-sdk/blob/aa1947b696/src/client/index.ts#L440
 */
export type GetSendOrderMsgParam = {
  fromAddress: string;
  toAddress: string;
  coins: Coin[];
};

const getByteArrayFromAddress = (address: string) => {
  return base64js.fromByteArray(crypto.decodeAddress(address));
};

export const getSendOrderMsg = ({
  fromAddress,
  toAddress,
  coins: Coin,
}: GetSendOrderMsgParam) => {
  // 1. sort denoms by alphabet order
  // 2. validate coins with zero amounts
  const coins: Coin[] = Coin.sort((a, b) =>
    a.denom.localeCompare(b.denom),
  ).filter(data => {
    return data.amount > 0;
  });

  // if coin data is invalid, return null
  if (!coins.length) {
    return null;
  }

  const msg: SignedSend = {
    inputs: [
      {
        address: getByteArrayFromAddress(fromAddress),
        coins,
      },
    ],
    outputs: [
      {
        address: getByteArrayFromAddress(toAddress),
        coins,
      },
    ],
  };

  return msg;
};

export type WithdrawRequestParam = {
  walletConnect: FixmeType;
  bncClient: FixmeType;
  walletAddress: string;
  poolAddress: string;
  symbol: string;
  percent: number;
};

/**
 * Send Withdraw tx signed by trustwallet
 * @param walletConnect wallet connect object
 * @param bncClient     binance client
 * @param walletAddress User wallet address
 * @param poolAddress   RUNE, TOKEN Pool address
 * @param symbol        SYMBOL of token to withdraw
 * @param percent       Percentage of tokens to withdraw from the pool
 */
export const withdrawRequestUsingWalletConnect = ({
  walletConnect,
  bncClient,
  walletAddress,
  poolAddress,
  symbol,
  percent,
}: WithdrawRequestParam) => {
  // Minimum amount to send memo on-chain
  const amount = tokenToBase(tokenAmount(0.00000001))
    .amount()
    .toNumber();

  const memo = getWithdrawMemo(symbol, percent * 100);

  // send 0.00000001 amount of BNB
  const coins: Coin[] = [
    {
      denom: 'BNB',
      amount,
    },
  ];

  const sendOrder = getSendOrderMsg({
    fromAddress: walletAddress,
    toAddress: poolAddress,
    coins,
  });

  return sendTrustSignedTx({
    walletConnect,
    bncClient,
    walletAddress,
    sendOrder,
    memo,
  });
};

type StakeRequestParam = {
  walletConnect: FixmeType;
  bncClient: FixmeType;
  walletAddress: string;
  runeAmount: TokenAmount;
  assetAmount: TokenAmount;
  poolAddress: string;
  symbol: string;
};

/**
 * Send stake tx signed by trustwallet
 * @param walletConnect wallet connect object
 * @param bncClient     binance client
 * @param walletAddress User wallet address
 * @param runeAmount    RUNE Amount to stake
 * @param assetAmount   TOKEN Amount to stake
 * @param poolAddress   RUNE, TOKEN Pool address
 * @param symbol        SYMBOL of token to stake
 */
export const stakeRequestUsingWalletConnect = ({
  walletConnect,
  bncClient,
  walletAddress,
  runeAmount,
  assetAmount,
  poolAddress,
  symbol,
}: StakeRequestParam) => {
  const memo = getStakeMemo(symbol);

  const runeAmountNumber = tokenToBase(runeAmount)
    .amount()
    .toNumber();
  const tokenAmountNumber = tokenToBase(assetAmount)
    .amount()
    .toNumber();

  const coins = [
    {
      denom: RUNE,
      amount: runeAmountNumber,
    },
    {
      denom: symbol,
      amount: tokenAmountNumber,
    },
  ];

  const sendOrder = getSendOrderMsg({
    fromAddress: walletAddress,
    toAddress: poolAddress,
    coins,
  });

  return sendTrustSignedTx({
    walletConnect,
    bncClient,
    walletAddress,
    sendOrder,
    memo,
  });
};

type SwapRequestParam = {
  walletConnect: FixmeType;
  bncClient: FixmeType;
  walletAddress: string;
  source: string;
  target: string;
  amount: TokenAmount;
  protectSlip: boolean;
  limit: BaseAmount;
  poolAddress: string;
  targetAddress: string;
};

/**
 * Send stake tx signed by trustwallet
 * @param walletConnect wallet connect object
 * @param bncClient     binance client
 * @param walletAddress User wallet address
 * @param source        symbol of source token
 * @param target        symbol of target token
 * @param amount        Token Amount to swap
 * @param protectSlip   slip protect value
 * @param limit         slip limit
 * @param poolAddress   RUNE, TOKEN Pool address
 * @param targetAddress target wallet address
 */
export const swapRequestUsingWalletConnect = ({
  walletConnect,
  bncClient,
  walletAddress,
  source,
  target,
  amount,
  protectSlip,
  limit,
  poolAddress,
  targetAddress = '',
}: SwapRequestParam) => {
  const limitValue = protectSlip && limit ? limit.amount().toString() : '';
  const memo = getSwapMemo(target, targetAddress, limitValue);
  const sourceAmount = tokenToBase(amount)
    .amount()
    .toNumber();

  const coins = [
    {
      denom: source,
      amount: sourceAmount,
    },
  ];

  const sendOrder = getSendOrderMsg({
    fromAddress: walletAddress,
    toAddress: poolAddress,
    coins,
  });

  return sendTrustSignedTx({
    walletConnect,
    bncClient,
    walletAddress,
    sendOrder,
    memo,
  });
};
