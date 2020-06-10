import React, { useMemo, useCallback } from 'react';
import { connect } from 'react-redux';
import { Link, useHistory, useRouteMatch } from 'react-router-dom';
import {
  SwapOutlined,
  DatabaseFilled,
  WalletOutlined,
} from '@ant-design/icons';

import * as RD from '@devexperts/remote-data-ts';
import Tabs from '../uielements/tabs';
import Logo from '../uielements/logo';

import { StyledHeader, LogoWrapper, HeaderActionButtons } from './header.style';
import HeaderSetting from './headerSetting';
import WalletDrawer from '../../containers/WalletView/WalletDrawer';

import ThemeSwitch from '../uielements/themeSwitch';
import WalletButton from '../uielements/walletButton';
import BasePriceSelector from './basePriceSelector';
import { Maybe, Nothing } from '../../types/bepswap';
import { RootState } from '../../redux/store';
import { User } from '../../redux/wallet/types';

const { TabPane } = Tabs;

enum TAB_KEY {
  SWAP = 'swap',
  POOLS = 'pools',
}

type ConnectedProps = {
  user: Maybe<User>;
  midgardBasePath: Maybe<string>;
};

type ComponentProps = {
  title: string;
};

type Props = ConnectedProps & ComponentProps;

const Header: React.FC<Props> = (props: Props): JSX.Element => {
  const { user, midgardBasePath } = props;
  const wallet: Maybe<string> = user ? user.wallet : Nothing;
  const history = useHistory();

  const matchSwap = useRouteMatch('/swap');
  const matchPools = useRouteMatch('/pools');
  const matchPool = useRouteMatch('/pool');

  const activeKey: Maybe<TAB_KEY> = useMemo(() => {
    if (matchSwap) {
      return TAB_KEY.SWAP;
    } else if (matchPools || matchPool) {
      return TAB_KEY.POOLS;
    } else {
      return Nothing;
    }
  }, [matchPool, matchPools, matchSwap]);

  const handleChangeTab = useCallback(
    (key: TAB_KEY) => {
      if (key === TAB_KEY.SWAP) {
        history.push('/swap');
      } else if (key === TAB_KEY.POOLS) {
        history.push('/pools');
      }
    },
    [history],
  );

  const renderHeader = useMemo(() => {
    const swapTab = (
      <span>
        <SwapOutlined />
        swap
      </span>
    );
    const poolsTab = (
      <span>
        <DatabaseFilled />
        stake
      </span>
    );

    return (
      <div className="header-tab-container">
        <Tabs
          data-test="action-tabs"
          activeKey={activeKey}
          action
          onChange={handleChangeTab}
        >
          <TabPane tab={swapTab} key={TAB_KEY.SWAP} />
          <TabPane tab={poolsTab} key={TAB_KEY.POOLS} />
        </Tabs>
      </div>
    );
  }, [activeKey]);

  return (
    <StyledHeader>
      <LogoWrapper>
        <Link to="/">
          <Logo name="bepswap" type="long" />
        </Link>
        <HeaderSetting midgardBasePath={midgardBasePath} />
      </LogoWrapper>
      {renderHeader}
      <HeaderActionButtons>
        {!wallet && (
          <Link to="/connect">
            <WalletButton
              data-test="add-wallet-button"
              connected={false}
              address={wallet}
            />
          </Link>
        )}
        {!wallet && (
          <Link to="/connect">
            <div className="wallet-mobile-btn">
              <WalletOutlined />
            </div>
          </Link>
        )}
        {wallet && <WalletDrawer />}
        <ThemeSwitch />
        <BasePriceSelector />
      </HeaderActionButtons>
    </StyledHeader>
  );
};

export default connect((state: RootState) => ({
  user: state.Wallet.user,
  midgardBasePath: RD.toNullable(state.Midgard.apiBasePath),
}))(Header);
