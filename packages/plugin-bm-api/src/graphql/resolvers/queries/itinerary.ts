import { skip } from 'node:test';
import { IContext } from '../../../connectionResolver';

const itineraryQueries = {
  async bmItineraries(
    _root,
    { categories, page = 1, perPage = 10 },
    { models }: IContext
  ) {
    const selector: any = {};

    const skip = Math.max(0, page - 1) * perPage;
    if (categories) {
      selector.categories = { $in: categories };
    }

    return await models.Itineraries.find(selector).limit(perPage).skip(skip);
  },
};

export default itineraryQueries;
