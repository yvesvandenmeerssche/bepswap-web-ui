import { configure } from '@storybook/react';
import { addDecorator } from '@storybook/react/dist/client/preview';
import { withKnobs } from '@storybook/addon-knobs';

import 'antd/dist/antd.css';
import './global.css';

addDecorator(withKnobs);

const req = require.context('../src', true, /\.stories\.js$/);

function loadStories() {
  req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);