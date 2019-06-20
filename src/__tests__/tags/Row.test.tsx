import { mount, shallow } from 'enzyme';
import * as React from 'react';
import * as renderer from 'react-test-renderer';

import Row from '../../modules/tags/components/Row';

describe('Row component', () => {
  const defaultProps = {
    tag: {
      _id: 'id',
      name: 'name',
      type: 'typ',
      colorCode: 'red'
    },
    type: 'type',
    remove: (tag: {
      _id: string;
      type: string;
      name: string;
      colorCode: string;
    }) => null,
    save: (params: {
      doc: {
        _id?: string;
        name: string;
        type: string;
        colorCode: string;
      };
    }) => null
  };

  test('renders WithPermission successfully', () => {
    shallow(<Row {...defaultProps} />);
  });

  test('renders successfully with default value', () => {
    const wrapper = mount(<Row {...defaultProps} />);
    const props = wrapper.props();

    expect(props).toMatchObject(defaultProps);
  });

  test('snapshot matches', () => {
    const rendered = renderer.create(<Row {...defaultProps} />).toJSON();

    expect(rendered).toMatchSnapshot();
  });
});