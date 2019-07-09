import classNames from 'classnames';
import { IUser } from 'modules/auth/types';
import { NameCard } from 'modules/common/components';
import { IRouterProps } from 'modules/common/types';
import moment from 'moment';
import React from 'react';
import { withRouter } from 'react-router';
import xss from 'xss';
import { INotification } from '../types';
import { NotificationIcon } from './';
import {
  AvatarSection,
  Content,
  CreatedDate,
  CreatedUser,
  InfoSection
} from './styles';

interface IProps extends IRouterProps {
  notification: INotification;
  markAsRead: (notificationIds?: string[]) => void;
  createdUser?: IUser;
  isList?: boolean;
}

class NotificationRow extends React.Component<IProps> {
  markAsRead = () => {
    const { notification, markAsRead } = this.props;

    if (!notification.isRead) {
      markAsRead([notification._id]);
    }

    const params = notification.link.split('?');

    this.props.history.replace({
      pathname: params[0],
      state: { from: 'notification' },
      search: `?${params[1]}`
    });
  };

  getTitle = (title, user) => {
    if (!user) {
      return title.replace('{userName}', '');
    }

    if (!(user.details && user.details.fullName)) {
      return title.replace('{userName}', user.email);
    }

    return title.replace('{userName}', user.details.fullName);
  };

  renderContent(content: string, type: string) {
    if (!type.includes('conversation')) {
      return null;
    }

    return <Content dangerouslySetInnerHTML={{ __html: xss(content) }} />;
  }

  renderAction(notification: INotification) {
    if (notification.notifType.includes('conversation')) {
      return <span>{notification.action}</span>;
    }

    return (
      <span>
        {notification.action}
        <b> {notification.content}</b>
      </span>
    );
  }

  render() {
    const { notification, isList } = this.props;
    const { isRead, createdUser } = notification;
    const classes = classNames({ unread: !isRead });

    return (
      <li className={classes} onClick={this.markAsRead}>
        <AvatarSection>
          <NameCard.Avatar
            user={createdUser}
            size={30}
            icon={<NotificationIcon notification={notification} />}
          />
        </AvatarSection>
        <InfoSection>
          <CreatedUser>
            {createdUser.details
              ? createdUser.details.fullName
              : createdUser.username || createdUser.email}
            {this.renderAction(notification)}
          </CreatedUser>
          {this.renderContent(notification.content, notification.notifType)}
          <CreatedDate isList={isList}>
            {moment(notification.date).format('DD MMM YYYY, HH:mm')}
          </CreatedDate>
        </InfoSection>
      </li>
    );
  }
}

export default withRouter<IProps>(NotificationRow);
