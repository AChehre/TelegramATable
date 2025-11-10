function getTableData(page, pageSize) {

  const rows = [
    { key: 1, cells: [{ value: "1" }, { value: "Apple" }, { value: "🍎" }] },
    { key: 2, cells: [{ value: "2" }, { value: "Banana" }, { value: "🍌" }] },
    { key: 3, cells: [{ value: "3" }, { value: "Cherry" }, { value: "🍒" }] },
    { key: 4, cells: [{ value: "4" }, { value: "Grape" }, { value: "🍇" }] },
    { key: 5, cells: [{ value: "5" }, { value: "Orange" }, { value: "🍊" }] },
    { key: 6, cells: [{ value: "6" }, { value: "Strawberry" }, { value: "🍓" }] },
    { key: 7, cells: [{ value: "7" }, { value: "Pineapple" }, { value: "🍍" }] },
    { key: 8, cells: [{ value: "8" }, { value: "Watermelon" }, { value: "🍉" }] },
    { key: 9, cells: [{ value: "9" }, { value: "Peach" }, { value: "🍑" }] },
    { key: 10, cells: [{ value: "10" }, { value: "Kiwi" }, { value: "🥝" }] },
  ];

  let selectedRows = rows.slice((page - 1) * pageSize, page * pageSize);
  const tableData = {
    columns: ["ID", "Name", "Value"],
    rows: selectedRows,
    totalCount: rows.length,
  };

  return tableData;

}

module.exports = { getTableData };
