require('dotenv').config();
const MafiaApi = require('./app/api');
const Keyboards = require('./app/keyboards');
const { Telegraf, Markup } = require('telegraf');
const bot = new Telegraf(process.env.TOKEN);

let isAuthorized = true;
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
      await ctx.reply(
        element.nickname,
        Markup.inlineKeyboard([
          Markup.button.callback(
            'Получить информацию об игроке',
            `get_player_info_${element.id}`
          ),
        ])
      );
      // todo inline keyboard
    });
  });
};

const getPlayerById = async (ctx, id) => {
  await ctx.reply(
    'Информация об игроке:',
    kayboardState[kayboardState.length - 1]
  );
  MafiaApi.Players.get(id)
    .then(async (playerData) => {
      console.log(playerData);
      await ctx.reply(
        `Информация об игроке: ${playerData.nickname}`,
        kayboardState[kayboardState.length - 1]
      );
      await ctx.reply(`
      id: ${playerData.id},\nИгровый никнейм: ${playerData.nickname},\nФИО: ${playerData.name},\nДень рождения: ${playerData.birthday},
    `);
    })
    .catch((error) => {
      console.log('Ошибка получения данных игрока');
    });
};

bot.settings(async (ctx) => {
  await ctx.telegram.setMyCommands([
    {
      command: '/foo',
      description: 'foo description',
    },
    {
      command: '/bar',
      description: 'bar description',
    },
    {
      command: '/baz',
      description: 'baz description',
    },
  ]);
});

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

bot.action(/get_player_info_(\d+)/, async (ctx) => {
  console.log('info player');
  const player_id = ctx.match[0].replace(/^\D+/g, '');
  console.log(player_id);
  await ctx.answerCbQuery();
  getPlayerById(ctx, player_id);
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
