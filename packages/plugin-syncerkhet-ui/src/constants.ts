export const KEY_LABELS = {
  apiKey: 'api key',
  apiSecret: 'api secret',
  apiToken: 'api token',
  checkCompanyUrl: 'check Company url',
  costAccount: 'cost account',
  saleAccount: 'sale account',
  categoryCode: 'category Code',
  productCategoryCode: 'product Category Code',
  consumeDescription: 'consume products Description',
  customerDefaultName: 'customer Default Name',
  customerCategoryCode: 'customer Category Code',
  companyCategoryCode: 'company Category Code',
  getRemainderApiUrl: 'Get Remainder url'
};

export const menuSyncerkhet = [
  { title: 'Sync history', link: '/sync-erkhet-history' },
  { title: 'Check deals', link: '/check-synced-deals?dateType=firstOrMove' },
  { title: 'Check orders', link: '/check-pos-orders' },
  { title: 'Check Category', link: '/inventory-category' },
  { title: 'Check Products', link: '/inventory-products' }
];

export const payOptions = [
  { value: "debtAmount", label: "Зээлийн данс" },
  { value: "cashAmount", label: "Бэлэн мөнгө данс" },
  { value: "cardAmount", label: "Картын данс" },
  { value: "card2Amount", label: "Картын данс нэмэлт" },
  { value: "mobileAmount", label: "Мобайл данс" },
  { value: "debtBarterAmount", label: "Бартер данс" },
  { value: "preAmount", label: "Урьдчилгаа данс" },
];
