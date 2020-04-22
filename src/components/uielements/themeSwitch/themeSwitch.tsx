/* eslint-disable jsx-a11y/accessible-emoji */
import React from 'react';
import { SwitchProps } from 'antd/lib/switch';
import { StyledSwitch, EmojiIcon } from './themeSwitch.style';

import { useTheme } from '../../../hooks/useTheme';

type ComponentProps = {
  className?: string;
};

type Props = ComponentProps & SwitchProps;

const AssetInfo: React.FC<Props> = (props: Props): JSX.Element => {
  const { className = '', ...otherProps } = props;
  const [isLight, toggleTheme] = useTheme();

  const sunIcon = (
    <EmojiIcon role="img" aria-label="sun">
      ☀️
    </EmojiIcon>
  );
  const moonIcon = (
    <EmojiIcon role="img" aria-label="moon">
      🌙️
    </EmojiIcon>
  );

  return (
    <StyledSwitch
      className={`themeSwitch-wrapper ${className}`}
      checked={isLight}
      onChange={toggleTheme}
      checkedChildren={sunIcon}
      unCheckedChildren={moonIcon}
      {...otherProps}
    />
  );
};

export default AssetInfo;
