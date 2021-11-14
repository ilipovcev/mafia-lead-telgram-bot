const axios = require('axios');

module.exports = class MafiaApi {
  static ROOT_URL = 'https://api.mafia.arkan1.ru/v1/';
  static DEFAULT_TIMEOUT = 10 * 1000;
  static API_TOKEN = null;
  static USER = {};

  static request(method, path, data = {}, options = {}) {
    return new Promise((resolve, reject) => {
      axios
        .request({
          url: path,
          baseURL: this.ROOT_URL,
          method,
          data,
          headers: {
            Authorization:
              this.API_TOKEN !== null ? `Bearer ${this.API_TOKEN}` : '',
          },
          timeout: this.DEFAULT_TIMEOUT,
          responseType: 'json',
          ...options,
        })
        .then((response) => {
          const data = response.data;
          const status = response.status;

          if (status != 200) {
            return reject({
              error: {
                code: status,
                message: data.error.message,
              },
            });
          }

          return resolve(data);
        })
        .catch((reason) => {
          return reject({
            error: {
              code: 500,
              message: 'Server error',
              reason,
            },
          });
        });
    });
  }

  static get(path, data = {}, options = {}) {
    return this.request(
      'get',
      path,
      {},
      {
        params: data,
        ...options,
      }
    );
  }

  static post(path, data = {}, options = {}) {
    return this.request('put', path, data, options);
  }

  static delete(path, data = {}, options = {}) {
    return this.request('dalete', path, data, options);
  }

  static setApiToken(token) {
    this.API_TOKEN = token;
  }

  static resetApiToken() {
    this.setApiToken(null);
  }

  static makePaginationParams({ page = null, perPage = null }) {
    return {
      ...(page != null ? { p: page } : {}),
      ...(perPage != null ? { pp: perPage } : {}),
    };
  }

  static paginated(
    path,
    paginateOptions = {
      page: null,
      perPage: null,
    },
    data = {},
    options = {}
  ) {
    return MafiaApi.get(
      path,
      {
        ...MafiaApi.makePaginationParams(paginateOptions),
        ...data,
      },
      options
    );
  }

  static search(
    path,
    search = {},
    paginateOptions = { page: null, perPage: null },
    data = {},
    options = {}
  ) {
    return MafiaApi.paginated(
      path,
      paginateOptions,
      {
        ...data,
        ...search,
      },
      options
    );
  }

  static auth(token) {
    this.setApiToken(token);

    return new Promise((resolve, reject) => {
      this.Users.get()
        .then((user) => {
          this.USER = Object(user);
          resolve(this.USER);
        })
        .catch(reject);
    });
  }

  static testAuth() {
    return new Promise((resolve, reject) => {
      this.get('test')
        .then((token) => {
          this.auth(String(token)).then(resolve).catch(reject);
        })
        .catch(reject);
    });
  }

  static Users = class Users {
    static get(options = {}) {
      return MafiaApi.get('user', {}, options);
    }
  };

  static Players = class Players {
    static list(paginateOptions = {}, data = {}, options = {}) {
      return MafiaApi.paginated('players', paginateOptions, data, options);
    }

    static search(search = {}, paginatedOptions = {}, data = {}, options = {}) {
      return MafiaApi.search(
        'players/search',
        search,
        paginatedOptions,
        data,
        options
      );
    }

    static get(player_id, options = {}) {
      return MafiaApi.get('players/' + player_id, {}, options);
    }

    static getGames(player_id, options = {}) {
      return MafiaApi.get(`players/${player_id}/games`, {}, options);
    }

    static getGPLayers(
      player_id,
      paginateOptions = {},
      data = { withGames: false },
      options = {}
    ) {
      return MafiaApi.paginated(
        `players/${player_id}/gPlayers`,
        paginateOptions,
        {
          ...(data.withGames ? { withGames: 1 } : {}),
        },
        options
      );
    }
  };

  static Games = class Games {
    static list(paginateOptions = {}, data = {}, options = {}) {
      return MafiaApi.paginated('games', paginateOptions, data, options);
    }
  };
};
