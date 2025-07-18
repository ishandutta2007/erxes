import { Model } from 'mongoose';

import { IModels } from '../connectionResolver';
import { customerSchema, ICustomer } from './definitions/customers';

export interface ICustomerModel extends Model<ICustomer> {}

export const loadCustomerClass = (models: IModels) => {
  class Customer {
    public static async getCustomer(selector: any, isLean: boolean) {
      let customer = await models.Customers.findOne(selector);

      if (isLean) {
        customer = await models.Customers.findOne(selector).lean();
      }

      if (!customer) {
        throw new Error('Customer not found');
      }

      return customer;
    }
  }
  customerSchema.loadClass(Customer);

  return customerSchema;
};
