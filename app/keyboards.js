const { Markup } = require('telegraf');

const backButton = {
  text: 'Назад',
  callback_data: 'back',
};

const mainKeyboard = Markup.keyboard(['Игроки', 'Игры']).resize();

const authButton = Markup.keyboard(['Авторизоваться']).oneTime().resize();

const playersKeyboard = (isAdmin = false) =>
  Markup.keyboard([
    ['Назад', 'Найти игрока'],
    isAdmin ? ['Добавить игрока'] : [],
  ]).resize();

const gamesKeyboard = {
  reply_markup: {
    keyboard: [
      [backButton, { text: 'Найти игру', callback_data: 'search_game' }],
      [{ text: 'Создать игру', callback_data: 'create_game' }],
    ],
  },
};

const playerInlineKeyboard = (id) =>
  Markup.inlineKeyboard([
    Markup.button.callback(
      'Получить информацию об игроке',
      `get_player_info_${id}`
    ),
  ]);

module.exports = {
  mainKeyboard,
  playersKeyboard,
  gamesKeyboard,
  authButton,
  playerInlineKeyboard,
};
