import Spinner from '@erxes/ui/src/components/Spinner';
import Alert from '@erxes/ui/src/utils/Alert';
import * as routerUtils from '@erxes/ui/src/utils/router';
import { gql } from '@apollo/client';
import React from 'react';
import { useQuery, useMutation } from '@apollo/client';

import ClientPortalDetail from '../components/ClientPortalDetail';
import mutations from '../graphql/mutations';
import queries from '../graphql/queries';
import { ClientPortalConfig, ClientPortalConfigQueryResponse } from '../types';
import { useLocation, useNavigate } from 'react-router-dom';
import { removeTypename } from '@erxes/ui/src/utils';

type Props = {
  queryParams: any;
  kind: 'client' | 'vendor';
  closeModal?: () => void;
};

function ClientPortalDetailContainer(props: Props) {
  const { queryParams, kind, closeModal } = props;
  const location = useLocation();
  const navigate = useNavigate();

  const { loading, data = {} } = useQuery<ClientPortalConfigQueryResponse>(
    gql(queries.getConfig),
    {
      variables: { _id: queryParams._id },
      skip: !queryParams._id,
      fetchPolicy: 'cache-and-network',
    }
  );

  const [mutate] = useMutation(gql(mutations.createOrUpdateConfig), {
    refetchQueries: [{ query: gql(queries.getConfigs), variables: { kind } }],
  });

  if (loading) {
    return <Spinner />;
  }

  const handleUpdate = (doc: ClientPortalConfig) => {
    const config: any = { _id: queryParams._id, kind, ...doc };
    delete config.__typename;

    if (config.tokiConfig) {
      const clean = removeTypename(config.tokiConfig);
      config.tokiConfig = clean;
    }

    if (config.environmentVariables) {
      const clean = removeTypename(config.environmentVariables);
      config.environmentVariables = clean;
    }

    mutate({ variables: { config } })
      .then((response = {}) => {
        const { clientPortalConfigUpdate = {} } = response.data || {};

        if (clientPortalConfigUpdate) {
          routerUtils.setParams(navigate, location, {
            _id: clientPortalConfigUpdate._id,
          });
        }

        Alert.success('Successfully updated the Business portal config');

        if (closeModal) {
          closeModal();
        }
      })
      .catch((e) => Alert.error(e.message));
  };

  const updatedProps = {
    ...props,
    queryParams,
    loading,
    config: data.clientPortalGetConfig || { tokenPassMethod: 'cookie' },
    handleUpdate,
  };

  return <ClientPortalDetail {...updatedProps} />;
}

export default ClientPortalDetailContainer;
