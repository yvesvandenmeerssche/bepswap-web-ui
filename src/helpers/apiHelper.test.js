import {
  Protocol,
  getBinanceMainnetURL,
  getBinanceTestnetURL,
  getHeaders,
  getMidgardBasePathByIP,
  getHostnameFromUrl,
  getMidgardBasePath,
  axiosRequest,
} from './apiHelper';

jest.mock('axios', () => ({
  create: jest.fn(() => ({
    request: jest.fn(() => {}),
  })),
}));

describe('helpers/apiHelper', () => {
  describe('getBinanceTestnetURL', () => {
    it('should return a valid value', () => {
      const result = getBinanceTestnetURL('tokens?limit=100');
      expect(result).toEqual(
        'https://testnet-dex.binance.org/api/v1/tokens?limit=100',
      );
    });
  });
  describe('getBinanceMainnetURL', () => {
    it('should return a valid value', () => {
      const result = getBinanceMainnetURL('tokens?limit=100');
      expect(result).toEqual('https://dex.binance.org/api/v1/tokens?limit=100');
    });
  });
  describe('getMidgardBasePathByIP', () => {
    it('should return a valid value', () => {
      const result = getMidgardBasePathByIP('121.0.0.1');
      expect(result).toEqual('http://121.0.0.1:8080');
    });
  });
  describe('getHeaders', () => {
    it('should return valid values', () => {
      const result = getHeaders('application/json', 'application/json');
      expect(result).toEqual({
        Accept: 'application/json',
        'Content-Type': 'application/json',
      });
    });
  });
  describe('getMidgardBasePathByIP', () => {
    it('creates a http base path ', () => {
      const result = getMidgardBasePathByIP('121.0.0.1', Protocol.HTTP);
      expect(result).toEqual('http://121.0.0.1:8080');
    });
    it('creates a https base path ', () => {
      const result = getMidgardBasePathByIP('121.0.0.3', Protocol.HTTPS);
      expect(result).toEqual('https://121.0.0.3:8080');
    });
  });
  describe('getHostnameFromUrl', () => {
    it('parses ip from url', () => {
      const result = getHostnameFromUrl('http://121.0.0.1:8080');
      expect(result).toEqual('121.0.0.1');
    });
    it('parses hostname from url', () => {
      const result = getHostnameFromUrl(
        'https://testnet-dex.binance.org/api/v1/tokens',
      );
      expect(result).toEqual('testnet-dex.binance.org');
    });
    it('returns Nothing if parsing failed', () => {
      const result = getHostnameFromUrl('any-invalid-url');
      expect(result).toBeNothing();
    });
  });
  describe('getMidgardBasePath', () => {
    afterEach(() => {
      // axiosRequest has been mocked, it needs to be reset
      axiosRequest.mockReset();
    });
    it('on other then testnet it returns a basepath for a given ip', async () => {
      await expect(getMidgardBasePath(false, '121.0.0.1')).resolves.toEqual(
        'http://121.0.0.1:8080',
      );
    });
    it('on testnet it returns a basepath loaded from seed', async () => {
      const response = { data: { active: ['1.2.3.4'] } };
      response;
      axiosRequest.mockImplementationOnce(() => Promise.resolve(response));

      await expect(getMidgardBasePath(true)).resolves.toEqual(
        'https://1.2.3.4:8080',
      );
    });
    it('on testnet it rejects if no data available', async () => {
      const response = {};
      axiosRequest.mockImplementationOnce(() => Promise.resolve(response));
      await expect(getMidgardBasePath(true)).rejects.toBeInstanceOf(Error);
    });
    it('on testnet it rejects if no active data available', async () => {
      const response = { data: { active: [] } };
      axiosRequest.mockImplementationOnce(() => Promise.resolve(response));
      await expect(getMidgardBasePath(true)).rejects.toThrow();
    });
    it('on testnet it rejects if requests throws an error for any reason', async () => {
      axiosRequest.mockImplementationOnce(() =>
        Promise.reject(new Error('Request failed for any reason')),
      );
      await expect(getMidgardBasePath(true)).rejects.toThrow();
    });
  });
});
