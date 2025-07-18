import { skip } from "node:test";
import { IContext } from "../../../connectionResolver";

const tourQueries = {
  async bmTours(
    _root,
    {
      categories,
      page = 1,
      perPage = 10,
      status,
      innerDate,
      branchId,
      tags,
      startDate1,
      endDate1,
      startDate2,
      endDate2,
      sortField = "createdAt",
      sortDirection = -1,
      groupCode,
      date_status,
    },
    { models }: IContext
  ) {
    const selector: any = {};

    const skip = Math.max(0, page - 1) * perPage;
    if (categories) {
      selector.categories = { $in: categories };
    }
    if (status) {
      selector.status = status;
    }
    if (branchId) {
      selector.status = branchId;
    }
    if (tags) {
      selector.tags = { $in: tags };
    }
    if (innerDate) {
      const dateToCheck = innerDate;
      selector.startDate = { $lte: dateToCheck };
      selector.endDate = { $gte: dateToCheck };

      // selector.$expr = {
      //   $lte: [
      //     dateToCheck,
      //     {
      //       $add: [
      //         '$startDate',
      //         { $multiply: ['$duration', 24 * 60 * 60 * 1000] },
      //       ],
      //     },
      //   ],
      // };
    }

    if (startDate2) {
      if (!selector.startDate) selector.startDate = {};
      selector.startDate["$lte"] = startDate2;
    }
    if (startDate1) {
      if (!selector.startDate) selector.startDate = {};
      selector.startDate["$gte"] = startDate1;
    }

    if (endDate2) {
      if (!selector.endDate) selector.endDate = {};
      selector.endDate["$lte"] = endDate2;
    }
    if (endDate1) {
      if (!selector.endDate) selector.endDate = {};
      selector.endDate["$gte"] = endDate1;
    }
    if (groupCode) {
      selector.groupCode = groupCode;
    }
    if (date_status) {
      selector.date_status = date_status;
    }
    const list = await models.Tours.find(selector)
      .limit(perPage)
      .skip(skip)
      .sort({ [sortField]: sortDirection === -1 ? sortDirection : 1 });
    const total = await models.Tours.find(selector).countDocuments();

    return {
      list,
      total,
    };
  },
  async bmToursGroup(
    _root,
    {
      categories,
      page = 1,
      perPage = 10,
      status,
      innerDate,
      branchId,
      tags,
      startDate1,
      endDate1,
      startDate2,
      endDate2,
      sortField = "createdAt",
      sortDirection = -1,
      groupCode,
      date_status,
    },
    { models }: IContext
  ) {
    const selector: any = {};

    const skip = Math.max(0, page - 1) * perPage;
    if (categories) {
      selector.categories = { $in: categories };
    }
    if (status) {
      selector.status = status;
    }
    if (branchId) {
      selector.status = branchId;
    }
    if (tags) {
      selector.tags = { $in: tags };
    }
    if (innerDate) {
      const dateToCheck = innerDate;
      selector.startDate = { $lte: dateToCheck };
      selector.endDate = { $gte: dateToCheck };

      // selector.$expr = {
      //   $lte: [
      //     dateToCheck,
      //     {
      //       $add: [
      //         '$startDate',
      //         { $multiply: ['$duration', 24 * 60 * 60 * 1000] },
      //       ],
      //     },
      //   ],
      // };
    }

    if (startDate2) {
      if (!selector.startDate) selector.startDate = {};
      selector.startDate["$lte"] = startDate2;
    }
    if (startDate1) {
      if (!selector.startDate) selector.startDate = {};
      selector.startDate["$gte"] = startDate1;
    }

    if (endDate2) {
      if (!selector.endDate) selector.endDate = {};
      selector.endDate["$lte"] = endDate2;
    }
    if (endDate1) {
      if (!selector.endDate) selector.endDate = {};
      selector.endDate["$gte"] = endDate1;
    }
    if (groupCode) {
      selector.groupCode = groupCode;
    }
    if (date_status) {
      selector.date_status = date_status;
    }

    const list = await models.Tours.find({
      ...selector,
      groupCode: { $in: [null, ""] },
    })
      .limit(perPage)
      .skip(skip)
      .sort({ [sortField]: sortDirection === -1 ? sortDirection : 1 });
    const total = await models.Tours.find({
      ...selector,
      groupCode: { $nin: [null, ""] },
    }).countDocuments();

    const group = await models.Tours.aggregate([
      {
        $match: {
          ...selector,
          groupCode: { $nin: [null, ""] }, // Exclude null and empty strings
        },
      },
      {
        $group: {
          _id: "$groupCode", // group by category
          items: { $push: "$$ROOT" }, // push full documents into an array
        },
      },
    ]);
    return {
      list: [...group],
      total,
    };
  },
  async bmToursGroupDetail(_root, { groupCode, status }, { models }: IContext) {
    const selector: any = {};

    const list = await models.Tours.find({
      groupCode: groupCode,
      status: status,
    });

    return { _id: groupCode, items: list };
  },
  async bmTourDetail(_root, { _id }, { models }: IContext) {
    return await models.Tours.findById(_id);
  },
};

export default tourQueries;
