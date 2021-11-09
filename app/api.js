import axios, { AxiosRequestConfig, Method } from 'axios';

class MafiaApi {
  static ROOT_URL = 'https://api.mafia.arkan1.ru/v1/';
  static DEFAULT_TIMEOUT = 10 * 1000;
  static API_TOKEN = null;
  static USER = null;

  static request(method, path, data, options) {
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
}
