import { getTickerFormat } from './stringHelper';
import { Nothing, Maybe } from '../types/bepswap';
import { AssetData } from '../redux/wallet/types';

export const getAssetFromAssetData = (
  assetData: AssetData[],
  source: Maybe<string>,
): Maybe<AssetData> => {
  if (!source) {
    return Nothing;
  }
  return assetData.reduce((acc, data) => {
    const { asset } = data;
    if (!acc) {
      const tokenName = getTickerFormat(asset);
      if (tokenName && tokenName === source.toLowerCase()) {
        return data;
      }
    }
    return acc;
  }, Nothing as Maybe<AssetData>);
};
