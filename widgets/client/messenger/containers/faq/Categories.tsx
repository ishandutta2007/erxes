import * as React from "react";

import { IFaqCategory, IFaqTopic } from "../../types";

import Articles from "./Articles";
import Categories from "../../components/faq/Categories";
import { getFaqTopicQuery } from "../../graphql/queries";
import gql from "graphql-tag";
import { useQuery } from "@apollo/client";

type Props = {
  topicId?: string;
  searchString: string;
  initialCategory?: IFaqCategory;
};

const CategoriesContainer = (props: Props) => {
  const { data, loading } = useQuery(gql(getFaqTopicQuery), {
    fetchPolicy: "cache-and-network",
    variables: {
      _id: props.topicId,
    },
  });

  if (!data) {
    return null;
  }

  const extendedProps = {
    ...props,
    loading: loading,
    faqTopics: data.knowledgeBaseTopicDetail,
  };

  if (props.searchString) {
    return <Articles {...props} />;
  }

  return <Categories {...extendedProps} />;
};

// type QueryResponse = {
//   knowledgeBaseTopicDetail: IFaqTopic;
// };

export default CategoriesContainer;
