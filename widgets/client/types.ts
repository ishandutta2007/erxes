import {
  BotPersistentMenuTypeMessenger,
  IAttachment,
  IBotData,
  IWebsiteApp,
} from './messenger/types';

import { ICallout } from './form/types';

export type ENV = {
  ROOT_URL: string;
  API_URL: string;
  API_SUBSCRIPTIONS_URL: string;
  CALLS_APP_ID: string;
  CALLS_APP_SECRET: string;
};

export interface IUserDetails {
  avatar: string;
  fullName: string;
  shortName: string;
  position: string;
  description: string;
  location: string;
}

export interface IUser {
  _id: string;
  isActive?: boolean;
  details?: IUserDetails;
  isOnline: boolean;
}

export interface IUserLinks {
  facebook: string;
  twitter: string;
  youtube: string;
  linkedIn: string;
  github: string;
  website: string;
}

export interface IParticipator extends IUser {
  links: IUserLinks;
}

export interface ICustomer {
  _id: string;
  avatar?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  emails?: string[];
  phone?: string;
  phones?: string[];
}

export interface IBrand {
  name: string;
  description: string;
}

export interface IBrowserInfo {
  language?: string;
  url?: string;
  city?: string;
  country?: string;
  countryCode?: string;
  remoteAddress?: string;
  region?: string;
  hostname?: string;
  userAgent?: string;
}

export interface IEmailParams {
  toEmails: string[];
  fromEmail: string;
  title: string;
  content: string;
  formId: string;
  attachments?: IAttachment[];
}

export interface IIntegrationTwitterData {
  info: any;
  token: string;
  tokenSecret: string;
}

export interface IIntegrationFacebookData {
  appId: {
    type: string;
  };
  pageIds: {
    type: string[];
  };
}

export interface IIntegrationMessengerOnlineHours {
  day: string;
  from: string;
  to: string;
}

export interface IIntegrationLink {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
}

export interface IIntegrationExternalLink {
  url: string;
}

export interface IIntegrationMessengerDataMessagesItem {
  greetings: { title?: string; message?: string };
  away?: string;
  thank?: string;
  welcome?: string;
}

export interface ICloudflareCallDataOperator {
  _id: string;
  name: string;
  userId: string;
}

export interface CloudflareCallDataDepartment {
  _id: string;
  name: string;
  operators: ICloudflareCallDataOperator[];
}

export interface IIntegrationCallData {
  departments?: CloudflareCallDataDepartment[];
  description?: string;
  header?: string;
  isReceiveWebCall?: boolean;
  secondPageHeader?: string;
  secondPageDescription?: string;
}

export interface IIntegrationMessengerData {
  skillData?: {
    typeId: string;
    options: Array<{
      response: string;
      label: string;
      skillId: string;
    }>;
  };
  botEndpointUrl?: string;
  botCheck?: boolean;
  botShowInitialMessage?: boolean;
  supporterIds: string[];
  notifyCustomer: boolean;
  knowledgeBaseTopicId: string;
  formCodes: string[];
  websiteApps?: IWebsiteApp[];
  availabilityMethod: string;
  isOnline: boolean;
  requireAuth: boolean;
  showChat: boolean;
  showLauncher: boolean;
  forceLogoutWhenResolve: boolean;
  showVideoCallRequest: boolean;
  onlineHours: IIntegrationMessengerOnlineHours[];
  timezone?: string;
  responseRate?: string;
  showTimezone?: boolean;
  messages?: IIntegrationMessengerDataMessagesItem;
  links?: IIntegrationLink;
  externalLinks?: IIntegrationExternalLink[];
  botGreetMessage?: string;
  persistentMenus?: BotPersistentMenuTypeMessenger[];
  fromBot?: boolean;
  botData?: IBotData;
  getStarted?: boolean;
  isReceiveWebCall?: boolean;
  departments?: CloudflareCallDataDepartment[];
}

export interface ILeadData {
  loadType: string;
  successAction?: string;
  fromEmail?: string;
  userEmailTitle?: string;
  userEmailContent?: string;
  adminEmails?: string[];
  adminEmailTitle?: string;
  adminEmailContent?: string;
  thankTitle?: string;
  thankContent?: string;
  redirectUrl?: string;
  themeColor?: string;
  callout?: ICallout;
  rules?: IRule;
  isRequireOnce?: boolean;
  attachments?: IAttachment[];
  css?: string;
  successImage?: string;
}

export interface IIntegrationUiOptions {
  color: string;
  textColor?: string;
  wallpaper: string;
  logo: string;
  showVideoCallRequest: boolean;
}

export interface IIntegration {
  _id: string;
  kind: string;
  name: string;
  brandId: string;
  languageCode?: string;
  tagIds?: string[];
  formId: string;
  leadData: ILeadData;
  messengerData: IIntegrationMessengerData;
  twitterData: IIntegrationTwitterData;
  facebookData: IIntegrationFacebookData;
  uiOptions: IIntegrationUiOptions;
}
export interface IRule {
  _id: string;
  kind?: string;
  text: string;
  condition: string;
  value: string;
}

export interface IProductCategory {
  _id: string;
  name: string;
  order: string;
  code: string;
  description?: string;
  attachment?: any;
  status: string;
  parentId?: string;
  createdAt: Date;
  productCount: number;
  isRoot: boolean;
}

export interface IProduct {
  _id: string;
  name?: string;
  type: string;
  categoryId: string;
  description: string;
  uom: string;
  code: string;
  unitPrice: number;
  customFieldsData?: any;
  createdAt: Date;
  vendorId?: string;

  attachment?: any;
  attachmentMore?: any[];
  category: IProductCategory;
}

export interface ICountry {
  code: string;
  name: string;
  dialCode: string;
  emoji: string;
}
