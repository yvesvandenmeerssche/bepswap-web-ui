import React from 'react';
import { Icon } from 'antd';

import Button from '../button';

type Props = {
  connected?: boolean;
  value: string;
  className?: string;
};

const WalletButton: React.FC<Props> = (props: Props): JSX.Element => {
  const { connected = false, value, className = '', ...otherProps } = props;

  const getBtnValue = () => {
    if (!connected) {
      return (
        <span>
          <Icon
            type="folder-add"
            theme="filled"
            style={{
              display: 'inline',
              marginRight: '6px',
              top: '1px',
              position: 'relative',
            }}
          />
          Add Wallet
        </span>
      );
    }

    if (connected) {
      if (value && value.length > 9) {
        const first = value.substr(0, 6);
        const last = value.substr(value.length - 3, 3);
        return `${first}...${last}`;
      }
      return value;
    }
  };

  return (
    <Button
      className={`${className} wallet-btn-wrapper`}
      sizevalue="normal"
      color="primary"
      round="true"
      {...otherProps}
    >
      {getBtnValue()}
    </Button>
  );
};

export default WalletButton;
