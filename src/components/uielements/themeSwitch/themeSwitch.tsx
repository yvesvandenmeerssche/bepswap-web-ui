/* eslint-disable jsx-a11y/accessible-emoji */
import React from 'react';
import { SwitchProps } from 'antd/lib/switch';
import { StyledSwitch, EmojiIcon } from './themeSwitch.style';

type ComponentProps = {
  className?: string;
};

type Props = ComponentProps & SwitchProps;

const AssetInfo: React.FC<Props> = (props: Props): JSX.Element => {
  const { className = '', ...otherProps } = props;
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
      checkedChildren={sunIcon}
      unCheckedChildren={moonIcon}
      {...otherProps}
    />
  );
};

export default AssetInfo;
