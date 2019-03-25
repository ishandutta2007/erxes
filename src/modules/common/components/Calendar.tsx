import { Header as CalendarHeader } from 'modules/deals/styles/stage';
import * as moment from 'moment';
import * as React from 'react';
import styled from 'styled-components';
import { colors } from '../styles';
import { IDateColumn } from '../types';
import { __ } from '../utils';
import {
  getCurrentDate,
  getFullTitle,
  monthColumns,
  nextMonth,
  previousMonth
} from '../utils/calendar';
import Button from './Button';

const Container = styled.div`
  display: flex;
  height: 100%;
  border-top: 1px solid ${colors.borderPrimary};
  border-radius: 5px;
`;

const ContentHeader = styled(CalendarHeader)`
  padding-bottom: 0;
`;

const Header = styled.div`
  display: inline-block;
`;

const HeaderWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

const Content = styled.div`
  overflow: hidden;
  margin: 0 4px;
  width: 280px;
  border-radius: 4px;
`;

const Item = styled.div`
  margin: 8px;
`;

type State = {
  currentDate: moment.Moment;
};

type ItemButton = {
  icon?: string;
  text?: string;
  onClick: () => void;
};

type Props = {
  renderContent: (
    renderMonths: () => React.ReactNode[],
    renderMiddleContent: () => React.ReactNode
  ) => React.ReactNode;
  renderColumn: (date: IDateColumn) => React.ReactNode;
};

class Calendar extends React.Component<Props, State> {
  state = { currentDate: getCurrentDate() };

  onPreviousClick = () => {
    const currentDate = previousMonth(this.state.currentDate);

    this.setState({ currentDate });
  };

  onNextClick = () => {
    const currentDate = nextMonth(this.state.currentDate);

    this.setState({ currentDate });
  };

  setCurrentDate = () => {
    this.setState({ currentDate: getCurrentDate() });
  };

  renderMiddleContent = () => {
    return (
      <Header>
        <HeaderWrapper>
          {renderButton({ icon: 'leftarrow', onClick: this.onPreviousClick })}
          {renderButton({ icon: 'rightarrow', onClick: this.onNextClick })}
          {renderButton({ onClick: this.setCurrentDate, text: 'Today' })}
        </HeaderWrapper>
      </Header>
    );
  };

  renderMonths = () => {
    const { currentDate } = this.state;
    const months = monthColumns(currentDate, 5);

    return months.map((date: IDateColumn, index: number) =>
      this.renderColumns(index, date)
    );
  };

  renderColumns(index: number, date: IDateColumn) {
    return (
      <Content key={index}>
        <ContentHeader>
          <h4>{getFullTitle(date)}</h4>
        </ContentHeader>
        {this.props.renderColumn(date)}
      </Content>
    );
  }

  render() {
    const { renderContent } = this.props;

    return (
      <Container>
        {renderContent(this.renderMonths, this.renderMiddleContent)}
      </Container>
    );
  }
}

function renderButton(props: ItemButton) {
  const { text, ...buttonProps } = props;

  return (
    <Item>
      <Button
        btnStyle="primary"
        ignoreTrans={true}
        size="small"
        {...buttonProps}
      >
        {text && __(text)}
      </Button>
    </Item>
  );
}

export default Calendar;
