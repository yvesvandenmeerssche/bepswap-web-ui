import styled from 'styled-components';
import { palette } from 'styled-theme';
import { Menu as Unstyled } from 'antd';
import Button from '../uielements/button';
import { media } from '../../helpers/styleHelper';

export const Menu = styled(Unstyled)`
  i {
    color: ${palette('primary', 1)};
  }
  
  .ant-dropdown-menu-item-selected {
    color: ${palette('text', 0)};
    background: ${palette('background', 6)};
  }
  .ant-dropdown-menu-item:hover,
  .ant-dropdown-menu-submenu-title:hover {
    background: ${palette('background', 6)};
  }
`;

export const DesktopButton = styled(Button)`
  display: none !important;
  ${media.sm`
    display: flex !important;
  `}
`;

export const MobileButton = styled(Button)`
  display: flex;
  width: 30px;
  min-width: 30px !important;
  padding: 0;
  ${media.sm`
    display: none !important;
  `}
`;
