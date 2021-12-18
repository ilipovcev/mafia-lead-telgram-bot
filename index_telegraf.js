require('dotenv').config();
const MafiaApi = require('./app/api');
const Keyboards = require('./app/keyboards');
const { Telegraf } = require('telegraf');
const bot = new Telegraf(process.env.TOKEN);

let isAuthorized = false;
let kayboardState = [Keyboards.mainKeyboard];

const doAuth = async (ctx) => {
  try {
    await MafiaApi.testAuth();
    isAuthorized = true;
    return await ctx.reply(
      'Успешно авторизовано',
      kayboardState[kayboardState.length - 1]
    );
  } catch {
    return ctx.reply('Ошибка авторизации');
  }
};

const getListPlayers = async (ctx, page) => {
  var playersList = [];
  kayboardState.push(Keyboards.playersKeyboard(true));
  await ctx.reply(`Список игроков:`, kayboardState[kayboardState.length - 1]);

  MafiaApi.Players.list({ page: page, perPage: 10 }).then((playersData) => {
    playersData.data.forEach((element) => {
      playersList.push(element);
    });

    playersList.forEach(async (element) => {
      await ctx.reply(element.nickname);
      // todo inline keyboard
    });
  });
};

bot.on('text', async (ctx, next) => {
  if (!isAuthorized) {
    doAuth(ctx);
  } else {
    next();
  }
});

bot.hears('Игроки', async (ctx) => {
  await getListPlayers(ctx, 1);
});

bot.hears('Назад', async (ctx) => {
  if (kayboardState.length > 1) {
    kayboardState.pop();
  }
  await ctx.reply(
    'Возращаемся назад...',
    kayboardState[kayboardState.length - 1]
  );
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
