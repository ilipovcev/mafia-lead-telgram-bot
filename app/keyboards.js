module.exports = mainKeyboard = {
  reply_markup: {
    keyboard: [
      [{ text: 'Найти игрока', callback_data: 'search_player' }],
      [{ text: 'Создать игру', callback_data: 'create_game' }],
    ],
  },
};
