import {
  checkUserIds,
  chunkArray,
  fixDate,
  fixNum,
  getDate,
  getEnv,
  getNextMonth,
  getToday,
  getPureDate,
  getFullDate,
  getTomorrow,
  getUserDetail,
  paginate,
  regexSearchText,
  validSearchText,
  cleanHtml,
  splitStr,
  escapeRegExp,
  dateToShortStr,
  shortStrToDate,
} from './core';
import { putCreateLog, putDeleteLog, putUpdateLog } from './logUtils';
import { sendToWebhook } from './requests';
import { updateUserScore, getScoringConfig } from './scoring';
import { generateFieldsFromSchema } from './fieldUtils';
import { numberToWord } from './numberUtils'

import {
  can,
  IActionMap,
  IPermissionContext,
  checkLogin,
  getKey,
  permissionWrapper,
  getUserActionsMap,
  checkPermission,
  requireLogin,
} from './permissions';

import { IContext } from './types';
import { ruleSchema } from './definitions/common';
import { field, schemaWrapper } from './definitions/utils';

import { IColumnLabel } from './types';
import { afterQueryWrapper } from './quiriesWrappers';

export { getEnv }; // ({ name, defaultValue })
export { getUserDetail }; // (user: IUserDocument)
export { paginate }; // ( collection, params: { ids ?: string[]; page ?: number; perPage ?: number } )
export { validSearchText }; // (values: string[])
export { regexSearchText }; // ( searchValue: string, searchKey = "searchText" )
export { sendToWebhook };
export { fixDate };
export { fixNum };
export { getDate };
export { getToday };
export { getPureDate };
export { getFullDate };
export { getTomorrow };
export { getNextMonth };
export { checkUserIds };
export { chunkArray };
export { putCreateLog, putUpdateLog, putDeleteLog };
export { updateUserScore };
export { getScoringConfig };
export { generateFieldsFromSchema };
export { afterQueryWrapper };
export { dateToShortStr };
export { shortStrToDate };
export {
  can,
  IActionMap,
  IPermissionContext,
  checkLogin,
  getKey,
  permissionWrapper,
  getUserActionsMap,
  checkPermission,
  requireLogin,
  IContext,
  IColumnLabel,
  ruleSchema,
  field,
  schemaWrapper,
};

export default {
  cleanHtml,
  splitStr,
  escapeRegExp,
  getEnv,
  getUserDetail,
  paginate,
  validSearchText,
  regexSearchText,
  sendToWebhook,
  fixDate,
  getDate,
  getToday,
  getPureDate,
  getFullDate,
  getTomorrow,
  getNextMonth,
  checkUserIds,
  chunkArray,
  putCreateLog,
  putUpdateLog,
  putDeleteLog,
  updateUserScore,
  getScoringConfig,
  generateFieldsFromSchema,
  afterQueryWrapper,
  dateToShortStr,
  shortStrToDate,
  numberToWord
};
