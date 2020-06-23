import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { Row, Col } from 'antd';
import Tabs from '../../components/uielements/tabs';
import { ContentWrapper } from './ConnectView.style';

import Keystore from './Keystore';
import WalletConnect from './WalletConnect';
import Ledger from './Ledger';

import * as midgardActions from '../../redux/midgard/actions';

const { TabPane } = Tabs;

type TAB_TYPE = 'WALLET' | 'LEDGER' | 'KEYSTORE';
const TAB_VALUES: {
  [key in TAB_TYPE]: TAB_TYPE;
} = {
  WALLET: 'WALLET',
  LEDGER: 'LEDGER',
  KEYSTORE: 'KEYSTORE',
};

type Props = {
  getPools: typeof midgardActions.getPools;
};

const ConnectView: React.FC<Props> = (props: Props): JSX.Element => {
  const { getPools } = props;
  const [active, setActive] = useState<TAB_TYPE>(TAB_VALUES.KEYSTORE);

  useEffect(() => {
    getPools();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tabs = [
    {
      label: 'wallet connect',
      value: TAB_VALUES.WALLET,
      comp: <WalletConnect {...props} />,
    },
    {
      label: 'ledger',
      value: TAB_VALUES.LEDGER,
      comp: <Ledger {...props} />,
    },
    {
      label: 'keystore file',
      value: TAB_VALUES.KEYSTORE,
      comp: <Keystore {...props} />,
    },
  ];

  const selected = tabs.find(tab => tab.value === active) || tabs[0];

  return (
    <ContentWrapper>
      <Row className="connect-view-header">
        <Tabs
          className="connect-view-tab"
          activeKey={active}
          onChange={setActive}
          action
        >
          {tabs.map(tab => {
            return (
              <TabPane
                key={tab.value}
                tab={tab.label}
                disabled={
                  tab.value === TAB_VALUES.WALLET ||
                  tab.value === TAB_VALUES.LEDGER
                }
              />
            );
          })}
        </Tabs>
      </Row>
      <Row className="connect-view-content">
        <Col className="connect-view-content-form" xs={24}>
          {selected.comp}
        </Col>
      </Row>
    </ContentWrapper>
  );
};

export default connect(null, {
  getPools: midgardActions.getPools,
})(ConnectView);