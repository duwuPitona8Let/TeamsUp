const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('teams-up.sqlite');

// Обновляем роль пользователя с ID 7 (никита)
db.run('UPDATE users SET role = ? WHERE id = ?', ['admin', 7], function(err) {
  if (err) {
    console.error('Ошибка обновления:', err);
  } else {
    console.log('✅ Роль пользователя "никита" (nk@ya.ru) изменена на ADMIN');
  }
  db.close();
});
