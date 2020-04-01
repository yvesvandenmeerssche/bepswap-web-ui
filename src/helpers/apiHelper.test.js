import {
  getBinanceMainnetURL,
  getBinanceTestnetURL,
  getHeaders,
  getMidgardBasePathByIP,
} from './apiHelper';

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
});
