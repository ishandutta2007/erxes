import { IActivityLogForMonth } from '@erxes/ui-log/src/activityLogs/types';
import { IUser } from './auth/types';

export interface IRouterProps {
  location: any;
  match: any;
  navigate: any;
}

export interface IAttachment {
  name: string;
  type: string;
  url: string;
  size?: number;
  duration?: number;
}

export type IAttachmentPreview = {
  name: string;
  type: string;
  data: string;
} | null;

export interface IPdfAttachment {
  pdf?: IAttachment;
  pages: IAttachment[];
}

export interface IAnimatedLoader {
  height?: string;
  width?: string;
  color?: string;
  round?: boolean;
  margin?: string;
  marginRight?: string;
  isBox?: boolean;
  withImage?: boolean;
}

export interface IBreadCrumbItem {
  title: string;
  link?: string;
}

export interface IQueryParams {
  [key: string]: string;
}

export interface ISelectedOption {
  label: string;
  value: string;
}

export interface IConditionsRule {
  _id: string;
  kind?: string;
  text: string;
  condition: string;
  value: string;
}

export type IDateColumn = {
  month: number;
  year: number;
};

export interface IFieldLogic {
  fieldId?: string;
  tempFieldId?: string;
  logicOperator: string;
  logicValue: string;
  __typename?: string;
}

export interface ILocationOption {
  lat: number;
  lng: number;
  description?: string;
  marker?: string;
}

export interface IObjectListConfig {
  key: string;
  label: string;
  type: string;
}

export interface IField {
  _id: string;
  key?: string;
  contentType: string;
  contentTypeId?: string;
  type: string;
  validation?: string;
  regexValidation?: string;
  field?: string;
  text?: string;
  code?: string;
  content?: string;
  description?: string;
  options?: string[];
  locationOptions?: ILocationOption[];
  objectListConfigs?: IObjectListConfig[];
  isRequired?: boolean;
  order?: React.ReactNode;
  canHide?: boolean;
  isVisible?: boolean;
  isVisibleInDetail?: boolean;
  isVisibleToCreate?: boolean;
  isDefinedByErxes?: boolean;
  groupId?: string;
  lastUpdatedUser?: IUser;
  lastUpdatedUserId?: string;
  associatedFieldId?: string;
  column?: number;
  associatedField?: {
    _id: string;
    text: string;
    contentType: string;
  };
  logics?: IFieldLogic[];
  logicAction?: string;
  pageNumber?: number;
  searchable?: boolean;
  showInCard?: boolean;
  keys?: string[];
  productCategoryId?: string;
  optionsValues?: string;

  relationType?: string;
  subFieldIds?: string[];
  isDisabled?: boolean;
}

export interface IFormProps {
  errors: any;
  values: any;
  registerChild: (child: React.ReactNode) => void;
  runValidations?: (callback: any) => void;
  resetSubmit?: () => void;
  isSubmitted: boolean;
  isSaved?: boolean;
}

export type IOption = {
  label: string;
  value: string;
  avatar?: string;
  extraValue?: string;
  obj?: any;
};

export type IButtonMutateProps = {
  passedName?: string;
  name?: string;
  values: any;
  isSubmitted: boolean;
  confirmationUpdate?: boolean;
  callback?: (data?: any) => void;
  resetSubmit?: () => void;
  beforeSubmit?: () => void;
  size?: string;
  object?: any;
  text?: string;
  icon?: string;
  type?: string;
  disableLoading?: boolean;
};

export type IMentionUser = {
  id: string;
  avatar?: string;
  username: string;
  fullName?: string;
  title?: string;
};

export type IEditorProps = {
  placeholder?: string;
  onCtrlEnter?: (evt?: any) => void;
  content: string;
  onChange: (evt: any) => void;
  onInstanceReady?: (e: any) => any;
  height?: number | string;
  insertItems?: any;
  removeButtons?: string;
  removePlugins?: string;
  toolbarCanCollapse?: boolean;
  showMentions?: boolean;
  toolbar?: any[];
  autoFocus?: boolean;
  toolbarLocation?: 'top' | 'bottom';
  autoGrow?: boolean;
  autoGrowMinHeight?: number | string;
  autoGrowMaxHeight?: number | string;
  name?: string;
  isSubmitted?: boolean;
  formItems?: any;
  contentType?: string;
  additionalToolbarContent?: (props: {
    onClick: (placeholder: string) => void;
  }) => React.ReactNode;
  contentTypeConfig?: any;
};

export type QueryResponse = {
  loading: boolean;
  refetch: (variables?: any) => Promise<any>;
  error?: string;
};

export type MutationVariables = {
  _id: string;
};

export type ActivityLogQueryResponse = {
  activityLogs: IActivityLogForMonth[];
  loading: boolean;
};

export type Counts = {
  [key: string]: number;
};

export interface IAbortController {
  readonly signal: AbortSignal;
  abort?: () => void;
}
