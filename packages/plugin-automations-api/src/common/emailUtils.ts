import {
  sendCommonMessage,
  sendCoreMessage,
  sendSegmentsMessage
} from '../messageBroker';
import { EMAIL_RECIPIENTS_TYPES } from '../constants';
import { getEnv } from '../utils';
import * as AWS from 'aws-sdk';
import * as nodemailer from 'nodemailer';
import { debugError } from '@erxes/api-utils/src/debuggers';
import {
  getServices,
  getService,
  isEnabled
} from '@erxes/api-utils/src/serviceDiscovery';
import { putActivityLog } from '../logUtils';

export const getEmailRecipientTypes = async () => {
  let reciepentTypes = [...EMAIL_RECIPIENTS_TYPES];

  const services = await getServices();

  for (const serviceName of services) {
    const service = await getService(serviceName);
    const meta = service.config?.meta || {};

    if (meta?.automations?.constants?.emailRecipIentTypes) {
      const { emailRecipIentTypes } = meta?.automations?.constants || {};

      reciepentTypes = [
        ...reciepentTypes,
        ...emailRecipIentTypes.map((eTR) => ({ ...eTR, serviceName }))
      ];
    }
  }
  return reciepentTypes;
};

const generateEmails = (entry: string | any[], key?: string): string[] => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (Array.isArray(entry)) {
    if (key) {
      entry = entry.map((item) => item?.[key]);
    }

    return entry
      .filter((value) => typeof value === 'string')
      .map((value) => value.trim())
      .filter((value) => emailRegex.test(value));
  }

  if (typeof entry === 'string') {
    return entry
      .split(/[\s,;]+/) // split by space, comma, or semicolon
      .map((value) => value.trim())
      .filter(
        (value) =>
          value &&
          value.toLowerCase() !== 'null' &&
          value.toLowerCase() !== 'undefined' &&
          emailRegex.test(value)
      );
  }

  return [];
};

const getTeamMemberEmails = async ({ subdomain, params }) => {
  const users = await sendCoreMessage({
    subdomain,
    action: 'users.find',
    data: {
      query: {
        ...params
      }
    },
    isRPC: true
  });

  return generateEmails(users, 'email');
};

const getAttributionEmails = async ({
  subdomain,
  serviceName,
  contentType,
  target,
  execution,
  value,
  key
}) => {
  let emails: string[] = [];
  const matches = (value || '').match(/\{\{\s*([^}]+)\s*\}\}/g);
  const attributes = matches.map((match) =>
    match.replace(/\{\{\s*|\s*\}\}/g, '')
  );
  const relatedValueProps = {};

  if (!attributes?.length) {
    return [];
  }

  for (const attribute of attributes) {
    if (attribute === 'triggerExecutors') {
      const excutorEmails = await getSegmentEmails({
        subdomain,
        serviceName,
        contentType,
        execution
      });
      emails = [...emails, ...excutorEmails];
    }

    relatedValueProps[attribute] = {
      key: 'email',
      filter: {
        key: 'registrationToken',
        value: null
      }
    };

    if (['customers', 'companies'].includes(attribute)) {
      relatedValueProps[attribute] = {
        key: 'primaryEmail'
      };
      target[attribute] = null;
    }
  }

  const replacedContent = await sendCommonMessage({
    subdomain,
    serviceName,
    action: 'automations.replacePlaceHolders',
    data: {
      target: { ...target, type: contentType },
      config: {
        [key]: value
      },
      relatedValueProps
    },
    isRPC: true,
    defaultValue: {}
  });

  const generatedEmails = generateEmails(replacedContent[key]);

  console.log({ generatedEmails });

  return [...emails, ...generatedEmails];
};

const getSegmentEmails = async ({
  subdomain,
  serviceName,
  contentType,
  execution
}) => {
  const { triggerConfig, targetId } = execution;
  const contentTypeIds = await sendSegmentsMessage({
    subdomain,
    action: 'fetchSegment',
    data: {
      segmentId: triggerConfig.contentId,
      options: {
        defaultMustSelector: [
          {
            match: {
              _id: targetId
            }
          }
        ]
      }
    },
    isRPC: true,
    defaultValue: []
  });

  if (contentType === 'user') {
    return getTeamMemberEmails({
      subdomain,
      params: { _id: { $in: contentTypeIds } }
    });
  }

  return await sendCommonMessage({
    subdomain,
    serviceName,
    action: 'automations.getRecipientsEmails',
    data: {
      type: contentType,
      config: {
        [`${contentType}Ids`]: contentTypeIds
      }
    },
    isRPC: true
  });
};

const generateFromEmail = (sender, fromUserEmail) => {
  if (sender && fromUserEmail) {
    return `${sender} <${fromUserEmail}>`;
  }

  if (fromUserEmail) {
    return fromUserEmail;
  }

  return null;
};

const replaceDocuments = async (subdomain, content, target) => {
  if (!isEnabled('documents')) {
    return content;
  }

  // Regular expression to match `documents.<id>` within `{{ }}`
  const documentIds = [
    ...content.matchAll(/\{\{\s*document\.([a-zA-Z0-9_]+)\s*\}\}/g)
  ].map((match) => match[1]);

  if (!!documentIds?.length) {
    for (const documentId of documentIds) {
      const response = await sendCommonMessage({
        serviceName: 'documents',
        subdomain,
        action: 'printDocument',
        data: {
          ...target,
          _id: documentId,
          itemId: target._id
        },
        isRPC: true,
        defaultValue: ''
      });

      content = content.replace(`{{ document.${documentId} }}`, response);
    }
  }

  return content;
};

export const generateDoc = async ({
  subdomain,
  target,
  execution,
  triggerType,
  config
}) => {
  const { templateId, fromUserId, sender } = config;
  const [serviceName, type] = triggerType.split(':');
  const version = getEnv({ name: 'VERSION' });
  const DEFAULT_AWS_EMAIL = getEnv({ name: 'DEFAULT_AWS_EMAIL' });

  const template = await sendCoreMessage({
    subdomain,
    action: 'emailTemplatesFindOne',
    data: {
      _id: templateId
    },
    isRPC: true,
    defaultValue: null
  });

  let fromUserEmail = version === 'saas' ? DEFAULT_AWS_EMAIL : '';

  if (fromUserId) {
    const fromUser = await sendCoreMessage({
      subdomain,
      action: 'users.findOne',
      data: {
        _id: fromUserId
      },
      isRPC: true,
      defaultValue: null
    });

    fromUserEmail = fromUser?.email;
  }

  let replacedContent = (template?.content || '').replace(
    new RegExp(`{{\\s*${type}\\.\\s*(.*?)\\s*}}`, 'g'),
    '{{ $1 }}'
  );

  replacedContent = await replaceDocuments(subdomain, replacedContent, target);

  const { subject, content } = await sendCommonMessage({
    subdomain,
    serviceName,
    action: 'automations.replacePlaceHolders',
    data: {
      target,
      config: {
        subject: config.subject,
        content: replacedContent
      }
    },
    isRPC: true,
    defaultValue: {}
  });

  const toEmails = await getRecipientEmails({
    subdomain,
    config,
    triggerType,
    target,
    execution
  });

  if (!toEmails?.length) {
    throw new Error('"Recieving emails not found"');
  }

  return {
    title: subject,
    fromEmail: generateFromEmail(sender, fromUserEmail),
    toEmails: toEmails.filter((email) => fromUserEmail !== email),
    customHtml: content
  };
};

export const getRecipientEmails = async ({
  subdomain,
  config,
  triggerType,
  target,
  execution
}) => {
  let toEmails: string[] = [];
  const reciepentTypes: any = await getEmailRecipientTypes();

  const reciepentTypeKeys = reciepentTypes.map((rT) => rT.name);

  for (const key of Object.keys(config)) {
    if (reciepentTypeKeys.includes(key) && !!config[key]) {
      const [serviceName, contentType] = triggerType
        .replace('.', ':')
        .split(':');

      const { type, ...reciepentType } = reciepentTypes.find(
        (rT) => rT.name === key
      );

      if (type === 'teamMember') {
        const emails = await getTeamMemberEmails({
          subdomain,
          params: {
            _id: { $in: config[key] || [] }
          }
        });

        toEmails = [...toEmails, ...emails];
        continue;
      }

      if (type === 'attributionMail') {
        const emails = await getAttributionEmails({
          subdomain,
          serviceName,
          contentType,
          target,
          execution,
          value: config[key],
          key: type
        });

        toEmails = [...toEmails, ...emails];
        continue;
      }

      if (type === 'customMail') {
        const emails = config[key] || [];

        toEmails = [...toEmails, ...emails];
        continue;
      }

      if (!!reciepentType.serviceName) {
        const emails = await sendCommonMessage({
          subdomain,
          serviceName: reciepentType.serviceName,
          action: 'automations.getRecipientsEmails',
          data: {
            type,
            config
          },
          isRPC: true
        });

        toEmails = [...toEmails, ...emails];
        continue;
      }
    }
  }

  return [...new Set(toEmails)];
};

const setActivityLog = async ({
  subdomain,
  triggerType,
  target,
  responses
}) => {
  for (const response of responses || []) {
    if (response?.messageId) {
      await putActivityLog(subdomain, {
        action: 'putActivityLog',
        data: {
          contentType: triggerType,
          contentId: target._id,
          createdBy: 'automation',
          action: 'sendEmail'
        }
      });
    }
  }
};

export const handleEmail = async ({
  subdomain,
  target,
  execution,
  triggerType,
  config
}) => {
  try {
    const params = await generateDoc({
      subdomain,
      triggerType,
      target,
      config,
      execution
    });

    if (!params) {
      return { error: 'Something went wrong fetching data' };
    }

    const responses = await sendEmails({
      subdomain,
      params
    });

    await setActivityLog({
      subdomain,
      triggerType,
      target,
      responses
    });

    return { ...params, responses };
  } catch (err) {
    return { error: err.message };
  }
};

const getConfig = (configs, code, defaultValue?: string) => {
  const version = getEnv({ name: 'VERSION' });

  if (version === 'saas') {
    return getEnv({ name: code, defaultValue });
  }

  return configs[code] || defaultValue || '';
};

const createTransporter = async ({ ses }, configs) => {
  if (ses) {
    const AWS_SES_ACCESS_KEY_ID = getConfig(configs, 'AWS_SES_ACCESS_KEY_ID');

    const AWS_SES_SECRET_ACCESS_KEY = getConfig(
      configs,
      'AWS_SES_SECRET_ACCESS_KEY'
    );
    const AWS_REGION = getConfig(configs, 'AWS_REGION');

    AWS.config.update({
      region: AWS_REGION,
      accessKeyId: AWS_SES_ACCESS_KEY_ID,
      secretAccessKey: AWS_SES_SECRET_ACCESS_KEY
    });

    return nodemailer.createTransport({
      SES: new AWS.SES({ apiVersion: '2010-12-01' })
    });
  }

  const MAIL_SERVICE = configs['MAIL_SERVICE'] || '';
  const MAIL_PORT = configs['MAIL_PORT'] || '';
  const MAIL_USER = configs['MAIL_USER'] || '';
  const MAIL_PASS = configs['MAIL_PASS'] || '';
  const MAIL_HOST = configs['MAIL_HOST'] || '';

  let auth;

  if (MAIL_USER && MAIL_PASS) {
    auth = {
      user: MAIL_USER,
      pass: MAIL_PASS
    };
  }

  return nodemailer.createTransport({
    service: MAIL_SERVICE,
    host: MAIL_HOST,
    port: MAIL_PORT,
    auth
  });
};

const sendEmails = async ({
  subdomain,
  params
}: {
  subdomain: string;
  params: any;
}) => {
  const { toEmails = [], fromEmail, title, customHtml, attachments } = params;

  const configs = await sendCoreMessage({
    subdomain,
    action: 'getConfigs',
    data: {},
    isRPC: true,
    defaultValue: {}
  });

  const NODE_ENV = getEnv({ name: 'NODE_ENV' });

  const DEFAULT_EMAIL_SERVICE = getConfig(
    configs,
    'DEFAULT_EMAIL_SERVICE',
    'SES'
  );
  const COMPANY_EMAIL_FROM = getConfig(configs, 'COMPANY_EMAIL_FROM');
  const AWS_SES_CONFIG_SET = getConfig(configs, 'AWS_SES_CONFIG_SET');
  const AWS_SES_ACCESS_KEY_ID = getConfig(configs, 'AWS_SES_ACCESS_KEY_ID');
  const AWS_SES_SECRET_ACCESS_KEY = getConfig(
    configs,
    'AWS_SES_SECRET_ACCESS_KEY'
  );

  if (!fromEmail && !COMPANY_EMAIL_FROM) {
    throw new Error('From Email is required');
  }

  if (NODE_ENV === 'test') {
    throw new Error('Node environment is required');
  }

  let transporter;

  try {
    transporter = await createTransporter(
      { ses: DEFAULT_EMAIL_SERVICE === 'SES' },
      configs
    );
  } catch (e) {
    debugError(e.message);
    throw new Error(e.message);
  }

  const responses: any[] = [];
  for (const toEmail of toEmails) {
    const mailOptions: any = {
      from: fromEmail || COMPANY_EMAIL_FROM,
      to: toEmail,
      subject: title,
      html: customHtml,
      attachments
    };
    let headers: { [key: string]: string } = {};

    if (!!AWS_SES_ACCESS_KEY_ID?.length && !!AWS_SES_SECRET_ACCESS_KEY.length) {
      const emailDelivery = await sendCoreMessage({
        subdomain,
        action: 'emailDeliveries.create',
        data: {
          kind: 'transaction',
          to: toEmail,
          from: fromEmail,
          subject: title,
          body: customHtml,
          status: 'pending'
        },
        isRPC: true
      });

      headers = {
        'X-SES-CONFIGURATION-SET': AWS_SES_CONFIG_SET || 'erxes',
        EmailDeliveryId: emailDelivery && emailDelivery._id
      };
    } else {
      headers['X-SES-CONFIGURATION-SET'] = 'erxes';
    }

    mailOptions.headers = headers;

    if (!mailOptions.from) {
      throw new Error(`"From" email address is missing: ${mailOptions.from}`);
    }

    try {
      const info = await transporter.sendMail(mailOptions);
      responses.push({ messageId: info.messageId, toEmail });
    } catch (error) {
      responses.push({ fromEmail, toEmail, error });
      debugError(error);
    }
  }

  return responses;
};
