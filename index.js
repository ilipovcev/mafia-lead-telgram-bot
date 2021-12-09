require('dotenv').config();
const MafiaApi = require('./app/api');
const {
  mainKeyboard,
  playersKeyboard,
  gamesKeyboard,
} = require('./app/keyboards');
const TelegramBot = require('node-telegram-bot-api');
const Promise = require('bluebird');
const AppDAO = require('./app/dao');
const UserRepository = require('./app/user_repository');

let navigation = [mainKeyboard];
const bot = new TelegramBot(process.env.TOKEN, { polling: true });
MafiaApi.auth(process.env.API_TOKEN);

const dao = new AppDAO('./users.sqlite3');
const userRepository = new UserRepository(dao);
userRepository.createTable();

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

  if (text === '/games' || text === 'Игры') {
    navigation.push(gamesKeyboard);
    return bot.sendMessage(
      chatId,
      `Список игроков:`,
      navigation[navigation.length - 1]
    );
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

function initUser(id) {
  userRepository.create(id, 'admin', process.env.API_TOKEN);
}
