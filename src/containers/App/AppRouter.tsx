import React from 'react';
import { Route, Switch } from 'react-router-dom';

import asyncComponent from '../../helpers/AsyncFunc';

type AppRoute = {
  path: string;
  exact?: boolean;
  component: ReturnType<typeof asyncComponent>;
};

const routes: AppRoute[] = [
  {
    path: '',
    component: asyncComponent(() => import('../pages/Swap/SwapLanding')),
  },
  {
    path: 'swap/:info',
    component: asyncComponent(() => import('../pages/Swap/SwapDetail')),
  },
  {
    path: 'swap/',
    component: asyncComponent(() => import('../pages/Swap/SwapLanding')),
  },
  {
    path: 'pools',
    component: asyncComponent(() => import('../pages/Pool/Pools')),
  },
  {
    path: 'pool/:symbol/:action?',
    component: asyncComponent(() => import('../pages/Pool')),
  },
  {
    path: 'connect',
    component: asyncComponent(() => import('../ConnectView')),
  },
  {
    path: 'faqs',
    component: asyncComponent(() => import('../FaqsView')),
  },
  {
    path: 'transaction',
    component: asyncComponent(() => import('../TransactionView')),
  },
];

type Props = {
  url: string;
};

const AppRouter: React.FC<Props> = (props: Props): JSX.Element => {
  const { url } = props;

  return (
    <div>
      <Switch>
        {routes.map(singleRoute => {
          const { path, exact = true, ...other } = singleRoute;
          return (
            <Route
              exact={exact}
              key={singleRoute.path}
              path={`${url}${singleRoute.path}`}
              {...other}
            />
          );
        })}
      </Switch>
    </div>
  );
};

export default AppRouter;
