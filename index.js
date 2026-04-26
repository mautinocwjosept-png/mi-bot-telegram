const { Telegraf } = require("telegraf");
const fs = require("fs");

const bot = new Telegraf(process.env.BOT_TOKEN);

const dbFile = "db.json";

function loadDB() {
  if (!fs.existsSync(dbFile)) return {};
  return JSON.parse(fs.readFileSync(dbFile));
}

function saveDB(data) {
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
}

bot.start((ctx) => {
  const db = loadDB();

  const userId = ctx.from.id.toString();
  const referrerId = ctx.startPayload;

  if (!db[userId]) {
    db[userId] = {
      invited_by: null,
      referidos: []
    };

    if (referrerId && referrerId !== userId && !isNaN(referrerId)) {
      db[userId].invited_by = referrerId;

      if (!db[referrerId]) {
        db[referrerId] = { invited_by: null, referidos: [] };
      }

      if (!db[referrerId].referidos.includes(userId)) {
        db[referrerId].referidos.push(userId);
      }

      console.log(`Nuevo referido: ${userId}`);
      console.log(`Invitado por: ${referrerId}`);
    }

    saveDB(db);
  }

  ctx.reply("🐱 Bienvenido a Michi Miner");
});

bot.command("referidos", (ctx) => {
  const db = loadDB();
  const userId = ctx.from.id.toString();

  if (!db[userId]) return ctx.reply("No tienes referidos");

  ctx.reply(
    `🐱 Referidos: ${db[userId].referidos.length}\n\n${db[userId].referidos.join("\n")}`
  );
});

bot.launch();