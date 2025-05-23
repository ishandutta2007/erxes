import { skip } from 'node:test';
import { IContext } from '../../../connectionResolver';

const itineraryQueries = {
  async bmItineraries(
    _root,
    {
      categories,
      page = 1,
      perPage = 10,
      branchId,
      sortField = 'createdAt',
      sortDirection = -1
    },
    { models }: IContext
  ) {
    const selector: any = {};
    if (branchId) {
      selector.branchId = branchId;
    }
    const skip = Math.max(0, page - 1) * perPage;
    if (categories) {
      selector.categories = { $in: categories };
    }

    const list = await models.Itineraries.find(selector)
      .limit(perPage)
      .skip(skip)
      .sort({ [sortField]: sortDirection === -1 ? sortDirection : 1 });
    const total = await models.Itineraries.countDocuments();
    return {
      list,
      total
    };
  },
  async bmItineraryDetail(_root, { _id }, { models }: IContext) {
    return await models.Itineraries.findById(_id);
  }
};

export default itineraryQueries;
