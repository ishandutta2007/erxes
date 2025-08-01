import * as compose from "lodash.flowright";

import { Alert, router as routerUtils, withProps } from "@erxes/ui/src/utils";
import {
  IDragResult,
  IDragStart,
  IFilterParams,
  IItem,
  IItemMap,
  INonFilterParams,
  IOptions,
  IPipeline,
  PipelineDetailQueryResponse,
} from "../types";
import {
  invalidateCache,
  isRefresh,
  reorder,
  reorderItemMap,
  updateItemInfo,
} from "../utils";
import { mutations, queries, subscriptions } from "../graphql";

import InvisibleItemInUrl from "./InvisibleItemInUrl";
import React from "react";
import { UserDetailQueryResponse } from "@erxes/ui/src/auth/types";
import client from "@erxes/ui/src/apolloClient";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { queries as queriesLogs } from "@erxes/ui-log/src/activityLogs/graphql";
import { requestIdleCallback } from "request-idle-callback";
import { setTimeout } from "timers";

type WrapperProps = {
  pipeline: IPipeline;
  initialItemMap?: IItemMap;
  options: IOptions;
  children: any;
  navigate: any;
  location: any;
  queryParams: IFilterParams & INonFilterParams;
  queryParamsChanged: (
    queryParams: IFilterParams,
    nextQueryParams: IFilterParams
  ) => boolean;
};

type Props = WrapperProps & {
  currentUserQuery: UserDetailQueryResponse;
  pipelineDetailQuery: PipelineDetailQueryResponse;
};

type StageLoadMap = {
  [key: string]: "readyToLoad" | "loaded";
};

type State = {
  itemIds: string[];
  itemMap: IItemMap;
  stageLoadMap: StageLoadMap;
  stageIds: string[];
  isShowLabel: boolean;
  isDragEnabled?: boolean;
};

interface IStore {
  options: IOptions;
  itemMap: IItemMap;
  stageLoadMap: StageLoadMap;
  stageIds: string[];
  onLoadStage: (stageId: string, items: IItem[]) => void;
  scheduleStage: (stageId: string) => void;
  refetchStage: (stageId: string) => void;
  onDragEnd: (result: IDragResult) => void;
  onDragStart: (start: IDragStart) => void;
  onAddItem: (stageId: string, item: IItem, aboveItemId?: string) => void;
  onRemoveItem: (itemId: string, stageId: string) => void;
  onUpdateItem: (item: IItem, prevStageId?: string) => void;
  synchSingleCard: (itemId: string) => void;
  isShowLabel: boolean;
  toggleLabels: () => void;
}

const PipelineContext = React.createContext({} as IStore);

export const PipelineConsumer = PipelineContext.Consumer;

type Task = {
  handler: (stageId: string) => void;
  stageId: string;
  isComplete: boolean;
};

class PipelineProviderInner extends React.Component<Props, State> {
  static tasks: Task[] = [];
  static currentTask: Task | null;

  constructor(props: Props) {
    super(props);

    const { pipeline, pipelineDetailQuery, initialItemMap } = props;

    const stageIds = Object.keys(initialItemMap || {});

    this.state = {
      itemIds: [],
      itemMap: initialItemMap || {},
      stageLoadMap: {},
      stageIds,
      isShowLabel: false || localStorage.getItem(pipeline._id) === "true",
    };

    PipelineProviderInner.tasks = [];
    PipelineProviderInner.currentTask = null;

    pipelineDetailQuery.subscribeToMore({
      document: gql(subscriptions.pipelinesChanged),
      variables: { _id: pipeline._id },
      updateQuery: (
        prev,
        {
          subscriptionData: {
            data: { salesPipelinesChanged },
          },
        }
      ) => {
        if (!salesPipelinesChanged || !salesPipelinesChanged.data) {
          return;
        }

        const {
          data: { item, aboveItemId, destinationStageId, oldStageId },
          action,
          proccessId,
        } = salesPipelinesChanged;

        if (proccessId !== localStorage.getItem("proccessId")) {
          if (action === "orderUpdated") {
            let destIndex = aboveItemId
              ? this.findItemIndex(destinationStageId, aboveItemId)
              : 0;

            const srcIndex = this.findItemIndex(oldStageId, item._id);

            if (
              destIndex !== undefined &&
              aboveItemId &&
              ((destinationStageId === oldStageId && destIndex < srcIndex) ||
                destinationStageId !== oldStageId)
            ) {
              destIndex = destIndex + 1;
            }

            this.onDragEnd(
              {
                destination: {
                  droppableId: destinationStageId,
                  index: destIndex,
                },
                draggableId: item._id,
                combine: null,
                mode: "FLUID",
                reason: "DROP",
                source: {
                  item,
                  droppableId: oldStageId,
                  index: srcIndex,
                },
                type: "DEFAULT",
              },
              false
            );
          }

          if (action === "itemAdd") {
            this.onAddItem(destinationStageId, item, aboveItemId);
          }

          if (action === "itemRemove") {
            this.onRemoveItem(item._id, oldStageId);
          }

          if (action === "itemsRemove") {
            const { itemMap } = this.state;

            this.setState({
              itemMap: {
                ...itemMap,
                [destinationStageId]: [],
              },
            });
          }

          if (action === "itemUpdate") {
            this.setState({
              itemMap: updateItemInfo(this.state, item),
            });
          }

          if (action === "itemOfConformitiesUpdate" && item?._doc?._id) {
            setTimeout(() => {
              client
                .query({
                  query: gql(this.props.options.queries.detailQuery),
                  fetchPolicy: "network-only",
                  variables: {
                    _id: item?._doc?._id,
                  },
                })
                .then(({ data }) => {
                  const refetchedItem =
                    data[this.props.options.queriesName.detailQuery];
                  this.setState({
                    itemMap: updateItemInfo(this.state, refetchedItem),
                  });
                });
            }, 5000);
          }

          if (action === "reOrdered") {
            this.refetchStage(destinationStageId);
          } else {
            // refetch stages info ===
            const changedStageIds: string[] = item.stageId
              ? [item.stageId]
              : [];

            if (
              destinationStageId &&
              !changedStageIds.includes(destinationStageId)
            ) {
              changedStageIds.push(destinationStageId);
            }

            if (oldStageId && !changedStageIds.includes(oldStageId)) {
              changedStageIds.push(oldStageId);
            }

            for (const id of changedStageIds) {
              client.query({
                query: gql(queries.stageDetail),
                fetchPolicy: "network-only",
                variables: { _id: id },
              });
            }
          }
        }
      },
    });
  }

  synchSingleCard = (itemId: string) => {
    setTimeout(() => {
      client
        .query({
          query: gql(this.props.options.queries.detailQuery),
          fetchPolicy: "network-only",
          variables: {
            _id: itemId,
          },
        })
        .then(({ data }) => {
          const refetchedItem =
            data[this.props.options.queriesName.detailQuery];
          this.setState({
            itemMap: updateItemInfo(this.state, refetchedItem),
          });
        });
    }, 1000);
  };

  findItemIndex = (stageId: string, aboveItemId: string) => {
    const { itemMap } = this.state;

    if (!aboveItemId) {
      return;
    }

    let index;

    const items = itemMap[stageId] || [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item._id === aboveItemId) {
        index = i;
        break;
      }
    }

    return index;
  };

  componentWillReceiveProps(nextProps: Props) {
    const { queryParams, queryParamsChanged } = this.props;

    if (queryParamsChanged(queryParams, nextProps.queryParams)) {
      const { stageIds } = this.state;

      PipelineProviderInner.tasks = [];
      PipelineProviderInner.currentTask = null;

      stageIds.forEach((stageId: string) => {
        this.scheduleStage(stageId);
      });
    }
  }

  onDragStart = (_start) => {
    const { isDragEnabled } = this.state;
    if (!isDragEnabled) {
      throw new Error("Not ready to move...");
    }
  };

  onDragEnd = (result, saveToDb = true) => {
    // dropped nowhere
    if (!result.destination) {
      return;
    }

    const source = result.source;
    const destination = result.destination;

    // did not move anywhere - can bail early
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // reordering stage
    if (result.type === "STAGE") {
      const stageIds = reorder(
        this.state.stageIds,
        source.index,
        destination.index
      );

      this.setState({ stageIds });

      // save orders to database
      if (saveToDb) {
        return this.saveStageOrders(stageIds);
      }
    }

    const { itemMap, target, aboveItem } = reorderItemMap({
      itemMap: this.state.itemMap,
      source,
      destination,
    });

    this.setState({
      itemMap,
    });

    invalidateCache();

    // saving to database
    if (saveToDb) {
      this.itemChange({
        itemId: target._id,
        aboveItemId: aboveItem ? aboveItem._id : "",
        destinationStageId: destination.droppableId,
        sourceStageId: source.droppableId,
      });
    }
  };

  refetchQueryVariables = () => {
    const { options, queryParams } = this.props;

    return {
      search: queryParams.search,
      customerIds: queryParams.customerIds,
      companyIds: queryParams.companyIds,
      assignedUserIds: queryParams.assignedUserIds,
      extraParams: options.getExtraParams(queryParams),
      closeDateType: queryParams.closeDateType,
      userIds: queryParams.userIds,
      segment: queryParams.segment,
      startDate: queryParams.startDate,
      endDate: queryParams.endDate,
      assignedToMe: queryParams.assignedToMe,
    };
  };

  refetchQueryBuild = (stageId: string) => {
    return {
      query: gql(queries.stageDetail),
      variables: {
        _id: stageId,
        ...this.refetchQueryVariables(),
      },
    };
  };

  refetchQueryLogs = (itemId: string) => {
    return {
      query: gql(queriesLogs.activityLogs),
      variables: {
        contentId: itemId,
        contentType: "sales:deal",
      },
    };
  };

  refetchStagesQueryBuild = (pipelineId: string) => {
    return {
      query: gql(queries.stages),
      variables: {
        pipelineId,
        ...this.refetchQueryVariables(),
      },
    };
  };

  itemChange = (args: {
    itemId: string;
    aboveItemId?: string;
    destinationStageId: string;
    sourceStageId: string;
  }) => {
    const { itemId, aboveItemId, destinationStageId, sourceStageId } = args;

    const { options } = this.props;
    const refetchQueries = [
      this.refetchQueryBuild(destinationStageId),
      this.refetchQueryLogs(itemId),
    ];

    if (sourceStageId) {
      refetchQueries.unshift(this.refetchQueryBuild(sourceStageId));
    }

    const proccessId = Math.random().toString();
    localStorage.setItem("proccessId", proccessId);

    client
      .mutate({
        mutation: gql(options.mutations.changeMutation),
        variables: {
          itemId,
          aboveItemId,
          destinationStageId,
          sourceStageId,
          proccessId,
        },
        refetchQueries,
      })
      .catch((e: Error) => {
        Alert.error(e.message);
        location.reload();
      });
  };

  saveStageOrders = (stageIds: string[]) => {
    const { pipeline } = this.props;

    client
      .mutate({
        mutation: gql(mutations.stagesUpdateOrder),
        variables: {
          orders: stageIds.map((stageId, index) => ({
            _id: stageId,
            order: index,
          })),
        },
        refetchQueries: [this.refetchStagesQueryBuild(pipeline._id)],
      })
      .catch((e: Error) => {
        Alert.error(e.message);
      });
  };

  /*
   * - Stage container is sending loaded to items
   * - Storing sent items to global itemsMap
   * - Mark stage's task as complete
   * - Mark stage's loading state as loaded
   */
  onLoadStage = (stageId: string, items: IItem[]) => {
    const { itemMap, stageLoadMap, itemIds } = this.state;
    const task = PipelineProviderInner.tasks.find((t) => t.stageId === stageId);

    if (task) {
      task.isComplete = true;
    }

    const newItemIds = [...itemIds, ...items.map((item) => item._id)];

    this.setState({
      itemIds: Array.from(new Set(newItemIds)),
      itemMap: { ...itemMap, [stageId]: items },
      stageLoadMap: { ...stageLoadMap, [stageId]: "loaded" },
    });
  };

  refetchStage = (stageId: string) => {
    const { stageLoadMap } = this.state;

    this.setState({
      stageLoadMap: { ...stageLoadMap, [stageId]: "readyToLoad" },
    });
  };

  /*
   * Register given stage to tasks queue
   */
  scheduleStage = (stageId: string) => {
    let currentTask = PipelineProviderInner.currentTask;

    PipelineProviderInner.tasks.push({
      handler: (id: string) => {
        const { stageLoadMap } = this.state;
        const states = Object.values(stageLoadMap);

        if (!states.includes("readyToLoad")) {
          this.setState({
            stageLoadMap: { ...stageLoadMap, [id]: "readyToLoad" },
          });
        }
      },
      stageId,
      isComplete: false,
    });

    if (!currentTask) {
      currentTask = requestIdleCallback(this.runTaskQueue);
    }
  };

  /*
   * If browser is idle then find first inComplete task and run it
   */
  runTaskQueue = (deadline: {
    didTimeout: boolean;
    timeRemaining: () => number;
  }) => {
    const inCompleteTask = PipelineProviderInner.tasks.find(
      (task: Task) => !task.isComplete
    );

    while (
      (deadline.timeRemaining() > 0 || deadline.didTimeout) &&
      inCompleteTask
    ) {
      const { handler, stageId } = inCompleteTask;
      handler(stageId);
    }

    PipelineProviderInner.currentTask = null;

    if (inCompleteTask) {
      PipelineProviderInner.currentTask = requestIdleCallback(
        this.runTaskQueue
      );
    }

    if (PipelineProviderInner.currentTask === null) {
      this.setState({ isDragEnabled: true });
    }
  };

  onAddItem = (stageId: string, item: IItem, aboveItemId?: string) => {
    const { itemMap, itemIds } = this.state;
    const items = itemMap[stageId] || [];

    const { queryParams, navigate, location } = this.props;

    if (!aboveItemId) {
      this.setState({
        itemMap: { ...itemMap, [stageId]: [item, ...items] },
        itemIds: [...itemIds, item._id],
      });

      isRefresh(queryParams, routerUtils, navigate, location);

      return;
    }

    const aboveIndex = this.findItemIndex(stageId, aboveItemId);

    if (aboveIndex !== undefined) {
      const newArray = items.map((item) => Object.assign({}, item));
      newArray.splice(aboveIndex + 1, 0, { ...item });
      this.setState({
        itemMap: {
          ...itemMap,
          [stageId]: [...newArray],
        },
        itemIds: [...itemIds, item._id],
      });
    }

    isRefresh(queryParams, routerUtils, navigate, location);
  };

  onRemoveItem = (itemId: string, stageId: string) => {
    const { itemMap } = this.state;

    const items = (itemMap[stageId] || []).filter(
      (item) => item._id !== itemId
    );

    this.setState({
      itemMap: { ...itemMap, [stageId]: items },
    });
  };

  onUpdateItem = (item: IItem, prevStageId?: string) => {
    const { stageId } = item;
    const { itemMap } = this.state;

    // Moved to anothor board or pipeline
    if (!itemMap[stageId] && prevStageId) {
      return this.onRemoveItem(item._id, prevStageId);
    }

    if (item.status === "archived") {
      return this.onRemoveItem(item._id, item.stageId);
    }

    // Moved between stages
    if (prevStageId && stageId !== prevStageId) {
      // remove from old stage
      const prevStageItems = (itemMap[prevStageId] || []).filter(
        (d: IItem) => d._id !== item._id
      );

      // add to new stage's front
      const items = [...itemMap[stageId]];
      items.unshift({ ...item, stageId });

      const newItemMap = {
        ...itemMap,
        [stageId]: items,
        [prevStageId]: prevStageItems,
      };

      this.setState({ itemMap: newItemMap }, () => {
        this.itemChange({
          itemId: item._id,
          destinationStageId: stageId,
          sourceStageId: prevStageId,
        });
      });
    } else {
      const items = [...itemMap[stageId]];
      const index = items.findIndex((d) => d._id === item._id);

      items[index] = item;

      this.setState({
        itemMap: { ...itemMap, [stageId]: items },
      });
    }
  };

  toggleLabels = () => {
    if (!this.state.isShowLabel) {
      localStorage.setItem(this.props.pipeline._id, "true");
    } else {
      localStorage.removeItem(this.props.pipeline._id);
    }

    this.setState({ isShowLabel: !this.state.isShowLabel });
  };

  renderInvisibleItemInUrl = () => {
    const { queryParams, options } = this.props;
    const { itemId } = queryParams;
    const { isDragEnabled } = this.state;

    if (!isDragEnabled || !itemId) {
      return null;
    }

    const { itemIds } = this.state;

    if (itemIds.includes(itemId)) {
      return null;
    }

    return <InvisibleItemInUrl itemId={itemId} options={options} />;
  };

  render() {
    const { itemMap, stageLoadMap, stageIds, isShowLabel } = this.state;

    return (
      <>
        <PipelineContext.Provider
          value={{
            options: this.props.options,
            onDragEnd: this.onDragEnd,
            onDragStart: this.onDragStart,
            onLoadStage: this.onLoadStage,
            scheduleStage: this.scheduleStage,
            refetchStage: this.refetchStage,
            onAddItem: this.onAddItem,
            onRemoveItem: this.onRemoveItem,
            onUpdateItem: this.onUpdateItem,
            synchSingleCard: this.synchSingleCard,
            itemMap,
            stageLoadMap,
            stageIds,
            isShowLabel,
            toggleLabels: this.toggleLabels,
          }}
        >
          {this.props.children}
          {this.renderInvisibleItemInUrl()}
        </PipelineContext.Provider>
      </>
    );
  }
}

export const PipelineProvider = withProps<WrapperProps>(
  compose(
    graphql<Props, PipelineDetailQueryResponse>(gql(queries.pipelineDetail), {
      name: "pipelineDetailQuery",
      options: ({ pipeline }) => ({
        variables: { _id: pipeline._id },
      }),
    })
  )(PipelineProviderInner)
);
