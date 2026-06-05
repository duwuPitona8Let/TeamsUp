@echo off
REM Teams-Up API Test Script для Windows
REM Запуск: test-api.bat

set BASE_URL=http://localhost:3000

echo ========================================
echo     Teams-Up API Test Suite
echo ========================================
echo.

REM ============================================
REM 1. РЕГИСТРАЦИЯ ПОЛЬЗОВАТЕЛЕЙ
REM ============================================
echo === 1. РЕГИСТРАЦИЯ ПОЛЬЗОВАТЕЛЕЙ ===
echo.

echo [Регистрация Alice]
curl -X POST "%BASE_URL%/auth/register" -H "Content-Type: application/json" -d "{\"name\":\"Alice User\",\"email\":\"alice@example.com\",\"password\":\"password123\"}"
echo.
echo.

echo [Регистрация Bob]
curl -X POST "%BASE_URL%/auth/register" -H "Content-Type: application/json" -d "{\"name\":\"Bob Developer\",\"email\":\"bob@example.com\",\"password\":\"password123\"}"
echo.
echo.

echo [Регистрация Charlie]
curl -X POST "%BASE_URL%/auth/register" -H "Content-Type: application/json" -d "{\"name\":\"Charlie Tester\",\"email\":\"charlie@example.com\",\"password\":\"password123\"}"
echo.
echo.

echo [Регистрация Diana]
curl -X POST "%BASE_URL%/auth/register" -H "Content-Type: application/json" -d "{\"name\":\"Diana Manager\",\"email\":\"diana@example.com\",\"password\":\"password123\"}"
echo.
echo.

echo [Регистрация Eve]
curl -X POST "%BASE_URL%/auth/register" -H "Content-Type: application/json" -d "{\"name\":\"Eve Admin\",\"email\":\"eve@example.com\",\"password\":\"password123\"}"
echo.
echo.

timeout /t 2 /nobreak >nul

REM ============================================
REM 2. ПОЛУЧЕНИЕ ТОКЕНОВ
REM ============================================
echo === 2. ПОЛУЧЕНИЕ ТОКЕНОВ ===
echo.

echo [Логин Alice]
curl -X POST "%BASE_URL%/auth/login" -H "Content-Type: application/json" -d "{\"email\":\"alice@example.com\",\"password\":\"password123\"}" > "%TEMP%\alice.json"
echo.

echo [Логин Bob]
curl -X POST "%BASE_URL%/auth/login" -H "Content-Type: application/json" -d "{\"email\":\"bob@example.com\",\"password\":\"password123\"}" > "%TEMP%\bob.json"
echo.

echo [Логин Diana]
curl -X POST "%BASE_URL%/auth/login" -H "Content-Type: application/json" -d "{\"email\":\"diana@example.com\",\"password\":\"password123\"}" > "%TEMP%\diana.json"
echo.

echo [Логин Eve]
curl -X POST "%BASE_URL%/auth/login" -H "Content-Type: application/json" -d "{\"email\":\"eve@example.com\",\"password\":\"password123\"}" > "%TEMP%\eve.json"
echo.

REM ============================================
REM 3. СОЗДАНИЕ КОМАНД
REM ============================================
echo.
echo === 3. СОЗДАНИЕ КОМАНД (Project Manager) ===
echo.

REM Получаем токен Diana из JSON файла
for /f "tokens=*" %%a in ('node -e "console.log(require('fs').readFileSync('%TEMP%\diana.json','utf8'))"') do set DIANA_JSON=%%a
for /f "tokens=*" %%a in ('node -e "console.log(JSON.parse(process.argv[1]).access_token)" "%DIANA_JSON%"') do set DIANA_TOKEN=%%a

echo [Создание Alpha Team]
curl -X POST "%BASE_URL%/teams" -H "Content-Type: application/json" -H "Authorization: Bearer %DIANA_TOKEN%" -d "{\"name\":\"Alpha Team\",\"description\":\"Команда разработки\"}"
echo.
echo.

echo [Создание Beta Team]
curl -X POST "%BASE_URL%/teams" -H "Content-Type: application/json" -H "Authorization: Bearer %DIANA_TOKEN%" -d "{\"name\":\"Beta Team\",\"description\":\"Команда тестирования\"}"
echo.
echo.

REM ============================================
REM 4. НАЗНАЧЕНИЕ УЧАСТНИКОВ
REM ============================================
echo.
echo === 4. НАЗНАЧЕНИЕ УЧАСТНИКОВ В КОМАНДЫ ===
echo.

echo [Alice в Alpha Team как developer]
curl -X POST "%BASE_URL%/assignments" -H "Content-Type: application/json" -H "Authorization: Bearer %DIANA_TOKEN%" -d "{\"userId\":2,\"teamId\":1,\"role\":\"developer\"}"
echo.
echo.

echo [Bob в Alpha Team как senior_developer]
curl -X POST "%BASE_URL%/assignments" -H "Content-Type: application/json" -H "Authorization: Bearer %DIANA_TOKEN%" -d "{\"userId\":3,\"teamId\":1,\"role\":\"senior_developer\"}"
echo.
echo.

echo [Charlie в Alpha Team как tester]
curl -X POST "%BASE_URL%/assignments" -H "Content-Type: application/json" -H "Authorization: Bearer %DIANA_TOKEN%" -d "{\"userId\":4,\"teamId\":1,\"role\":\"tester\"}"
echo.
echo.

REM ============================================
REM 5. ПРОВЕРКА РЕЗУЛЬТАТОВ
REM ============================================
echo.
echo === 5. ПРОВЕРКА РЕЗУЛЬТАТОВ ===
echo.

echo [Список всех команд]
curl -X GET "%BASE_URL%/teams" -H "Authorization: Bearer %DIANA_TOKEN%"
echo.
echo.

echo [Участники Alpha Team]
curl -X GET "%BASE_URL%/teams/1/members" -H "Authorization: Bearer %DIANA_TOKEN%"
echo.
echo.

echo [Команды Alice]
for /f "tokens=*" %%a in ('node -e "console.log(JSON.parse(require('fs').readFileSync('%TEMP%\alice.json','utf8')).access_token)"') do set ALICE_TOKEN=%%a
curl -X GET "%BASE_URL%/users/2/teams" -H "Authorization: Bearer %ALICE_TOKEN%"
echo.
echo.

REM ============================================
REM ФИНАЛ
REM ============================================
echo.
echo ========================================
echo     Тесты завершены!
echo ========================================
echo.

pause
