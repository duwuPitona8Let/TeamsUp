const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('teams-up.sqlite');

db.all('SELECT id, name, email, role FROM users', [], (err, rows) => {
  if (err) {
    console.error('Ошибка:', err);
    db.close();
    return;
  }
  
  console.log('Пользователи в базе:');
  console.log('-------------------');
  rows.forEach(row => {
    console.log(`ID: ${row.id} | Имя: ${row.name} | Email: ${row.email} | Роль: ${row.role}`);
  });
  console.log('-------------------');
  
  db.close();
});
