import axios, { AxiosResponse, Method } from 'axios';
import { DefaultApi } from '../types/generated/midgard';

export const BINANCE_TESTNET_URL =
  process.env.REACT_APP_BINANCE_TESTNET_URL ||
  'https://testnet-dex.binance.org/api/v1';

export const BINANCE_MAINNET_URL =
  process.env.REACT_APP_BINANCE_MAINNET_URL || 'https://dex.binance.org/api/v1';

export const MIDGARD_DEV_API_DEV_IP =
  process.env.REACT_APP_MIDGARD_DEV_API_DEV_IP || '159.89.252.210';

export const TESTNET_TX_BASE_URL = 'https://testnet-explorer.binance.org/tx/';

export const TESTNET_SEED_URL =
  process.env.REACT_APP_TESTNET_SEED_URL ||
  'https://testnet-seed.thorchain.info';

export const getBinanceTestnetURL = (url: string) =>
  `${BINANCE_TESTNET_URL}/${url}`;
export const getBinanceMainnetURL = (url: string) =>
  `${BINANCE_MAINNET_URL}/${url}`;

const defaultAxios = axios.create();

export const axiosRequest = defaultAxios.request;

export const getHeaders = () => ({
  Accept: 'application/json',
  'Content-Type': 'application/json',
});

export type TestnetSeed = {
  active: string[];
  standby: string[];
  ready: string[];
  whitelisted: string[];
};

/**
 * Helper to create basePath for Midgard by a givven IP
 */
export const getMidgardBasePathByIP = (ip: string) => `http://${ip}:8080`;

/**
 * Helper to get basePath for Midgard
 */
export const getMidgardBasePath = async (
  isTestnet: boolean,
  defaultIP = MIDGARD_DEV_API_DEV_IP,
) => {
  // On testnet we need to load IP from testnet seed
  if (isTestnet) {
    try {
      const response: AxiosResponse<TestnetSeed> = await axiosRequest({
        method: 'get' as Method,
        url: TESTNET_SEED_URL,
        headers: getHeaders(),
      });
      const activeList = response?.data?.active;
      if (activeList && activeList[0]) {
        return getMidgardBasePathByIP(activeList[0]);
      } else {
        return Promise.reject(
          new Error(`Could not parse 'active' IP from response: ${response}`),
        );
      }
    } catch (error) {
      return Promise.reject(
        new Error(
          `Could not load seed data from testnet seed url: ${TESTNET_SEED_URL}`,
        ),
      );
    }
  } else {
    return Promise.resolve(getMidgardBasePathByIP(defaultIP));
  }
};
/**
 * Helper to get `DefaultApi` instance for Midgard
 */
export const getMidgardDefaultApi = (basePath: string) =>
  new DefaultApi({ basePath });
