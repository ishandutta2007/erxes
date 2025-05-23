import { IColumnLabel } from '@erxes/api-utils/src';
import * as dayjs from 'dayjs';
import * as xlsxPopulate from 'xlsx-populate';
import { IModels } from './connectionResolver';
import { fetchTarget } from './graphql/resolvers/customResolvers/coupon';
import { getOwner } from './models/utils';

export const createXlsFile = async () => {
  // Generating blank workbook
  const workbook = await xlsxPopulate.fromBlankAsync();

  return { workbook, sheet: workbook.sheet(0) };
};

export const generateXlsx = async (workbook: any): Promise<string> => {
  return workbook.outputAsync();
};

const addCell = (
  col: IColumnLabel,
  value: string,
  sheet: any,
  columnNames: string[],
  rowIndex: number,
): void => {
  // Checking if existing column
  if (columnNames.includes(col.name)) {
    // If column already exists adding cell
    sheet.cell(rowIndex, columnNames.indexOf(col.name) + 1).value(value);
  } else {
    // Creating column
    sheet.cell(1, columnNames.length + 1).value(col.label || col.name);
    // Creating cell
    sheet.cell(rowIndex, columnNames.length + 1).value(value);

    columnNames.push(col.name);
  }
};

export const buildFile = async (
  models: IModels,
  subdomain: string,
  params: any,
) => {
  const { workbook, sheet } = await createXlsFile();

  const { campaignId } = params;

  const campaign = await models.CouponCampaigns.findOne({ _id: campaignId });

  if (!campaign) {
    throw new Error('No coupon campaign found');
  }

  const filter: any = {};

  if (params.status) {
    filter.status = params.status;
  }

  if (params.ownerType) {
    filter.ownerType = params.ownerType;
  }

  if (params.ownerId) {
    filter.ownerId = params.ownerId;
  }

  if (params.campaignId) {
    filter.campaignId = params.campaignId;
  }

  if (params.fromDate) {
    filter.createdAt = { $gte: new Date(params.fromDate) };
  }

  if (params.toDate) {
    filter.createdAt = {
      ...(filter.createdAt || {}),
      $lt: new Date(params.toDate),
    };
  }

  const data = await models.Coupons.find(filter, { _id: 0, __v: 0 });

  const headers = [
    { name: 'campaignId', label: 'Campaign', width: 20 },
    { name: 'code', label: 'Code', width: 20 },
    { name: 'status', label: 'Status', width: 10 },
    { name: 'usageCount', label: 'Usage', width: 10 },
    { name: 'usageLimit', label: 'Limit', width: 10 },
    { name: 'targetId', label: 'Target', width: 30 },
    { name: 'targetType', label: 'Type', width: 30 },
    { name: 'ownerId', label: 'Owner', width: 30 },
    { name: 'ownerType', label: 'Owner Type', width: 15 },
    { name: 'usedDate', label: 'Used Date', width: 20 },
  ];

  const columnNames: string[] = headers.map((h) => h.name);

  let rowIndex: number = 1;

  for (const column of headers) {
    addCell(column, column.label, sheet, columnNames, rowIndex);
  }

  for (let colIndex = 1; colIndex <= headers.length; colIndex++) {
    sheet.column(colIndex).width(headers[colIndex - 1].width || 15);

    sheet.cell(1, colIndex).style({
      border: true,
      horizontalAlignment: 'center',
      verticalAlignment: 'center',
    });
  }

  rowIndex++;

  for (const item of data) {
    const rowSpan = item.usageLogs?.length || 1;
    const startRow = rowIndex;

    let colIndex = 1;

    for (const column of headers) {
      let cellValue = item[column.name];

      if (column.name === 'campaignId') {
        cellValue = campaign.title || '';
      }

      addCell(column, cellValue, sheet, columnNames, rowIndex);

      if (
        rowSpan > 1 &&
        !['targetId', 'targetType', 'ownerId', 'ownerType', 'usedDate'].includes(
          column.name,
        )
      ) {
        sheet
          .range(
            `${sheet.cell(rowIndex, columnNames.indexOf(column.name) + 1).address()}:${sheet.cell(rowIndex + rowSpan - 1, columnNames.indexOf(column.name) + 1).address()}`,
          )
          .merged(true)
          .style({
            border: {
              left: 'thin',
              right: 'thin',
              top: 'thin',
              bottom: 'thin',
            },
            horizontalAlignment: 'center',
            verticalAlignment: 'center',
          });
      } else {
        sheet.cell(rowIndex, colIndex).style({
          border: {
            left: 'thin',
            right: 'thin',
            top: 'thin',
            bottom: 'thin',
          },
          horizontalAlignment: 'center',
          verticalAlignment: 'center',
        });
      }

      colIndex++;
    }

    if (item.usageLogs?.length) {
      for (const [index, usedBy] of item.usageLogs.entries()) {
        const currentRow = startRow + index;

        const target = await fetchTarget({targetId: usedBy.targetId, serviceName: usedBy.targetType, subdomain})
        const {primaryEmail, email, details} = await getOwner(subdomain, usedBy.ownerType, usedBy.ownerId) || {};
        const { firstName, lastName, fullName } = details || {}

        addCell(
          { name: 'targetId', label: 'Target' },
          target || '',
          sheet,
          columnNames,
          currentRow,
        );
        addCell(
          { name: 'targetType', label: 'Type' },
          usedBy.targetType || '',
          sheet,
          columnNames,
          currentRow,
        );
        addCell(
          { name: 'ownerId', label: 'Owner' },
          primaryEmail || email || firstName || lastName || fullName || '',
          sheet,
          columnNames,
          currentRow,
        );
        addCell(
          { name: 'ownerType', label: 'Owner Type' },
          usedBy.ownerType || '',
          sheet,
          columnNames,
          currentRow,
        );
        addCell(
          { name: 'usedDate', label: 'Used Date' },
          usedBy.usedDate
            ? dayjs(usedBy.usedDate).format('YYYY-MM-DD HH:mm')
            : '',
          sheet,
          columnNames,
          currentRow,
        );

        for (let col = 1; col <= headers.length; col++) {
          sheet.cell(currentRow, col).style({
            border: {
              left: 'thin',
              right: 'thin',
              top: 'thin',
              bottom: 'thin',
            },
            horizontalAlignment: 'center',
            verticalAlignment: 'center',
          });
        }
      }

      rowIndex += rowSpan;
    } else {
      rowIndex++;
    }
  }

  return {
    name: `${campaign.title} - ${dayjs().format('YYYY-MM-DD HH:mm')}`,
    response: await generateXlsx(workbook),
  };
};
