import * as DataLoader from 'dataloader';
import * as _ from 'underscore';
import { IModels } from '../connectionResolver';

export default function generateDataLoaderTransaction(models: IModels) {
  return new DataLoader<string, any>(async (ids: readonly string[]) => {
    const result: any[] = await models.Transactions.find({
      _id: { $in: ids },
    }).lean();
    const resultById = _.indexBy(result, '_id');
    return ids.map((id) => resultById[id]);
  });
}
