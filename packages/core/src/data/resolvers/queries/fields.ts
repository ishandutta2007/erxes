import {
  checkPermission,
  requireLogin,
} from "@erxes/api-utils/src/permissions";
import {
  fieldsCombinedByContentType,
  getContentTypes,
} from "../../../formUtils";

import { fetchServiceForms } from "../../../messageBroker";
import { IContext } from "../../../connectionResolver";
import { getService, getServices } from "@erxes/api-utils/src/serviceDiscovery";
interface IFieldsDefaultColmns {
  [index: number]: { name: string; label: string; order: number } | {};
}

export interface IFieldsQuery {
  contentType: string;
  contentTypeId?: string;
  isVisible?: boolean;
  isDefinedByErxes?: boolean;
  searchable?: boolean;
  isVisibleToCreate?: boolean;
  groupId?: any;
  isDisabled?: boolean;
}

const fieldQueries = {
  async fieldsGetTypes() {
    const services = await getServices();
    const fieldTypes: Array<{ description: string; contentType: string }> = [];

    for (const serviceName of services) {
      const service = await getService(serviceName);
      const meta = service.config?.meta || {};

      if (meta && meta.forms) {
        const types = meta.forms.types || [];

        for (const type of types) {
          fieldTypes.push({
            description: type.description,
            contentType: `${serviceName}:${type.type}`,
          });
        }
      }
    }

    return fieldTypes;
  },

  async getFieldsInputTypes() {
    const services = await getServices();
    const fieldInputTypes: Array<{ value: string; label: string }> = [
      { value: "input", label: "Input" },
      { value: "list", label: "String List" },
      { value: "objectList", label: "Object List" },
      { value: "textarea", label: "Text area" },
      { value: "select", label: "Select" },
      { value: "multiSelect", label: "Multiple select" },
      { value: "labelSelect", label: "Label select" },
      { value: "check", label: "Checkbox" },
      { value: "radio", label: "Radio button" },
      { value: "file", label: "File" },
      { value: "customer", label: "Customer" },
      { value: "product", label: "Product" },
      { value: "users", label: "Team members" },
      { value: "branch", label: "Branch" },
      { value: "department", label: "Department" },
      { value: "map", label: "Location/Map" },
      {
        value: "isCheckUserTicket",
        label: "Show only the user's assigned(created) tickets",
      },
    ];

    for (const serviceName of services) {
      const service = await getService(serviceName);
      const meta = service.config?.meta || {};

      if (meta && meta.forms) {
        const types = meta.forms?.extraFieldTypes || [];

        for (const type of types) {
          fieldInputTypes.push({
            value: type.value,
            label: type.label,
          });
        }
      }
    }

    return fieldInputTypes;
  },

  /**
   * Fields list
   */
  async fields(
    _root,
    {
      contentType,
      contentTypeId,
      isVisible,
      isVisibleToCreate,
      searchable,
      pipelineId,
      groupIds: inputGroupIds,
      isDefinedByErxes,
      isDisabled,
    }: {
      contentType: string;
      contentTypeId: string;
      isVisible: boolean;
      isVisibleToCreate: boolean;
      searchable: boolean;
      pipelineId: string;
      groupIds: string[];
      isDefinedByErxes: boolean;
      isDisabled: boolean;
    },
    { models }: IContext
  ) {
    const query: IFieldsQuery = { contentType };

    if (contentType) {
      const [serviceName, serviceType] = contentType.split(":");

      if (serviceType === "all") {
        const contentTypes: Array<string> = await getContentTypes(serviceName);
        query.contentType = { $in: contentTypes } as any;
      } else {
        query.contentType = contentType;
      }
    }

    if (contentTypeId) {
      query.contentTypeId = contentTypeId;
    }

    if (isVisible) {
      query.isVisible = isVisible;
    }

    if (searchable !== undefined) {
      query.searchable = searchable;
    }

    const groupIds: string[] = [];

    if (inputGroupIds && inputGroupIds.length > 0) {
      groupIds.push(...inputGroupIds);
    }

    if (isVisibleToCreate !== undefined) {
      query.isVisibleToCreate = isVisibleToCreate;

      const erxesDefinedGroup = await models.FieldsGroups.findOne({
        contentType,
        isDefinedByErxes: true,
        code: { $exists: false },
      });

      if (erxesDefinedGroup) {
        groupIds.push(erxesDefinedGroup._id);
      }
    }

    if (isDefinedByErxes) {
      query.isDefinedByErxes = isDefinedByErxes;
    }
    if (isDisabled) {
      query.isDisabled = isDisabled;
    }

    if (pipelineId) {
      const otherGroupIds = await models.FieldsGroups.find({
        "config.boardsPipelines.pipelineIds": { $in: [pipelineId] },
      })
        .select({ _id: 1 })
        .sort({ order: 1 });

      const allFields: any[] = [];

      const fields = await models.Fields.find({
        ...query,
        groupId: { $in: groupIds },
      }).sort({ order: 1 });

      allFields.push(...fields);

      for (const groupId of otherGroupIds) {
        const groupFields = await models.Fields.find({
          groupId,
          ...query,
        }).sort({ order: 1 });

        allFields.push(...groupFields);
      }

      return allFields;
    }

    if (groupIds && groupIds.length > 0) {
      query.groupId = { $in: groupIds };
    }

    return models.Fields.find(query).sort({ order: 1 });
  },

  /**
   * Generates all field choices base on given kind.
   */
  async fieldsCombinedByContentType(
    _root,
    args,
    { models, subdomain }: IContext
  ) {
    return fieldsCombinedByContentType(models, subdomain, args);
  },

  /**
   * Default list columns config
   */
  async fieldsDefaultColumnsConfig(
    _root,
    { contentType }: { contentType: string }
  ): Promise<IFieldsDefaultColmns> {
    const [serviceName, type] = contentType.split(":");
    const service = await getService(serviceName);

    if (!service) {
      return [];
    }

    const meta = service.config?.meta || {};

    if (meta.forms && meta.forms.defaultColumnsConfig) {
      return meta.forms.defaultColumnsConfig[type] || [];
    }

    return [];
  },

  async fieldsGetDetail(_root, { _id, code }, { models }: IContext) {
    let field = await models.Fields.findOne({ code });

    if (!field) {
      field = await models.Fields.findOne({ _id });
    }

    return field;
  },

  async fieldsGetRelations(
    _root,
    {
      contentType,
      isVisibleToCreate,
    }: { contentType: string; isVisibleToCreate: boolean },
    { models }: IContext
  ) {
    return models.Fields.find({
      contentType,
      isDefinedByErxes: true,
      isVisibleToCreate,
      relationType: { $exists: true },
    });
  },

  async fieldByCode(
    _root,
    { contentType, code }: { contentType: string; code: string },
    { models }: IContext
  ) {
    return models.Fields.findOne({ contentType, code });
  },
};

requireLogin(fieldQueries, "fieldsCombinedByContentType");
requireLogin(fieldQueries, "fieldsDefaultColumnsConfig");

checkPermission(fieldQueries, "fields", "showForms", []);
checkPermission(fieldQueries, "fieldsGetDetail", "showForms", []);

const fieldsGroupQueries = {
  /**
   * Fields group list
   */
  async fieldsGroups(
    _root,
    {
      contentType,
      isDefinedByErxes,
      codes,
      config,
    }: {
      contentType: string;
      isDefinedByErxes: boolean;
      codes: string[];
      config;
    },
    { commonQuerySelector, models, subdomain }: IContext
  ) {
    let query: any = {
      $or: [{ ...commonQuerySelector }, { isDefinedByErxes: true }],
    };

    // querying by content type
    query.contentType = contentType;

    if (contentType) {
      const [serviceName, serviceType] = contentType.split(":");

      if (serviceType === "all") {
        const contentTypes: Array<string> = await getContentTypes(serviceName);
        query.contentType = { $in: contentTypes };
      } else {
        query.contentType = contentType;
      }
    }

    if (config) {
      query = await fetchServiceForms(
        subdomain,
        contentType,
        "groupsFilter",
        { config, contentType },
        query
      );
    }

    if (isDefinedByErxes !== undefined) {
      query.isDefinedByErxes = isDefinedByErxes;
    }

    if (codes && codes.length > 0) {
      query.code = { $in: codes };
    }

    const groups = await models.FieldsGroups.find(query).sort({ order: 1 });
    return groups;
  },

  async getSystemFieldsGroup(
    _root,
    { contentType }: { contentType: string },
    { models }: IContext
  ) {
    const query: any = {};

    // querying by content type
    query.contentType = contentType;
    query.isDefinedByErxes = true;

    return models.FieldsGroups.findOne(query);
  },
};

checkPermission(fieldsGroupQueries, "fieldsGroups", "showForms", []);

export { fieldQueries, fieldsGroupQueries };
