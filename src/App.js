import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { ThemeProvider } from 'styled-components';

import { IntlProvider } from 'react-intl';
import { store as reduxStore, history } from './redux/store';

import PublicRoutes from './router';
import { DarkApp, LightApp } from './settings/appStyle';
import { lightTheme, darkTheme } from './settings';
import { useTheme } from './hooks/useTheme';

const Main = () => {
  const [isLight] = useTheme();
  const defaultTheme = isLight ? lightTheme : darkTheme;
  const AppHolder = isLight ? LightApp : DarkApp;

  return (
    <ThemeProvider theme={defaultTheme}>
      <AppHolder>
        <PublicRoutes history={history} />
      </AppHolder>
    </ThemeProvider>
  );
};

function App() {
  return (
    <ReduxProvider store={reduxStore}>
      <IntlProvider locale={navigator.language}>
        <Main />
      </IntlProvider>
    </ReduxProvider>
  );
}

export default App;
