import { STATUSES, DEFAULT_SEX_CHOICES } from "@erxes/api-utils/src/constants";
import { companySchema } from "../../../db/models/definitions/companies";
import {
  customerSchema,
  locationSchema,
  visitorContactSchema,
} from "../../../db/models/definitions/customers";

export const MODULE_NAMES = {
  COMPANY: "company",
  CUSTOMER: "customer",
};

export const COC_LEAD_STATUS_TYPES = [
  "",
  "new",
  "open",
  "inProgress",
  "openDeal",
  "unqualified",
  "attemptedToContact",
  "connected",
  "badTiming",
];

export const COC_LIFECYCLE_STATE_TYPES = [
  "",
  "subscriber",
  "lead",
  "marketingQualifiedLead",
  "salesQualifiedLead",
  "opportunity",
  "customer",
  "evangelist",
  "other",
];

export const IMPORT_EXPORT_TYPES = [
  {
    text: "Customers",
    contentType: "customer",
    icon: "users-alt",
  },
  {
    text: "Leads",
    contentType: "lead",
    icon: "file-alt",
  },
  {
    text: "Companies",
    contentType: "company",
    icon: "building",
  },
];

export const CUSTOMER_BASIC_INFOS = [
  "state",
  "firstName",
  "lastName",
  "middleName",
  "primaryEmail",
  "emails",
  "primaryPhone",
  "phones",
  "ownerId",
  "position",
  "department",
  "leadStatus",
  "status",
  "hasAuthority",
  "description",
  "isSubscribed",
  "integrationId",
  "code",
  "mergedIds",
];

export const COMPANY_BASIC_INFOS = [
  "primaryName",
  "names",
  "size",
  "industry",
  "website",
  "plan",
  "primaryEmail",
  "primaryPhone",
  "businessType",
  "description",
  "isSubscribed",
  "parentCompanyId",
];
export const LOG_MAPPINGS = [
  {
    name: MODULE_NAMES.COMPANY,
    schemas: [companySchema],
  },
  {
    name: MODULE_NAMES.CUSTOMER,
    schemas: [customerSchema, locationSchema, visitorContactSchema],
  },
];

export const EMAIL_VALIDATION_STATUSES = {
  VALID: "valid",
  INVALID: "invalid",
  ACCEPT_ALL_UNVERIFIABLE: "accept_all_unverifiable",
  UNVERIFIABLE: "unverifiable",
  UNKNOWN: "unknown",
  DISPOSABLE: "disposable",
  CATCH_ALL: "catchall",
  BAD_SYNTAX: "badsyntax",
};

export const AWS_EMAIL_STATUSES = {
  SEND: "send",
  DELIVERY: "delivery",
  OPEN: "open",
  CLICK: "click",
  COMPLAINT: "complaint",
  BOUNCE: "bounce",
  RENDERING_FAILURE: "renderingfailure",
  REJECT: "reject",
};
export const CUSTOMER_BASIC_INFO = {
  avatar: "Avatar",
  firstName: "First Name",
  lastName: "Last Name",
  middleName: "Middle Name",
  registrationNumber: "Registration Number",
  primaryEmail: "Primary E-mail",
  primaryPhone: "Primary Phone",
  position: "Position",
  department: "Department",
  owner: "Owner",
  pronoun: "Pronoun",
  birthDate: "Birthday",
  hasAuthority: "Has Authority",
  description: "Description",
  isSubscribed: "Subscribed",
  code: "Code",
  score: "Score",

  ALL: [
    { field: "avatar", label: "Avatar", canHide: false },
    { field: "firstName", label: "First Name", canHide: false },
    { field: "lastName", label: "Last Name", canHide: false },
    { field: "middleName", label: "Middle Name", canHide: false },
    {
      field: "registrationNumber",
      label: "Registration Number",
      canHide: true,
    },
    {
      field: "primaryEmail",
      label: "Primary E-mail",
      validation: "email",
      canHide: false,
    },
    {
      field: "primaryPhone",
      label: "Primary Phone",
      validation: "phone",
      canHide: false,
    },
    { field: "position", label: "Position", canHide: true },
    { field: "department", label: "Department", canHide: true },
    { field: "hasAuthority", label: "Has Authority", canHide: true },
    { field: "description", label: "Description", canHide: true },
    { field: "isSubscribed", label: "Subscribed", canHide: true },
    { field: "owner", label: "Owner", canHide: true },
    { field: "pronoun", label: "Pronoun", canHide: true },
    { field: "birthDate", label: "Birthday", canHide: true },
    { field: "code", label: "Code", canHide: true },
    { field: "score", label: "Score", canHide: true },
  ],
};

export const COMPANY_INFO = {
  avatar: "Logo",
  code: "Code",
  primaryName: "Primary Name",
  size: "Size",
  industry: "Industries",
  plan: "Plan",
  primaryEmail: "Primary Email",
  primaryPhone: "Primary Phone",
  businessType: "Business Type",
  description: "Description",
  isSubscribed: "Subscribed",
  location: "Headquarters Country",
  score: "Score",

  ALL: [
    { field: "avatar", label: "Logo", canHide: false },
    { field: "primaryName", label: "Primary Name", canHide: false },
    {
      field: "primaryEmail",
      label: "Primary E-mail",
      validation: "email",
      canHide: false,
    },
    {
      field: "primaryPhone",
      label: "Primary Phone",
      validation: "phone",
      canHide: false,
    },
    { field: "size", label: "Size" },
    { field: "industry", label: "Industries" },
    { field: "plan", label: "Plan" },
    { field: "owner", label: "Owner", canHide: true },
    { field: "businessType", label: "Business Type", canHide: true },
    { field: "code", label: "Code", canHide: true },
    { field: "description", label: "Description", canHide: true },
    { field: "isSubscribed", label: "Subscribed", canHide: true },
    { field: "location", label: "Headquarters Country", canHide: true },
    { field: "score", label: "Score", canHide: true },
  ],
};

export const DEVICE_PROPERTIES_INFO = {
  location: "Location",
  browser: "Browser",
  platform: "Platform",
  ipAddress: "IP Address",
  hostName: "Hostname",
  language: "Language",
  agent: "User Agent",
  ALL: [
    { field: "location", label: "Location" },
    { field: "browser", label: "Browser" },
    { field: "platform", label: "Platform" },
    { field: "ipAddress", label: "IP Address" },
    { field: "hostName", label: "Hostname" },
    { field: "language", label: "Language" },
    { field: "agent", label: "User Agent" },
  ],
};

export const NOTIFICATION_MODULES = [
  {
    name: "customers",
    description: "Customers",
    icon: "user",
    types: [
      {
        name: "customerMention",
        text: "Mention on customer note",
      },
    ],
  },
  {
    name: "companies",
    description: "Companies",
    icon: "building",
    types: [
      {
        name: "companyMention",
        text: "Mention on company note",
      },
    ],
  },
];

export const ACTIVITY_CONTENT_TYPES = {
  CUSTOMER: "customer",
  COMPANY: "company",
  ALL: ["customer", "company"],
};

export { STATUSES, DEFAULT_SEX_CHOICES };

export const COMPANY_SELECT_OPTIONS = {
  BUSINESS_TYPES: [
    { label: "Competitor", value: "Competitor" },
    { label: "Customer", value: "Customer" },
    { label: "Investor", value: "Investor" },
    { label: "Partner", value: "Partner" },
    { label: "Press", value: "Press" },
    { label: "Prospect", value: "Prospect" },
    { label: "Reseller", value: "Reseller" },
    { label: "Other", value: "Other" },
    { label: "Unknown", value: "" },
  ],
  STATUSES,
  DO_NOT_DISTURB: [
    { label: "Yes", value: "Yes" },
    { label: "No", value: "No" },
    { label: "Unknown", value: "" },
  ],
};

export const CUSTOMER_SELECT_OPTIONS = {
  SEX: [
    ...DEFAULT_SEX_CHOICES,
    { label: "co/co", value: 10 },
    { label: "en/en", value: 11 },
    { label: "ey/em", value: 12 },
    { label: "he/him", value: 13 },
    { label: "he/them", value: 14 },
    { label: "she/her", value: 15 },
    { label: "she/them", value: 16 },
    { label: "they/them", value: 17 },
    { label: "xie/hir", value: 18 },
    { label: "yo/yo", value: 19 },
    { label: "ze/zir", value: 20 },
    { label: "ve/vis", value: 21 },
    { label: "xe/xem", value: 22 },
  ],
  EMAIL_VALIDATION_STATUSES: [
    { label: "Valid", value: "valid" },
    { label: "Invalid", value: "invalid" },
    { label: "Accept all unverifiable", value: "accept_all_unverifiable" },
    { label: "Unverifiable", value: "unverifiable" },
    { label: "Unknown", value: "unknown" },
    { label: "Disposable", value: "disposable" },
    { label: "Catch all", value: "catchall" },
    { label: "Bad syntax", value: "badsyntax" },
  ],
  PHONE_VALIDATION_STATUSES: [
    { label: "Valid", value: "valid" },
    { label: "Invalid", value: "invalid" },
    { label: "Unknown", value: "unknown" },
    { label: "Can receive sms", value: "receives_sms" },
    { label: "Unverifiable", value: "unverifiable" },
  ],
  LEAD_STATUS_TYPES: [
    { label: "New", value: "new" },
    { label: "Contacted", value: "attemptedToContact" },
    { label: "Working", value: "inProgress" },
    { label: "Bad Timing", value: "badTiming" },
    { label: "Unqualified", value: "unqualified" },
    { label: "Unknown", value: "" },
  ],
  STATUSES,
  DO_NOT_DISTURB: [
    { label: "Yes", value: "Yes" },
    { label: "No", value: "No" },
    { label: "Unknown", value: "" },
  ],
  HAS_AUTHORITY: [
    { label: "Yes", value: "Yes" },
    { label: "No", value: "No" },
    { label: "Unknown", value: "" },
  ],
  STATE: [
    { label: "Visitor", value: "visitor" },
    { label: "Lead", value: "lead" },
    { label: "Customer", value: "customer" },
  ],
};

export const TAG_TYPES = {
  CUSTOMER: "core:customer",
  COMPANY: "core:company",
  PRODUCT: "core:product",
  FORM: "core:form",
};
