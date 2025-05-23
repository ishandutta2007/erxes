import { generateModels } from "./connectionResolver";
import { IMPORT_EXPORT_TYPES } from "./constants";
import { sendCoreMessage } from "./messageBroker";
import { createConformity } from './graphql/utils';

export default {
  importExportTypes: IMPORT_EXPORT_TYPES,
  insertImportItems: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { docs, contentType } = data;

    try {
      let objects;
      let model;

      switch (contentType) {
        case "purchase":
          model = models.Purchases;
          break;
      }

      objects = await model.insertMany(docs);

      (docs || []).forEach((doc, index) => {
        const { customers } = doc || {};

        if ((customers || []).length) {
          const { _id } = objects[index] || {};

          createConformity(subdomain, {
            mainType: contentType,
            mainTypeId: _id,
            customerIds: customers,
          });
        }
      });

      return { objects, updated: 0 };
    } catch (e) {
      return { error: e.message };
    }
  },

  prepareImportDocs: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    const { result, properties, contentType, user } = data;

    const bulkDoc: any = [];

    // Iterating field values
    for (const fieldValue of result) {
      const doc: any = {
        customFieldsData: []
      };

      let colIndex: number = 0;
      let boardName: string = "";
      let pipelineName: string = "";
      let stageName: string = "";

      // Iterating through detailed properties
      for (const property of properties) {
        const value = (fieldValue[colIndex] || "").toString();

        switch (property.name) {
          case "customProperty":
            {
              doc.customFieldsData.push({
                field: property.id,
                value: fieldValue[colIndex]
              });

              doc.customFieldsData = await sendCoreMessage({
                subdomain,
                action: "fields.prepareCustomFieldsData",
                data: doc.customFieldsData,
                isRPC: true,
                defaultValue: doc.customFieldsData,
                timeout: 60 * 1000 // 1 minute,
              });
            }
            break;

          case "boardName":
            boardName = value;
            break;

          case "pipelineName":
            pipelineName = value;
            break;

          case "stageName":
            stageName = value;
            break;

          case 'labelIds':
            {
              const values = (value || '').trim().split(/\s*,\s*/);

              const pipeline = pipelineName
                ? await models.Pipelines.findOne({ name: pipelineName })
                : null;

              const labels = await models.PipelineLabels.find({
                name: { $in: values },
                ...(pipeline && { pipelineId: pipeline._id }),
              });

              doc[property.name] = labels?.map((l) => l._id) || [];
            }

            break;

          case 'customers':
            {
              const values = (value || '').trim().split(/\s*,\s*/);

              const customers = await sendCoreMessage({
                subdomain,
                action: 'customers.find',
                data: {
                  $expr: {
                    $or: [
                      { $in: ['$primaryEmail', values] },
                      { $in: ['$primaryPhone', values] },
                      { $in: ['$emails', values] },
                      { $in: ['$phones', values] },
                      { $in: ['$code', values] },
                    ],
                  },
                },
                isRPC: true,
                defaultValue: [],
              });

              doc[property.name] = customers?.map((c) => c._id) || [];
            }
            break;
  
          case "assignedUserEmail":
            {
              const assignedUser = await sendCoreMessage({
                subdomain,
                action: "users.findOne",
                data: { email: value },
                isRPC: true
              });

              doc.assignedUserIds = assignedUser ? [assignedUser._id] : [];
            }

            break;

          default:
            {
              doc[property.name] = value;

              if (property.name === "createdAt" && value) {
                doc.createdAt = new Date(value);
              }

              if (property.name === "modifiedAt" && value) {
                doc.modifiedAt = new Date(value);
              }

              if (property.name === "isComplete") {
                doc.isComplete = Boolean(value);
              }
            }
            break;
        }

        colIndex++;
      }

      if (boardName && pipelineName && stageName) {
        doc.userId = user._id;

        let board = await models.Boards.findOne({
          name: boardName,
          type: contentType
        });

        if (!board) {
          board = await models.Boards.create({
            name: boardName,
            type: contentType,
            userId: user._id
          });
        }

        let pipeline = await models.Pipelines.findOne({
          boardId: board._id,
          name: pipelineName
        });

        if (!pipeline) {
          pipeline = await models.Pipelines.create({
            boardId: board._id,
            name: pipelineName,
            type: contentType,
            userId: user._id
          });
        }

        let stage = await models.Stages.findOne({
          pipelineId: pipeline && pipeline._id,
          name: stageName
        });

        if (!stage) {
          stage = await models.Stages.create({
            pipelineId: pipeline._id,
            name: stageName,
            type: contentType
          });
        }

        doc.stageId = stage ? stage._id : "";
      }

      bulkDoc.push(doc);
    }

    return bulkDoc;
  }
};
