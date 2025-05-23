export const types = `
    type ScoreCampaign  {
        _id: String,
        title: String,
        description:String,
        add:JSON,
        subtract:JSON,
        createdAt:Date,
        createdUserId:String,
        status:String,
        ownerType:String,
        fieldGroupId:String,
        fieldName:String,
        fieldId:String,
        serviceName:String,
        additionalConfig:JSON

        restrictions: JSON
        onlyClientPortal: Boolean
    }
`;

const COMMON_MUTATION_FIELDS = `
    title: String,
    description:String,
    add:JSON,
    subtract:JSON,
    createdAt:Date,
    createdUserId:String,
    ownerType:String,
    status:String,
    fieldGroupId:String
    fieldName: String
    fieldId: String
    serviceName:String
    additionalConfig:JSON

    restrictions: JSON
    onlyClientPortal: Boolean
`;
const COMMON_QUERIES_FIELDS = `
    page: Int,
    perPage: Int,
    searchValue:String,
    status:String
    serviceName:String
`;

export const mutations = `
    scoreCampaignAdd(${COMMON_MUTATION_FIELDS}):JSON
    scoreCampaignUpdate(_id:String,${COMMON_MUTATION_FIELDS}):JSON
    scoreCampaignRemove(_id:String):JSON
    scoreCampaignsRemove(_ids:[String]):JSON
    refundLoyaltyScore(ownerId:String,ownerType:String,targetId:String):JSON
`;
export const queries = `
    scoreCampaigns(${COMMON_QUERIES_FIELDS}):[ScoreCampaign]
    scoreCampaignsTotalCount(${COMMON_QUERIES_FIELDS}):Int
    scoreCampaign(_id:String):ScoreCampaign
    scoreCampaignAttributes(serviceName:String):JSON
    scoreCampaignServices:JSON
    checkOwnerScore(ownerId:String,ownerType:String,campaignId:String,action:String):JSON
`;
