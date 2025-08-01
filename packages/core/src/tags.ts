import { generateModels, IModels } from "./connectionResolver";
import { sendCommonMessage } from "./messageBroker";

const modelChanger = (type: string, models: IModels) => {
  if (type === "customer") {
    return models.Customers;
  }

  if (type === "product") {
    return models.Products;
  }
  if (type === "reports") {
    return models.Reports;
  }

  return models.Companies;
};

export default {
  types: [
    {
      description: "Customer",
      type: "customer"
    },
    {
      description: "Company",
      type: "company"
    },
    {
      description: "Product & Service",
      type: "product"
    },
    {
      description: "Form",
      type: "form"
    },
    {
      description: "Reports",
      type: "reports"
    }
  ],
  tag: async ({ subdomain, data }) => {
    const { type, action, _ids, tagIds, targetIds } = data;

    const models = await generateModels(subdomain);

    let response = {};
    const model: any = modelChanger(type, models);

    if (action === "count") {
      response = await model.countDocuments({ tagIds: { $in: _ids } });
    }

    if (action === "tagObject") {
      await model.updateMany(
        { _id: { $in: targetIds } },
        { $set: { tagIds } },
        { multi: true }
      );

      response = await model.find({ _id: { $in: targetIds } }).lean();
      sendCommonMessage({
        serviceName: "automations",
        subdomain,
        action: "trigger",
        data: {
          type: `core:${type}`,
          targets: [response]
        },
        isRPC: true,
        defaultValue: null
      });
    }

    return response;
  },
  fixRelatedItems: async ({
    subdomain,
    data: { sourceId, destId, type, action }
  }) => {
    const models = await generateModels(subdomain);
    const model: any = modelChanger(type, models);

    if (action === "remove") {
      await model.updateMany(
        { tagIds: { $in: [sourceId] } },
        { $pull: { tagIds: { $in: [sourceId] } } }
      );
    }

    if (action === "merge") {
      const itemIds = await model
        .find({ tagIds: { $in: [sourceId] } }, { _id: 1 })
        .distinct("_id");

      // add to new destination
      await model.updateMany(
        { _id: { $in: itemIds } },
        { $set: { "tagIds.$[elem]": destId } },
        { arrayFilters: [{ elem: { $eq: sourceId } }] }
      );
    }
  }
};
