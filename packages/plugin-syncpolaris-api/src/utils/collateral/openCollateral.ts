import { fetchPolaris } from '../utils';

export const openCollateral = async (
  subdomain: string,
  polarisConfig,
  models,
  syncLog,
  accCode
) => {
  return await fetchPolaris({
    subdomain,
    op: '13610901',
    data: [accCode],
    models,
    polarisConfig,
    syncLog
  });
};
