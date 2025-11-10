const { InlineKeyboard } = require("grammy");

const CallbackActions = {
  ATableCallback: "ATABLE",
  Ignore: "IGNORE",
  PrevPage: "PREV-PAGE",
  NextPage: "NEXT-PAGE",
};

const PageSize = 3;

function createCallbackData(tableName, queryKey, action, page, pageSize, rowKey = "") {
  return `${CallbackActions.ATableCallback};${tableName};${queryKey};${action};${page};${pageSize};${rowKey}`;
}

function createIgnoreCallbackData(tableName) {
  return `${CallbackActions.ATableCallback};${tableName};0;${CallbackActions.Ignore};0;0;`;
}

function createTable(tableName, queryKey, tableData, page = 1, pageSize = PageSize) {
  const rows = [];

  if (Array.isArray(tableData.columns) && tableData.columns.length > 0) {
    const columnButtons = tableData.columns.map((col) => ({
      text: col,
      callback_data: createIgnoreCallbackData(tableName),
    }));
    rows.push(columnButtons);
  }

  for (const resultRow of tableData.rows) {
    let row = [];
    for (const cell of resultRow.cells) {
      if (cell.fullLine && row.length) {
        rows.push(row);
        row = [];
      }

      const callbackData = cell.actionKey
        ? createCallbackData(tableName, queryKey, cell.actionKey, page, pageSize, resultRow.key)
        : createIgnoreCallbackData(tableName);

      row.push({ text: cell.value || cell, callback_data: callbackData });

      if (cell.fullLine && row.length) {
        rows.push(row);
        row = [];
      }
    }

    if (row.length) rows.push(row);
  }

  const pagination = [];

  const prev =
    page <= 1
      ? { text: " ", callback_data: createIgnoreCallbackData(tableName) }
      : { text: "← قبلی", callback_data: createCallbackData(tableName, queryKey, CallbackActions.PrevPage, page - 1, pageSize) };

  pagination.push(prev);

  const pageCount = Math.ceil(tableData.totalCount / pageSize);
  pagination.push({
    text: `صفحه ${page} از ${pageCount}`,
    callback_data: createIgnoreCallbackData(tableName),
  });

  const next =
    page >= pageCount
      ? { text: " ", callback_data: createIgnoreCallbackData(tableName) }
      : { text: "بعدی →", callback_data: createCallbackData(tableName, queryKey, CallbackActions.NextPage, page + 1, pageSize) };

  pagination.push(next);
  rows.push(pagination);

  return new InlineKeyboard(rows);
}

async function processATable(ctx, queryHandler) {
  const data = ctx.callbackQuery.data.split(";");
  const [_, tableName, queryKey, action, pageStr, pageSizeStr] = data;
  const page = parseInt(pageStr);
  const pageSize = parseInt(pageSizeStr);

  if (action === CallbackActions.Ignore) {
    await ctx.answerCallbackQuery();
    return;
  }

  if (action === CallbackActions.PrevPage || action === CallbackActions.NextPage) {
    let tableData = await queryHandler.getTableData(queryKey, page, pageSize);
    let currentPage = page;

    while (tableData.rows.length === 0 && currentPage > 1) {
      currentPage--;
      tableData = await queryHandler.getTableData(queryKey, currentPage, pageSize);
    }

    if (tableData.rows.length === 0) {
      await ctx.editMessageText("داده ای موجود نیست! ❕");
    } else {
      await ctx.editMessageReplyMarkup({
        reply_markup: createTable(tableName, queryKey, tableData, currentPage, pageSize),
      });
    }

    return;
  }
}

module.exports = { createTable, processATable, CallbackActions };
