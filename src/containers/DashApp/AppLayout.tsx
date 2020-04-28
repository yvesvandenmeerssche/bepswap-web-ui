import React, { ReactNode, useEffect } from 'react';
import { Layout, notification } from 'antd';
import { connect } from 'react-redux';
import * as RD from '@devexperts/remote-data-ts';
import { RootState } from '../../redux/store';
import { ApiBasePathRD } from '../../redux/midgard/types';
import { Maybe } from '../../types/bepswap';

type ComponentProps = {
  children?: ReactNode;
  'data-test': string;
};

type ConnectedProps = {
  midgardBasePath: ApiBasePathRD;
  wsError: Maybe<Error>;
};

type Props = ComponentProps & ConnectedProps;

const AppLayout: React.FC<Props> = (props: Props): JSX.Element => {
  const { children, 'data-test': dataTest, midgardBasePath, wsError } = props;

  useEffect(() => {
    const ignore = () => {};
    const onFailure = (error: Error) => {
      notification.error({
        message: 'Byzantine Error',
        description: `Getting base path for Midgard API failed. ${error?.toString() ??
          ''}`,
        duration: 10,
      });
    };
    RD.fold(ignore, ignore, onFailure, ignore)(midgardBasePath);
  }, [midgardBasePath]);

  useEffect(() => {
    if (wsError) {
      notification.error({
        message: 'Binance Websocket Error',
        description: `${wsError?.toString() ?? ''}`,
        duration: 10,
      });
    }
  }, [wsError]);

  return <Layout data-test={dataTest}>{children}</Layout>;
};

export default connect(
  (state: RootState) => ({
    midgardBasePath: state.Midgard.apiBasePath,
    wsError: state.Binance.wsError,
  }),
  {},
)(AppLayout);
