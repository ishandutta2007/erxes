import { checkPermission } from '@erxes/api-utils/src/permissions';
import {
  sendEbarimtMessage,
  sendSyncerkhetMessage,
} from '../../../messageBroker';
import { getConfig } from '../../../utils';
import { IContext } from '../../../connectionResolver';

const mutations = {
  posOrderReturnBill: async (
    _root,
    { _id }: { _id: string },
    { models, subdomain, user }: IContext,
  ) => {
    const order = await models.PosOrders.findOne({ _id }).lean();
    if (!order) {
      throw new Error('not found order');
    }
    const pos = await models.Pos.findOne({ token: order.posToken }).lean();
    if (!pos) {
      throw new Error('not found pos');
    }
    if (order.status === 'return') {
      throw new Error('Already returned');
    }

    const ebarimtMainConfig = await getConfig(subdomain, 'EBARIMT', {});

    await sendEbarimtMessage({
      subdomain,
      action: 'putresponses.returnBill',
      data: {
        contentType: 'pos',
        contentId: _id,
        number: order.number,
        config: { ...pos.ebarimtConfig, ...ebarimtMainConfig },
        user
      },
      isRPC: true,
    });

    await sendSyncerkhetMessage({
      subdomain,
      action: 'returnOrder',
      data: {
        pos,
        order,
      },
    });

    return await models.PosOrders.deleteOne({ _id });
  },

  posOrderChangePayments: async (
    _root,
    { _id, cashAmount, mobileAmount, paidAmounts },
    { models },
  ) => {
    const order = await models.PosOrders.findOne({ _id }).lean();
    if (!order) {
      throw new Error('not found order');
    }

    if (order.status === 'return') {
      throw new Error('Already returned');
    }

    if (
      order.totalAmount !==
      cashAmount +
      mobileAmount +
      (paidAmounts || []).reduce(
        (sum, i) => Number(sum) + Number(i.amount),
        0,
      )
    ) {
      throw new Error('not balanced');
    }

    await models.PosOrders.updateOne(
      { _id },
      { $set: { cashAmount, mobileAmount, paidAmounts } },
    );
    return models.PosOrders.findOne({ _id }).lean();
  },
};

checkPermission(mutations, 'posOrderReturnBill', 'manageOrders');
checkPermission(mutations, 'posOrderChangePayments', 'manageOrders');

export default mutations;
