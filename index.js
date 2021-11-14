require('dotenv').config();
const MafiaApi = require('./app/api');
const { mainKeyboard, playersKeyboard } = require('./app/keyboards');
const TelegramBot = require('node-telegram-bot-api');

let navigation = [mainKeyboard];
const bot = new TelegramBot(process.env.TOKEN, { polling: true });
MafiaApi.auth(process.env.API_TOKEN);

bot.setMyCommands([
  { command: '/start', description: 'Запуск приложения' },
  { command: '/players', description: 'Получить список игроков' },
  { command: '/games', description: 'Работа с играми' },
]);

bot.on('callback_query', function onCallbackQuery(callbackQuery) {
  const action = callbackQuery.data;
  const chatid = callbackQuery.message.chat.id;

  console.log('callback');

  if (action === 'players') {
    getListPlayers(chatid, 1);
  }
});

bot.on('message', async (msg) => {
  const text = msg.text;
  const chatId = msg.chat.id;
  navigation = [...new Set(navigation)];

  if (text === '/start') {
    return bot.sendMessage(chatId, 'Привет', navigation[navigation.length - 1]);
  }

  if (text === 'Назад') {
    navigation.length <= 1 ? navigation : navigation.pop();
    console.log(navigation);
    return bot.sendMessage(chatId, '🔙', navigation[navigation.length - 1]);
  }

  if (text === '/players' || text === 'Игроки') {
    return getListPlayers(chatId, 1);
  }

  return bot.sendMessage(
    chatId,
    'Неизвестная команда.',
    navigation[navigation.length - 1]
  );
});

const getListPlayers = (chatId, page) => {
  var playersList = [];
  navigation.push(playersKeyboard);
  bot.sendMessage(chatId, `Список игроков:`, navigation[navigation.length - 1]);
  console.log(navigation);

  MafiaApi.Players.list({ page: page, perPage: 10 }).then((playersData) => {
    playersData.data.forEach((element) => {
      playersList.push(element);
    });

    playersList.forEach((element) => {
      bot.sendMessage(chatId, element.nickname);
    });
  });
};

// bot.onText(/\/echo (.+)/, (msg, match) => {
//   const chatId = msg.chat.id;
//   const resp = match[1];

//   bot.sendMessage(chatId, resp, {
//     reply_markup: {
//       keyboard: [
//         [{ text: 'Текст 1', callback_data: '1' }],
//         [{ text: 'Текст 2', callback_data: '2' }],
//         [{ text: 'Текст 3', callback_data: '3' }],
//       ],
//     },
//   });
// });

// bot.onText(/\/editable/, function onEditableText(msg) {
//   const opts = {
//     reply_markup: {
//       inline_keyboard: [
//         [
//           {
//             text: 'Edit Text',
//             // we shall check for this value when we listen
//             // for "callback_query"
//             callback_data: 'edit',
//           },
//         ],
//       ],
//     },
//   };
//   bot.sendMessage(msg.from.id, 'Original Text', opts);
// });

// // Handle callback queries
// bot.on('callback_query', function onCallbackQuery(callbackQuery) {
//   const action = callbackQuery.data;
//   const msg = callbackQuery.message;
//   const opts = {
//     chat_id: msg.chat.id,
//     message_id: msg.message_id,
//   };
//   let text;

//   if (action === 'edit') {
//     text = 'Edited Text';
//   }

//   bot.editMessageText(text, opts);
// });
