import { mount, shallow } from 'enzyme';
import * as React from 'react';
import * as renderer from 'react-test-renderer';
import Control from '../../../../modules/common/components/form/Control';

describe('Form control component', () => {
  const defaultProps = {
    componentClass: 'input',
    required: false,
    defaultChecked: false,
    disabled: false
  };

  test('renders shallowly', () => {
    shallow(<Control />);
  });

  test('renders with default props', () => {
    const control = mount(<Control {...defaultProps} />);
    const props = control.props();

    expect(props).toMatchObject(defaultProps);
  });

  test('renders an input properly', () => {
    const rendered = mount(<Control {...defaultProps} />);
    const input = rendered.find('input');

    expect(input.length).toBe(1);
  });

  test('renders a select properly', () => {
    defaultProps.componentClass = 'select';

    const rendered = mount(<Control {...defaultProps} />);
    const select = rendered.find('select');

    expect(select.length).toBe(1);
  });

  test('renders a checkbox properly', () => {
    defaultProps.componentClass = 'checkbox';

    const rendered = mount(<Control {...defaultProps} />);
    const checkbox = rendered.find('input').debug();
    const found = checkbox.search('type="checkbox"');

    // if str is not found, -1 is returned
    expect(found).toBeGreaterThan(-1);
  });

  test('renders a radio properly', () => {
    defaultProps.componentClass = 'radio';

    const rendered = mount(<Control {...defaultProps} />);
    const radio = rendered.find('input').debug();

    const found = radio.search('type="radio"');

    // if str is not found, -1 is returned
    expect(found).toBeGreaterThan(-1);
  });

  test('renders a textarea properly', () => {
    defaultProps.componentClass = 'textarea';

    const rendered = mount(<Control {...defaultProps} />);
    const area = rendered.find('textarea');

    expect(area.length).toBe(1);
  });
  test('snapshot matches', () => {
    const rendered = renderer.create(<Control {...defaultProps} />).toJSON();

    expect(rendered).toMatchSnapshot();
  });
});