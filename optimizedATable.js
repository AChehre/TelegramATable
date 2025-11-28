const CallbackActions = {
	Table: 'A',
	Ignore: 'I',
	Prev: 'P',
	Next: 'N',
};

const PageSize = 3;

// pack callback_data: A;table;key;P;2;3;rowId
const pack = (t, q, a, p, s, r = '') => `${CallbackActions.Table};${t};${q};${a};${p};${s};${r}`;

const ignore = (t) => `${CallbackActions.Table};${t};0;I;0;0;`;

function createTable(tableName, queryKey, tableData, page = 1, pageSize = PageSize) {
	const rows = [];

	// -------- HEADER --------
	if (Array.isArray(tableData.columns)) {
		rows.push(
			tableData.columns.map((col) => ({
				text: col,
				callback_data: ignore(tableName),
			}))
		);
	}

	// -------- ROWS --------
	for (const r of tableData.rows) {
		const rowKey = r.key ?? ''; // <--- key restored here
		const row = [];

		for (const cell of r.cells) {
			const cd = cell.actionKey ? pack(tableName, queryKey, cell.actionKey, page, pageSize, rowKey) : ignore(tableName);

			row.push({ text: cell.value || cell, callback_data: cd });
		}

		rows.push(row);
	}

	// -------- PAGINATION --------
	const pageCount = Math.max(1, Math.ceil(tableData.totalCount / pageSize));

	const prevBtn =
		page > 1
			? { text: '← قبلی', callback_data: pack(tableName, queryKey, CallbackActions.Prev, page - 1, pageSize) }
			: { text: ' ', callback_data: ignore(tableName) };

	const nextBtn =
		page < pageCount
			? { text: 'بعدی →', callback_data: pack(tableName, queryKey, CallbackActions.Next, page + 1, pageSize) }
			: { text: ' ', callback_data: ignore(tableName) };

	rows.push([prevBtn, { text: `صفحه ${page} از ${pageCount}`, callback_data: ignore(tableName) }, nextBtn]);

	return { inline_keyboard: rows };
}

async function processATable(ctx, queryHandler) {
	const d = ctx.callbackQuery.data.split(';');

	// A;table;key;P;2;3;rowId
	const [, tableName, queryKey, action, pageStr, sizeStr, rowKey] = d;

	if (action === CallbackActions.Ignore) {
		return ctx.answerCallbackQuery();
	}

	const page = Number(pageStr);
	const size = Number(sizeStr);

	const tableData = await queryHandler.getTableData(queryKey, page, size, rowKey);

	if (!tableData.rows.length) {
		return ctx.editMessageText('داده‌ای موجود نیست! ❕');
	}

	return ctx.editMessageReplyMarkup({
		reply_markup: createTable(tableName, queryKey, tableData, page, size),
	});
}

module.exports = { createTable, processATable, CallbackActions };
