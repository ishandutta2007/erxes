import { Document, Schema } from 'mongoose';
import { schemaHooksWrapper, field } from './utils';

export interface ICalcTrParams {
  contractId: string;
  payDate: Date;
  total: number;
}

export interface IBankTransaction {
  amount: string;
  date: Date;
  description?: string;
  fromAccount?: string;
  fromBank?: string;
  toBank?: string;
  toAccount?: string;
  toOwner?: string;
}

export interface IEBarimt { }

export interface ITransaction {
  number?: string;
  transactionType?: string;
  contractId?: string;
  customerId?: string;
  companyId?: string;
  invoiceId?: string;
  description?: string;
  payDate: Date;
  payment?: number;
  give?: number;
  calcInterest?: number;
  interestEve?: number;
  interestNonce?: number;
  storedInterest?: number;
  commitmentInterest?: number;
  loss?: number;
  insurance?: number;
  debt?: number;
  total: number;
  surplus?: number;
  calcedInfo?: {
    payment?: number;
    calcInterest?: number;
    interestEve?: number;
    interestNonce?: number;
    storedInterest?: number;
    commitmentInterest?: number;
    loss?: number;
    insurance?: number;
    debt?: number;
    total: number;
    surplus?: number;
  };
  reactions?: any[];
  contractReaction?: any;
  futureDebt?: number;
  debtTenor?: number;
  currency: string;
  ebarimt?: any;
  isManual?: boolean;
  isGetEBarimt?: boolean;
  isOrganization?: boolean;
  organizationRegister?: string;
  scheduleId?: string;
}

export interface ITransactionDocument extends ITransaction, Document {
  _id: string;
  createdAt?: Date;
  createdBy?: string;
}

export const transactionSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    number: field({
      type: String,
      label: 'Number',
      index: true
    }),
    transactionType: field({
      type: String,
      label: 'Transaction Type'
    }),
    contractId: field({
      type: String,
      optional: true,
      label: 'Contract',
      index: true
    }),
    customerId: field({
      type: String,
      optional: true,
      label: 'Customer',
      index: true
    }),
    companyId: field({
      type: String,
      optional: true,
      label: 'Company',
      index: true
    }),
    invoiceId: field({
      type: String,
      optional: true,
      label: 'Invoice',
      index: true
    }),
    description: field({ type: String, optional: true, label: 'Description' }),
    payDate: field({
      type: Date,
      default: new Date(),
      label: 'Created at'
    }),
    give: field({ type: Number, min: 0, optional: true, label: 'give' }),
    payment: field({ type: Number, min: 0, optional: true, label: 'payment' }),
    calcInterest: field({
      type: Number,
      optional: true,
      label: 'calc Interest'
    }),
    interestEve: field({
      type: Number,
      min: 0,
      optional: true,
      label: 'interest eve month'
    }),
    interestNonce: field({
      type: Number,
      min: 0,
      optional: true,
      label: 'interest nonce month'
    }),
    storedInterest: field({
      type: Number,
      optional: true,
      label: 'Stored Interest'
    }),
    commitmentInterest: field({
      type: Number,
      optional: true,
      label: 'commitment Interest'
    }),
    loss: field({ type: Number, min: 0, optional: true, label: 'loss' }),
    insurance: field({
      type: Number,
      min: 0,
      optional: true,
      label: 'insurance'
    }),
    debt: field({ type: Number, min: 0, optional: true, label: 'debt' }),
    surplus: field({ type: Number, min: 0, optional: true, label: 'surplus' }),
    total: field({ type: Number, min: 0, label: 'total' }),
    createdAt: field({
      type: Date,
      default: () => new Date(),
      label: 'Created at'
    }),
    createdBy: { type: String, optional: true, label: 'created member' },
    calcedInfo: field({
      type: {
        payment: Number,
        calcInterest: Number,
        interestEve: Number,
        interestNonce: Number,
        storedInterest: Number,
        commitmentInterest: Number,
        loss: Number,
        insurance: Number,
        debt: Number,
        total: Number,
        surplus: Number
      },
      optional: true,
      label: 'default calced info'
    }),
    pendings: field({ type: [Object], label: 'Pending Schedules reaction' }),
    reactions: field({ type: [Object], label: 'Pending Schedules reaction' }),
    contractReaction: field({ type: Object, label: 'Contract reaction' }),
    futureDebt: field({
      type: Number,
      min: 0,
      optional: true,
      label: 'future Debt'
    }),
    debtTenor: field({
      type: Number,
      min: 0,
      optional: true,
      label: 'debt Tenor'
    }),
    currency: field({
      type: String,
      default: 'MNT',
      label: 'transaction currency of lease'
    }),
    ebarimt: field({
      type: Schema.Types.Mixed,
      optional: true,
      label: 'ebarimt'
    }),
    isManual: field({
      type: Boolean,
      optional: true,
      label: 'ebarimt'
    }),
    scheduleId: field({
      type: String,
      optional: true,
      label: 'scheduleId'
    })
  }),
  'erxes_transactionSchema'
);
