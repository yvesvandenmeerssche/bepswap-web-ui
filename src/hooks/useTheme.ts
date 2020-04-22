import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { RootState } from '../redux/store';
import * as appActions from '../redux/app/actions';
import { LIGHT_THEME, DARK_THEME } from '../settings/themes';

type ToggleTheme = (value: boolean) => void;
type UseThemeHook = () => [boolean, ToggleTheme];

export const useTheme: UseThemeHook = () => {
  const themeType = useSelector((state: RootState) => state.App.themeType);
  const dispatch = useDispatch();
  const setTheme = useCallback(
    (themeType: string) => dispatch(appActions.setTheme(themeType)),
    [dispatch],
  );
  const toggleTheme = useCallback(
    value => {
      setTheme(value ? LIGHT_THEME : DARK_THEME);
    },
    [setTheme],
  );

  const isLight = themeType === LIGHT_THEME;

  return [isLight, toggleTheme];
};
