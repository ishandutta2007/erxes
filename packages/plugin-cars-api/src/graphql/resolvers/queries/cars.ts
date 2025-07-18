import { paginate } from "@erxes/api-utils/src/core";
import {
  checkPermission,
  requireLogin,
} from "@erxes/api-utils/src/permissions";
import { IContext } from "../../../connectionResolver";
import { sendCoreMessage } from "../../../messageBroker";
import { Builder, countBySegment } from "../../../utils";

const generateFilter = async (
  subdomain: string,
  params,
  commonQuerySelector,
  models
) => {
  const { tag, segment, segmentData } = params;

  const filter: any = commonQuerySelector;

  // filter.status = { $ne: "Deleted" };

  if (params.categoryId) {
    filter.categoryId = params.categoryId;
  }

  if (params.searchValue) {
    filter.searchText = { $in: [new RegExp(`.*${params.searchValue}.*`, "i")] };
  }

  if (params.ids) {
    filter._id = { $in: params.ids };
  }

  if (
    params.conformityMainTypeId &&
    params.conformityMainType &&
    params.conformityIsSaved
  ) {
    filter._id = {
      $in: await sendCoreMessage({
        subdomain,
        action: "conformities.savedConformity",
        data: {
          mainType: params.conformityMainType,
          mainTypeId: params.conformityMainTypeId,
          relTypes: ["car"],
        },
        isRPC: true,
        defaultValue: [],
      }),
    };
  }

  if (
    params.conformityMainTypeId &&
    params.conformityMainType &&
    params.conformityIsRelated
  ) {
    filter._id = {
      $in: await sendCoreMessage({
        subdomain,
        action: "conformities.relatedConformity",
        data: {
          mainType: params.conformityMainType,
          mainTypeId: params.conformityMainTypeId,
          relType: "car",
        },
        isRPC: true,
        defaultValue: [],
      }),
    };
  }

  if (tag) {
    filter.tagIds = { $in: [tag] };
  }

  if (segment || segmentData) {
    const qb = new Builder(models, subdomain, { segment, segmentData }, {});

    await qb.buildAllQueries();

    const { list } = await qb.runQueries();

    filter._id = { $in: list.map((l) => l._id) };
  }

  return filter;
};

export const sortBuilder = (params) => {
  const sortField = params.sortField;
  const sortDirection = params.sortDirection || 0;

  if (sortField) {
    return { [sortField]: sortDirection };
  }

  return {};
};

const carQueries = {
  cars: async (
    _root,
    params,
    { subdomain, commonQuerySelector, models }: IContext
  ) => {
    return paginate(
      models.Cars.find(
        await generateFilter(subdomain, params, commonQuerySelector, models)
      ),
      {
        page: params.page,
        perPage: params.perPage,
      }
    );
  },

  carsMain: async (
    _root,
    params,
    { subdomain, commonQuerySelector, models }: IContext
  ) => {
    const filter = await generateFilter(
      subdomain,
      params,
      commonQuerySelector,
      models
    );

    return {
      list: await paginate(models.Cars.find(filter).sort(sortBuilder(params)), {
        page: params.page,
        perPage: params.perPage,
      }),
      totalCount: await models.Cars.find(filter).countDocuments(),
    };
  },

  carDetail: async (_root, { _id }, { models }: IContext) => {
    return models.Cars.getCar(_id);
  },

  carCategories: async (
    _root,
    { parentId, searchValue },
    { commonQuerySelector, models }: IContext
  ) => {
    const filter: any = commonQuerySelector;

    if (parentId) {
      filter.parentId = parentId;
    }

    if (searchValue) {
      filter.name = new RegExp(`.*${searchValue}.*`, "i");
    }

    return models.CarCategories.find(filter).sort({ order: 1 });
  },

  carCategoriesTotalCount: async (_root, _param, { models }: IContext) => {
    return models.CarCategories.find().countDocuments();
  },

  carCategoryDetail: async (_root, { _id }, { models }: IContext) => {
    return models.CarCategories.findOne({ _id });
  },

  carCounts: async (
    _root,
    params,
    { commonQuerySelector, commonQuerySelectorElk, models, subdomain }: IContext
  ) => {
    const counts = {
      bySegment: {},
      byTag: {},
    };

    const { only } = params;

    const qb = new Builder(models, subdomain, params, {
      commonQuerySelector,
      commonQuerySelectorElk,
    });

    switch (only) {
      case "bySegment":
        counts.bySegment = await countBySegment(subdomain, "cars:car", qb);
        break;
    }

    return counts;
  },

  async carCountByTags(_root, _params, { models, subdomain }: IContext) {
    const counts = {};

    // Count products by tag =========
    const tags = await sendCoreMessage({
      subdomain,
      action: "tagFind",
      data: {
        type: "cars:car",
      },
      isRPC: true,
      defaultValue: [],
    });

    for (const tag of tags) {
      counts[tag._id] = await models.Cars.find({
        tagIds: tag._id,
        status: { $ne: "Deleted" },
      }).countDocuments();
    }

    return counts;
  },

  cpCarDetail: async (_root, { _id }, { models }: IContext) => {
    return models.Cars.getCar(_id);
  },

  cpCarCategories: async (
    _root,
    { parentId, searchValue },
    { commonQuerySelector, models }: IContext
  ) => {
    const filter: any = commonQuerySelector;

    if (parentId) {
      filter.parentId = parentId;
    }

    if (searchValue) {
      filter.name = new RegExp(`.*${searchValue}.*`, "i");
    }

    return models.CarCategories.find(filter).sort({ order: 1 });
  },

  cpCarCategoriesTotalCount: async (_root, _param, { models }: IContext) => {
    return models.CarCategories.find().countDocuments();
  },

  cpCarCategoryDetail: async (_root, { _id }, { models }: IContext) => {
    return models.CarCategories.findOne({ _id });
  },

  carPlateSuffixes: async (
    _root: undefined,
    _param: undefined,
    { models }: IContext
  ) => {
    const pipeline = [
      {
        $match: {
          plateNumber: { $type: "string" },
        },
      },
      {
        $project: {
          plateSuffix: {
            $substrCP: [
              "$plateNumber",
              { $subtract: [{ $strLenCP: "$plateNumber" }, 3] },
              3,
            ],
          },
        },
      },
      {
        $match: {
          plateSuffix: { $regex: /^[А-Я]{3}$/ },
        },
      },
      {
        $group: {
          _id: null,
          uniquePlateSuffixes: { $addToSet: "$plateSuffix" },
        },
      },
      {
        $project: {
          _id: 0,
          uniquePlateSuffixes: 1,
        },
      },
    ];

    const [result] = await models.Cars.aggregate(pipeline);

    return result?.uniquePlateSuffixes || [];
  },
};

requireLogin(carQueries, "carDetail");

checkPermission(carQueries, "carsMain", "showCars");
checkPermission(carQueries, "carDetail", "showCars");
checkPermission(carQueries, "carCategories", "showCars");
checkPermission(carQueries, "carCategoriesTotalCount", "showCars");
checkPermission(carQueries, "carCategoryDetail", "showCars");

export default carQueries;
