import { moduleRequireLogin } from '@erxes/api-utils/src/permissions';
import { paginate } from '@erxes/api-utils/src';
import { IContext } from '../../connectionResolver';
import { getService, getServices } from '@erxes/api-utils/src/serviceDiscovery';

const notificationQueries = {
  /**
   * Notifications list
   */
  async notifications(
    _root,
    {
      userId,
      requireRead,
      title,
      limit,
      notifType,
      contentTypes,
      startDate,
      endDate,
      ...params
    }: {
      userId: string
      requireRead: boolean;
      title: string;
      limit: number;
      contentTypes: string;
      notifType: string;
      page: number;
      perPage: number;
      startDate: string;
      endDate: string;
    },
    { models, user }: IContext,
  ) {
    const sort: any = { date: -1 };
    const selector: any = { receiver: userId || user._id };
    if (requireRead) {
      selector.isRead = false;
    }

    if (title) {
      selector.title = title;
    }

    if (notifType) {
      selector.notifType = notifType;
    }

    if (contentTypes) {
      selector.contentType = { $in: contentTypes };
    }

    if (startDate && endDate) {
      selector.date = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    if (limit) {
      return models.Notifications.find(selector).sort(sort).limit(limit);
    }

    return paginate(models.Notifications.find(selector), params).sort(sort);
  },

  /**
   * Notification counts
   */
  async notificationCounts(
    _root,
    {
      requireRead,
      notifType,
      contentTypes,
    }: { requireRead: boolean; notifType: string; contentTypes: string },
    { user, models }: IContext,
  ) {
    const selector: any = { receiver: user._id };

    if (requireRead) {
      selector.isRead = false;
    }

    if (notifType) {
      selector.notifType = notifType;
    }

    if (contentTypes) {
      selector.contentType = { $in: contentTypes };
    }

    return models.Notifications.find(selector).countDocuments();
  },

  /**
   * Module list used in notifications
   */
  async notificationsModules() {
    const services = await getServices();
    const modules: Array<{
      name: string;
      types: any[];
      icon: string;
      description: string;
    }> = [];

    for (const serviceName of services) {
      const service = await getService(serviceName);
      const meta = service.config?.meta || {};

      if (meta && meta.notificationModules) {
        const notificationModules = meta.notificationModules || [];
        for (const notificationModule of notificationModules) {
          modules.push(notificationModule);
        }
      }
    }

    return modules;
  },

  /**
   * Get per user configuration
   */
  async notificationsGetConfigurations(_root, _args, { user, models }: IContext) {
    return models.NotificationConfigurations.find({ user: user._id });
  },
};

moduleRequireLogin(notificationQueries);

export default notificationQueries;
