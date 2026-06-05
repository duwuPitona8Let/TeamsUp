const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('teams-up.sqlite');

// Сначала найдем пользователя с именем Никита
db.get('SELECT id, name, email FROM users WHERE name LIKE ?', ['%Никита%'], (err, user) => {
  if (err) {
    console.error('Ошибка поиска:', err);
    db.close();
    return;
  }
  
  if (!user) {
    console.log('Пользователь с именем "Никита" не найден');
    db.close();
    return;
  }
  
  console.log('Найден пользователь:', user.name, user.email);
  
  // Обновляем роль на admin
  db.run('UPDATE users SET role = ? WHERE id = ?', ['admin', user.id], function(err) {
    if (err) {
      console.error('Ошибка обновления:', err);
    } else {
      console.log('✅ Роль пользователя "' + user.name + '" изменена на ADMIN');
    }
    db.close();
  });
});
