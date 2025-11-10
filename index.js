const { Bot } = require("grammy");
const { createTable, processATable } = require("./atable.js");
const { getTableData } = require("./getTableData.js");
require("dotenv").config();

const bot = new Bot(process.env.BOT_TOKEN);

bot.command("start", async (ctx) => {
  const tableData = getTableData(1, 3);

  await ctx.reply("📊 Sample Table", {
    reply_markup: createTable("Fruits", "list", tableData, 1, 3),
  });
});

bot.on("callback_query:data", async (ctx) => {
  await processATable(ctx, {
    getTableData: async (queryKey, page, pageSize) => {

      return getTableData(page, pageSize);
    },
  });
});

bot.start();
console.log("🤖 Bot is running...");
