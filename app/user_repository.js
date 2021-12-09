class UserRepository {
  constructor(dao) {
    this.dao = dao;
  }

  createTable() {
    const sql = `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
			chatId INTEGER,
			role TEXT,
			token TEXT
		)`;

    return this.dao.run(sql);
  }

  create(chatId, role, token = 0) {
    return this.dao.run(
      `INSERT INTO users (chatId, role, token) VALUES (?,?,?)`,
      [chatId, role, token]
    );
  }

  getById(id) {
    return this.dao.get(`SELECT * FROM users WHERE id = ?`, [id]);
  }

  getAll() {
    return this.dao.all(`SELECT * FROM users`);
  }
}

module.exports = UserRepository;
