import { nanoid } from 'nanoid';

export const field = (options) => {
  const { pkey, type, optional } = options;

  if (type === String && !pkey && !optional) {
    options.validate = /\S+/;
  }

  if (pkey) {
    options.type = String;
    options.default = () => nanoid();
  }

  return options;
};

export const schemaWrapper = (schema) => {
  schema.add({ scopeBrandIds: [String] });

  return schema;
};
