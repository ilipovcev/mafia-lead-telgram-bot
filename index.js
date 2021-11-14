require('dotenv').config();
const MafiaApi = require('./app/api');
// import mainKeyboard from './app/keyboards';
const mainKeyboard = require('./app/keyboards');
const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.TOKEN, { polling: true });
MafiaApi.auth(process.env.API_TOKEN);

bot.setMyCommands([
  { command: '/start', description: 'Запуск приложения' },
  { command: '/players', description: 'Получить список игроков' },
]);

const start = () => {
  bot.on('callback_query', function onCallbackQuery(callbackQuery) {
    const action = callbackQuery.data;
    const msg = callbackQuery.message;
  });

  bot.on('message', async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;

    if (text === '/start') {
      return bot.sendMessage(chatId, 'Привет', mainKeyboard);
    }
    if (text === '/players') {
      var players = await MafiaApi.Players.list({ page: 1, perPage: 10 });
      return bot.sendMessage(
        chatId,
        `${players.data[1].nickname}`,
        mainKeyboard
      );
    }

    return bot.sendMessage(chatId, 'Неизвестная команда.', mainKeyboard);
  });
};

start();

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
