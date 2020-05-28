import { bn } from '@thorchain/asgardex-util';
import { tokenAmount } from '@thorchain/asgardex-token';
import { getAssetFromAssetData } from './walletHelper';
import { AssetData } from '../redux/wallet/types';

describe('walletHelper', () => {
  describe('getAssetFromAssetData', () => {
    const tusdb: AssetData = {
      asset: 'BNB.TUSDB-000',
      assetValue: tokenAmount(1),
      price: bn(1),
    };
    const bnb: AssetData = {
      asset: 'BNB.BNB',
      assetValue: tokenAmount(1),
      price: bn(1),
    };
    const lok: AssetData = {
      asset: 'BNB.LOK-3C0',
      assetValue: tokenAmount(1),
      price: bn(1),
    };
    it('returns source of LOK', () => {
      expect(getAssetFromAssetData([tusdb, bnb, lok], 'LOK')).toEqual(lok);
    });
    it('returns source of BNB', () => {
      expect(getAssetFromAssetData([tusdb, bnb, lok], 'bnb')).toEqual(bnb);
    });
    it('returns Nothing if source is empty', () => {
      expect(getAssetFromAssetData([tusdb, bnb], '')).toBeNothing();
    });
    it('returns Nothing if source is not avaiable in list of assets', () => {
      expect(getAssetFromAssetData([tusdb, bnb], 'LOK-3C0')).toBeNothing();
    });
    it('returns Nothing for an empty list of assets', () => {
      expect(getAssetFromAssetData([], 'LOK-3C0')).toBeNothing();
    });
  });
});
