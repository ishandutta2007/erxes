import {
  attachmentInput,
  attachmentType
} from '@erxes/api-utils/src/commonTypeDefs';
import {
  mutations as periodLockMutations,
  queries as periodLockQueries,
  types as periodLockTypes
} from './periodLock';
import {
  queries as collateralQueries,
  types as collateralTypes
} from './collateral';
import {
  mutations as collateralTypeMutations,
  queries as collateralTypeQueries,
  types as collateralTypeTypes
} from './collateralType';
import {
  mutations as contractMutations,
  queries as contractQueries,
  types as contractTypes
} from './contract';
import {
  mutations as contractTypeMutations,
  queries as contractTypeQueries,
  types as contractTypeTypes
} from './contractType';
import {
  mutations as insuranceTypeMutations,
  queries as insuranceTypeQueries,
  types as insuranceTypeTypes
} from './insuranceType';
import {
  mutations as invoiceMutations,
  queries as invoiceQueries,
  types as invoiceTypes
} from './invoice';
import {
  mutations as scheduleMutations,
  queries as scheduleQueries,
  types as scheduleTypes
} from './schedule';
import {
  mutations as transactionMutations,
  queries as transactionQueries,
  types as transactionTypes
} from './transaction';
import {
  mutations as classificationMutations,
  queries as classificationQueries,
  types as classificationTypes
} from './classification';
import {
  mutations as nonBalanceTransactionMutations,
  queries as nonBalanceTransactionQueries,
  types as nonBalanceTransactionTypes
} from './nonBalanceTransaction';
import {
  mutations as purposeMutations,
  queries as purposeQueries,
  types as purposeTypes
} from './purpose';

export const types = `
  ${attachmentType}
  ${attachmentInput}

  extend type User @key(fields: "_id") {
    _id: String! @external
  }
  extend type Company @key(fields: "_id") {
    _id: String! @external
  }
  extend type Customer @key(fields: "_id") {
    _id: String! @external
  }
  extend type ProductCategory @key(fields: "_id") {
    _id: String! @external
  }
  extend type Product @key(fields: "_id") {
    _id: String! @external
  }
  
  ${periodLockTypes()},
  ${contractTypes()},
  ${collateralTypes()}
  ${collateralTypeTypes()},
  ${contractTypeTypes()},
  ${insuranceTypeTypes()},
  ${invoiceTypes},
  ${transactionTypes},
  ${scheduleTypes()},
  ${classificationTypes()},
  ${nonBalanceTransactionTypes},
  ${purposeTypes()}
`;

export const queries = `
  ${periodLockQueries},
  ${contractQueries},
  ${collateralQueries},
  ${collateralTypeQueries},
  ${contractTypeQueries},
  ${insuranceTypeQueries},
  ${invoiceQueries},
  ${scheduleQueries},
  ${transactionQueries},
  ${classificationQueries},
  ${nonBalanceTransactionQueries},
  ${purposeQueries}
`;

export const mutations = `
  ${periodLockMutations}
  ${contractMutations},
  ${contractTypeMutations},
  ${collateralTypeMutations},
  ${insuranceTypeMutations},
  ${invoiceMutations},
  ${scheduleMutations},
  ${transactionMutations},
  ${classificationMutations},
  ${nonBalanceTransactionMutations}
  ${purposeMutations}
`;
