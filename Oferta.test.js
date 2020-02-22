import React from 'react';
import renderer from 'react-test-renderer';

import Oferta from './App';

describe('<Oferta />', () => {
  it('has 1 child', () => {
    const tree = renderer.create(<Oferta />).toJSON();
    expect(tree.children.length).toBe(1);
  });
  it('renders correctly', () => {
    const tree = renderer.create(<Oferta />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});