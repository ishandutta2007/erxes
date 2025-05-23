import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import * as mongoose from 'mongoose';
import {
  IAccountCategoryModel,
  loadAccountCategoryClass,
} from './models/AccountCategories';
import {
  IAccountModel,
  loadAccountClass,
} from './models/Accounts';
import { IAdjustInventoriesModel, loadAdjustInventoriesClass, IAdjustInvDetailsModel, loadAdjustInvDetailsClass } from './models/AdjustInventories';
import {
  IAccountingConfigModel,
  loadAccountingConfigClass,
} from './models/Configs';
import { ICtaxRowModel, loadCtaxRowClass } from './models/CtaxRows';
import { IPermissionModel, loadPermissionClass } from './models/Permissions';
import {
  ITransactionModel,
  loadTransactionClass,
} from './models/Transactions';
import { IVatRowModel, loadVatRowClass } from './models/VatRows';
import {
  IAccountDocument,
} from './models/definitions/account';
import {
  IAccountCategoryDocument,
} from './models/definitions/accountCategory';
import { IAdjustInventoryDocument, IAdjustInvDetailDocument } from './models/definitions/adjustInventory';
import { IAccountingConfigDocument } from './models/definitions/config';
import { ICtaxRowDocument } from './models/definitions/ctaxRow';
import { IPermissionDocument } from './models/definitions/permission';
import {
  ITransactionDocument,
} from './models/definitions/transaction';
import { IVatRowDocument } from './models/definitions/vatRow';

export interface IModels {
  Accounts: IAccountModel;
  Transactions: ITransactionModel;
  AccountCategories: IAccountCategoryModel;
  AccountingConfigs: IAccountingConfigModel;
  VatRows: IVatRowModel;
  CtaxRows: ICtaxRowModel;
  Permissions: IPermissionModel;
  AdjustInventories: IAdjustInventoriesModel;
  AdjustInvDetails: IAdjustInvDetailsModel;
}
export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export const loadClasses = (
  db: mongoose.Connection,
  subdomain: string,
): IModels => {
  const models = {} as IModels;

  models.Accounts = db.model<IAccountDocument, IAccountModel>(
    'accounts',
    loadAccountClass(models, subdomain),
  );
  models.AccountingConfigs = db.model<
    IAccountingConfigDocument,
    IAccountingConfigModel
  >('accountings_configs', loadAccountingConfigClass(models));

  models.AccountCategories = db.model<
    IAccountCategoryDocument,
    IAccountCategoryModel
  >('account_categories', loadAccountCategoryClass(models));

  models.AdjustInventories = db.model<
    IAdjustInventoryDocument,
    IAdjustInventoriesModel
  >('adjust_inventories', loadAdjustInventoriesClass(models, subdomain));

  models.AdjustInvDetails = db.model<
    IAdjustInvDetailDocument,
    IAdjustInvDetailsModel
  >('adjust_inv_details', loadAdjustInvDetailsClass(models, subdomain));

  models.Permissions = db.model<IPermissionDocument, IPermissionModel>(
    'accounting_permissions',
    loadPermissionClass(models, subdomain),
  );

  models.Transactions = db.model<ITransactionDocument, ITransactionModel>(
    'accountings_transactions',
    loadTransactionClass(models, subdomain),
  );

  models.VatRows = db.model<IVatRowDocument, IVatRowModel>(
    'vat_rows',
    loadVatRowClass(models, subdomain),
  );
  models.CtaxRows = db.model<ICtaxRowDocument, ICtaxRowModel>(
    'ctax_rows',
    loadCtaxRowClass(models, subdomain),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
