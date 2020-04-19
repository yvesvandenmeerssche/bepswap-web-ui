import React from 'react';
import ContentLoader from 'react-content-loader';
import { palette } from 'styled-theme';

const TransactionLoader: React.FC = (): JSX.Element => (
  <ContentLoader
    className="transaction-loader"
    height={400}
    width="100%"
    speed={1}
    backgroundColor={palette('background', 2)}
    foregroundColor={palette('gray', 1)}
  >
    <rect x="0" y="10" rx="4" ry="4" width="100%" height="60" />
    <rect x="0" y="90" rx="4" ry="4" width="100%" height="60" />
    <rect x="0" y="170" rx="4" ry="4" width="100%" height="60" />
    <rect x="0" y="250" rx="4" ry="4" width="100%" height="60" />
    <rect x="0" y="330" rx="4" ry="4" width="100%" height="60" />
  </ContentLoader>
);

export default TransactionLoader;
