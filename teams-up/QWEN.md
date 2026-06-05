# Teams-Up — Nest.js API для управления командами

## Обзор проекта

**Teams-Up** — это REST API приложение для управления командами, пользователями и назначениями ролей. Построено на фреймворке **Nest.js** с использованием **TypeORM** и базы данных **SQLite**.

### Основные возможности

- **Аутентификация и авторизация** — регистрация, логин, JWT-токены
- **Управление пользователями** — профили, роли, редактирование
- **Управление командами** — создание, редактирование, удаление команд
- **Назначения (Assignments)** — назначение пользователей в команды с ролями
- **Ролевая модель** — Guest, User, Project Manager, Admin
- **Администрирование** — управление пользователями, настройка системы, автоформирование команд
- **Project Manager** — создание команд, оценка навыков, поиск участников

### Технологический стек

| Категория      | Технологии                         |
| -------------- | ---------------------------------- |
| Фреймворк      | Nest.js 11                         |
| Язык           | TypeScript 5.7                     |
| База данных    | SQLite (TypeORM)                   |
| Аутентификация | Passport + JWT                     |
| Валидация      | class-validator, class-transformer |
| Хеширование    | bcrypt                             |
| Конфигурация   | @nestjs/config                     |

---

## Структура проекта

```
teams-up/
├── src/
│   ├── admin/              # Модуль администратора
│   ├── assignments/        # Модуль назначений
│   ├── auth/               # Модуль аутентификации
│   ├── config/             # Конфигурация приложения
│   ├── decorators/         # Кастомные декораторы (@Roles, @CurrentUser)
│   ├── dto/                # Data Transfer Objects
│   ├── entities/           # TypeORM сущности
│   ├── guards/             # Guards для защиты роутов
│   ├── project-manager/    # Модуль менеджера проектов
│   ├── teams/              # Модуль команд
│   ├── users/              # Модуль пользователей
│   ├── app.module.ts       # Корневой модуль
│   ├── main.ts             # Точка входа
│   └── ...
├── test/                   # E2E тесты
├── dist/                   # Скомпилированный код
└── ...
```

### Сущности базы данных

1. **User** — пользователи (id, name, email, password, role, registrationDate)
2. **Team** — команды (id, name, description, status, creationDate)
3. **Assignment** — назначения (id, userId, teamId, role, assignmentDate)
4. **Admin** — администраторы (id, rights, level)
5. **ProjectManager** — менеджеры проектов (id, accessLevel, projects)

### Роли пользователей (UserRole)

- `USER` — обычный пользователь
- `ADMIN` — администратор с полными правами
- `PROJECT_MANAGER` — менеджер проектов

---

## Установка и запуск

### Требования

- Node.js >= 18
- npm >= 9

### Установка зависимостей

```bash
npm install
```

### Команды

```bash
# Сборка проекта
npm run build

# Запуск в режиме разработки (watch mode)
npm run start:dev

# Запуск в режиме отладки
npm run start:debug

# Запуск в продакшен режиме
npm run start:prod

# Запуск тестов
npm run test

# E2E тесты
npm run test:e2e

# Покрытие тестами
npm run test:cov

# Линтинг
npm run lint

# Форматирование
npm run format
```

### Переменные окружения

Создайте файл `.env` в корне проекта:

```env
PORT=3000
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h
DB_PATH=teams-up.sqlite
```

---

## API Endpoints

### Аутентификация (`/api/auth`)

| Метод | Эндпоинт         | Описание                     |
| ----- | ---------------- | ---------------------------- |
| POST  | `/auth/register` | Регистрация пользователя     |
| POST  | `/auth/login`    | Логин (возвращает JWT токен) |

### Пользователи (`/api/users`)

| Метод | Эндпоинт           | Описание              | Роль       |
| ----- | ------------------ | --------------------- | ---------- |
| GET   | `/users/:id`       | Получить профиль      | User/Admin |
| PUT   | `/users/:id`       | Редактировать профиль | User/Admin |
| GET   | `/users/:id/teams` | Команды пользователя  | User/Admin |

### Администратор (`/api/admin`) — только Admin

| Метод  | Эндпоинт                         | Описание                  |
| ------ | -------------------------------- | ------------------------- |
| GET    | `/admin/users`                   | Список всех пользователей |
| GET    | `/admin/users/:id`               | Профиль пользователя      |
| PUT    | `/admin/users/:id/role?role=...` | Изменить роль             |
| POST   | `/admin/admins`                  | Создать админа            |
| PUT    | `/admin/admins/:id`              | Обновить админа           |
| DELETE | `/admin/admins/:id`              | Удалить админа            |
| GET    | `/admin/settings`                | Настройки системы         |
| PUT    | `/admin/settings`                | Обновить настройки        |
| POST   | `/admin/teams/auto`              | Автоформирование команд   |

### Команды (`/api/teams`)

| Метод  | Эндпоинт                 | Описание           | Роль     |
| ------ | ------------------------ | ------------------ | -------- |
| POST   | `/teams`                 | Создать команду    | PM/Admin |
| GET    | `/teams`                 | Список команд      | Все      |
| GET    | `/teams/:id`             | Профиль команды    | Все      |
| PUT    | `/teams/:id`             | Обновить команду   | PM/Admin |
| DELETE | `/teams/:id`             | Удалить команду    | Admin    |
| GET    | `/teams/:id/members`     | Участники команды  | Все      |
| GET    | `/teams/:id/assignments` | Назначения команды | Все      |

### Назначения (`/api/assignments`)

| Метод  | Эндпоинт                     | Описание                | Роль          |
| ------ | ---------------------------- | ----------------------- | ------------- |
| POST   | `/assignments`               | Назначить пользователя  | PM/Admin      |
| PUT    | `/assignments/:id`           | Изменить роль           | PM/Admin      |
| DELETE | `/assignments/:id`           | Отозвать назначение     | PM/Admin      |
| GET    | `/assignments/:id`           | Получить назначение     | Все           |
| GET    | `/assignments/teams/:teamId` | Назначения команды      | Все           |
| GET    | `/assignments/users/:userId` | Назначения пользователя | User/PM/Admin |

### Менеджер проектов (`/api/manager`) — только PM

| Метод | Эндпоинт                         | Описание         |
| ----- | -------------------------------- | ---------------- |
| POST  | `/manager/teams`                 | Создать команду  |
| GET   | `/manager/teams`                 | Мои команды      |
| GET   | `/manager/members?role=&teamId=` | Поиск участников |
| POST  | `/manager/skills/assess`         | Оценить навыки   |
| GET   | `/manager/skills/:userId`        | Получить навыки  |
| POST  | `/manager/assignments`           | Назначить роль   |

---

## Примеры запросов

### Регистрация

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

### Логин

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

Ответ:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Авторизованный запрос

```bash
curl -X GET http://localhost:3000/users/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Разработка

### Добавление нового модуля

Используйте Nest CLI:

```bash
nest g module modules/new-module
nest g controller modules/new-module
nest g service modules/new-module
```

### Создание сущности TypeORM

1. Создайте файл в `src/entities/`
2. Добавьте декораторы `@Entity`, `@Column`, etc.
3. Добавьте сущность в `AppModule` импорты TypeORM

### DTO и валидация

Все DTO используют `class-validator` декораторы:

```typescript
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;
}
```

### Guards и декораторы ролей

```typescript
@Get('protected')
@Roles(UserRole.ADMIN)
@UseGuards(AuthGuard('jwt'), RolesGuard)
async adminOnly(@CurrentUser() user: any) {
  // Только для админов
}
```

---

## Тестирование

### Unit тесты

Находятся в файлах `*.spec.ts` рядом с тестируемыми файлами.

```bash
npm run test
```

### E2E тесты

Находятся в папке `test/`.

```bash
npm run test:e2e
```

### API тесты (curl скрипты)

Для быстрого тестирования API используйте предоставленные скрипты:

**Linux/macOS (bash):**

```bash
chmod +x test-api.sh
./test-api.sh
```

**Windows (cmd):**

```cmd
test-api.bat
```

Скрипты выполняют:

1. Регистрацию 5 пользователей
2. Получение JWT токенов
3. Назначение ролей (PM, Admin)
4. Создание команд
5. Назначение участников в команды
6. Проверку всех эндпоинтов

---

## Развёртывание

### Продакшен сборка

```bash
npm run build
npm run start:prod
```

### Docker (опционально)

Создайте `Dockerfile`:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
CMD ["node", "dist/main"]
```

---

## Лицензия

UNLICENSED — частный проект.
