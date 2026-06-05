const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const db = new sqlite3.Database('teams-up.sqlite');

const adminEmail = 'admin@teams-up.com';
const adminName = 'Admin';
const adminPassword = 'Admin123!';

bcrypt.hash(adminPassword, 10, (err, hash) => {
  if (err) {
    console.error('Ошибка хеширования:', err);
    return;
  }

  const sql = `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'admin')`;
  
  db.run(sql, [adminName, adminEmail, hash], function(err) {
    if (err) {
      console.error('Ошибка создания:', err.message);
    } else {
      console.log('✅ Администратор создан!');
      console.log('');
      console.log('Логин: ' + adminEmail);
      console.log('Пароль: ' + adminPassword);
      console.log('');
    }
    db.close();
  });
});
