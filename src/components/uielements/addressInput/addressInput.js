import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'antd';

import {
  AddressInputWrapper,
  PopoverContainer,
  PopoverContent,
} from './addressInput.style';
import Input from '../input';

class AddressInput extends Component {
  setStatus = status => () => {
    this.props.onStatusChange(status);
  };

  onChange = e => {
    this.props.onChange(e);
  };

  getPopupContainer = () => {
    return document.getElementsByClassName('addressInput-wrapper')[0];
  };

  renderPopoverContent = () => {
    return <PopoverContent>Add Recipient Address</PopoverContent>;
  };

  render() {
    const { value, status, onStatusChange, className, ...props } = this.props;

    return (
      <AddressInputWrapper
        status={status}
        className={`addressInput-wrapper ${className}`}
        {...props}
      >
        {!status && (
          <PopoverContainer
            content={this.renderPopoverContent()}
            getPopupContainer={this.getPopupContainer}
            placement="right"
            trigger={[]}
            visible
            overlayClassName="addressInput-popover"
            overlayStyle={{
              padding: '6px',
              animationDuration: '0s !important',
              animation: 'none !important',
            }}
          >
            <div
              className="addressInput-icon"
              onClick={this.setStatus(true)}
              data-test="add-recipient-address-button"
            >
              <Icon type="plus" />
            </div>
          </PopoverContainer>
        )}
        {status && (
          <>
            <div className="addressInput-icon" onClick={this.setStatus(false)}>
              <Icon type="delete" theme="filled" />
            </div>
            <Input
              className="address-input"
              color="success"
              sizevalue="normal"
              value={value}
              onChange={this.onChange}
              placeholder="Recipient Address: Eg. bnbeh456..."
              data-test="recipient-address-field"
            />
          </>
        )}
      </AddressInputWrapper>
    );
  }
}

AddressInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  status: PropTypes.bool,
  onStatusChange: PropTypes.func.isRequired,
  className: PropTypes.string,
};

AddressInput.defaultProps = {
  status: false,
  value: '',
  className: '',
};

export default AddressInput;
