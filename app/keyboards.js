const backButton = {
  text: 'Назад',
  callback_data: 'back',
};

const mainKeyboard = {
  reply_markup: {
    keyboard: [
      [{ text: 'Игроки', callback_data: 'players' }],
      [{ text: 'Игры', callback_data: 'games' }],
    ],
  },
};

const playersKeyboard = {
  reply_markup: {
    keyboard: [
      [backButton, { text: 'Найти игрока', callback_data: 'search_player' }],
      [{ text: 'Добавить игрока', callback_data: 'create_player' }],
    ],
  },
};

module.exports = { mainKeyboard, playersKeyboard };
