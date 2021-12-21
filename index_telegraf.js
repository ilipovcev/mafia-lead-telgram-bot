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
  kayboardState.push(Keyboards.playersKeyboard(true));
  await ctx.reply(`Список игроков:`, kayboardState[kayboardState.length - 1]);

  MafiaApi.Players.list({ page: page, perPage: 10 }).then((playersData) => {
    playersData.data.forEach(async (element) => {
      await ctx.reply(
        element.nickname,
        Keyboards.playerInlineKeyboard(element.id)
      );
    });
  });
};

const getListGames = async (ctx, page) => {
  await ctx.reply(`Список игр`, kayboardState[kayboardState.length - 1]);
  MafiaApi.Games.list({ page: page, perPage: 10 }).then((gamesData) => {
    gamesData.data.forEach(async (element) => {
      await showGameInfo(ctx, element);
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
      await showPlayerInfo(ctx, playerData);
    })
    .catch((error) => {
      console.log('Ошибка получения данных игрока');
    });
};

const getGamesByPlayer = async (ctx, id) => {
  await ctx.reply(
    'Список игр игрока:',
    kayboardState[kayboardState.length - 1]
  );
  MafiaApi.Players.getGames(id)
    .then((gamesList) => {
      gamesList.forEach(async (game) => {
        await showGameInfo(ctx, game);
      });
    })
    .catch((error) => {
      console.log('Ошибка получения данных');
    });
};

const getGameById = async (ctx, id) => {
  await ctx.reply(
    'Информация об игре:',
    kayboardState[kayboardState.length - 1]
  );
  MafiaApi.Games.get(id)
    .then(async (gameData) => {
      console.log(gameData);
      let result = 'Несыграна';
      if (gameData.result === 'black_win') {
        result = 'Мафия победила';
      } else if (gameData.result === 'red_win') {
        result = 'Город победил';
      }
      const date = new Date(gameData.date);
      const dateDay = date.toLocaleDateString();
      const dateTime = date.toLocaleTimeString();
      const description =
        gameData.description == null
          ? ''
          : `Описание: ${gameData.description}\n`;
      await ctx.reply(`
        id: ${gameData.id},\nИтог игры: ${result}.\nДата: ${dateDay}, ${dateTime}\n${description}
      `);
    })
    .catch((error) => {
      console.log('Ошибка получения данных');
    });
};

const getPlayersByGame = async (ctx, game_id, page) => {
  await ctx.reply('Участники игры:', kayboardState[kayboardState.length - 1]);
  MafiaApi.Games.getPlayers(game_id, { page: page, perPage: 10 })
    .then(async (playersList) => {
      playersList.data.forEach(async (player) => {
        console.log(player);
        await showPlayerInfo(ctx, player);
      });
    })
    .catch((error) => {
      console.log('Ошибка получения данных');
      console.log(error);
    });
};

const showPlayerInfo = async (ctx, playerData) => {
  await ctx.reply(`
    id: ${playerData.id},\nИгровый никнейм: ${playerData.nickname},\nФИО: ${playerData.name},\nДень рождения: ${playerData.birthday},
  `);
};

const showGameInfo = async (ctx, gameData) => {
  let result = 'Несыграна';
  if (gameData.result === 'black_win') {
    result = 'Мафия победила';
  } else if (gameData.result === 'red_win') {
    result = 'Город победил';
  }
  const date = new Date(gameData.date);
  const dateDay = date.toLocaleDateString();
  const dateTime = date.toLocaleTimeString();
  const tournament =
    gameData.tournament == null ? '' : `Турнир: ${gameData.tournament.name}\n`;
  const leader = gameData.leader;
  await ctx.reply(
    `
          Итог игры: ${result}.\nДата: ${dateDay}, ${dateTime}\n${tournament}Ведущий: ${leader.name} (${leader.nickname})\n
        `,
    Markup.inlineKeyboard([
      Markup.button.callback('Подробнее', `get_game_info_${gameData.id}`),
      Markup.button.callback(
        'Участники игры',
        `get_game_players_${gameData.id}`
      ),
    ])
  );
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

bot.hears('Игры', async (ctx) => {
  await getListGames(ctx, 1);
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

bot.action(/get_player_games_(\d+)/, async (ctx) => {
  console.log('info player games');
  const player_id = ctx.match[0].replace(/^\D+/g, '');
  console.log(player_id);
  await ctx.answerCbQuery();
  getGamesByPlayer(ctx, player_id);
});

bot.action(/get_game_info_(\d+)/, async (ctx) => {
  console.log('info game');
  const game_id = ctx.match[0].replace(/^\D+/g, '');
  console.log(game_id);
  await ctx.answerCbQuery();
  getGameById(ctx, game_id);
});

bot.action(/get_game_players_(\d+)/, async (ctx) => {
  console.log('info game players');
  const game_id = ctx.match[0].replace(/^\D+/g, '');
  console.log(game_id);
  await ctx.answerCbQuery();
  getPlayersByGame(ctx, game_id, 1);
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
