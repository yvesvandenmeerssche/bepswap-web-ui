import React from 'react';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import BigNumber from 'bignumber.js';
import { util } from 'asgardex-common';
import Label from '../label';
import { TrendWrapper } from './trend.style';

type Props = {
  amount?: BigNumber;
};
const Trend: React.FC<Props> = (props: Props): JSX.Element => {
  const { amount = util.bn(0), ...otherProps } = props;
  const trend = util.isValidBN(amount) && amount.isGreaterThanOrEqualTo(0);
  const trendIcon = trend ? <ArrowUpOutlined /> : <ArrowDownOutlined />;
  const trendVal = `${util.formatBN(amount)}%`;

  return (
    <TrendWrapper trend={trend} {...otherProps}>
      {trendIcon}
      <Label>{trendVal}</Label>
    </TrendWrapper>
  );
};

export default Trend;
