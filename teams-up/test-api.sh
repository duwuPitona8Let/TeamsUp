#!/bin/bash

# Teams-Up API Test Script
# Запуск: bash test-api.sh или ./test-api.sh

BASE_URL="http://localhost:3000"

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}    Teams-Up API Test Suite${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Функция для красивого вывода заголовков
print_header() {
    echo -e "${YELLOW}>>> $1${NC}"
    echo ""
}

# Функция для выполнения запроса и проверки результата
test_request() {
    local method=$1
    local endpoint=$2
    local headers=$3
    local body=$4
    local description=$5
    
    echo -e "${BLUE}[$description]${NC}"
    
    if [ -z "$body" ]; then
        response=$(curl -s -X "$method" "$BASE_URL$endpoint" $headers)
    else
        response=$(curl -s -X "$method" "$BASE_URL$endpoint" $headers -d "$body")
    fi
    
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    echo ""
}

# ============================================
# 1. РЕГИСТРАЦИЯ ПОЛЬЗОВАТЕЛЕЙ
# ============================================
print_header "1. РЕГИСТРАЦИЯ ПОЛЬЗОВАТЕЛЕЙ"

echo -e "${GREEN}✓ Регистрация Alice (обычный пользователь)${NC}"
curl -s -X POST "$BASE_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d '{"name":"Alice User","email":"alice@example.com","password":"password123"}' | jq '.'

echo -e "${GREEN}✓ Регистрация Bob (будет Project Manager)${NC}"
curl -s -X POST "$BASE_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d '{"name":"Bob Developer","email":"bob@example.com","password":"password123"}' | jq '.'

echo -e "${GREEN}✓ Регистрация Charlie (разработчик)${NC}"
curl -s -X POST "$BASE_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d '{"name":"Charlie Tester","email":"charlie@example.com","password":"password123"}' | jq '.'

echo -e "${GREEN}✓ Регистрация Diana (будет Project Manager)${NC}"
curl -s -X POST "$BASE_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d '{"name":"Diana Manager","email":"diana@example.com","password":"password123"}' | jq '.'

echo -e "${GREEN}✓ Регистрация Eve (будет Admin)${NC}"
curl -s -X POST "$BASE_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d '{"name":"Eve Admin","email":"eve@example.com","password":"password123"}' | jq '.'

sleep 1

# ============================================
# 2. ПОЛУЧЕНИЕ ТОКЕНОВ
# ============================================
print_header "2. ПОЛУЧЕНИЕ ТОКЕНОВ"

# Получаем токены для всех пользователей
ALICE_TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"alice@example.com","password":"password123"}' | jq -r '.access_token')

BOB_TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"bob@example.com","password":"password123"}' | jq -r '.access_token')

CHARLIE_TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"charlie@example.com","password":"password123"}' | jq -r '.access_token')

DIANA_TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"diana@example.com","password":"password123"}' | jq -r '.access_token')

EVE_TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"eve@example.com","password":"password123"}' | jq -r '.access_token')

echo -e "${GREEN}Alice Token:${NC} ${ALICE_TOKEN:0:50}..."
echo -e "${GREEN}Bob Token:${NC} ${BOB_TOKEN:0:50}..."
echo -e "${GREEN}Diana Token:${NC} ${DIANA_TOKEN:0:50}..."
echo -e "${GREEN}Eve Token:${NC} ${EVE_TOKEN:0:50}..."
echo ""

# ============================================
# 3. НАЗНАЧЕНИЕ РОЛЕЙ (Admin)
# ============================================
print_header "3. НАЗНАЧЕНИЕ РОЛЕЙ (требуется Admin)"

# Примечание: для первого админа нужно вручную обновить БД или использовать synchronize
# Обновляем роли через прямое назначение (требуется предварительно настроить БД)

echo -e "${YELLOW}Назначение Diana роли Project Manager...${NC}"
curl -s -X PUT "$BASE_URL/admin/users/5/role?role=project_manager" \
    -H "Authorization: Bearer $EVE_TOKEN" | jq '.'
echo ""

echo -e "${YELLOW}Назначение Bob роли Project Manager...${NC}"
curl -s -X PUT "$BASE_URL/admin/users/3/role?role=project_manager" \
    -H "Authorization: Bearer $EVE_TOKEN" | jq '.'
echo ""

# Получаем новые токены с обновлёнными ролями
BOB_TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"bob@example.com","password":"password123"}' | jq -r '.access_token')

DIANA_TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"diana@example.com","password":"password123"}' | jq -r '.access_token')

echo -e "${GREEN}Обновлённый Bob Token (PM):${NC} ${BOB_TOKEN:0:50}..."
echo -e "${GREEN}Обновлённый Diana Token (PM):${NC} ${DIANA_TOKEN:0:50}..."
echo ""

# ============================================
# 4. СОЗДАНИЕ КОМАНД (Project Manager)
# ============================================
print_header "4. СОЗДАНИЕ КОМАНД (требуется PM или Admin)"

echo -e "${GREEN}✓ Создание команды Alpha Team${NC}"
ALPHA_RESPONSE=$(curl -s -X POST "$BASE_URL/teams" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $DIANA_TOKEN" \
    -d '{"name":"Alpha Team","description":"Команда разработки проекта Alpha","status":"active"}')
echo "$ALPHA_RESPONSE" | jq '.'
ALPHA_TEAM_ID=$(echo "$ALPHA_RESPONSE" | jq -r '.id')
echo -e "${BLUE}Alpha Team ID: $ALPHA_TEAM_ID${NC}"
echo ""

echo -e "${GREEN}✓ Создание команды Beta Team${NC}"
BETA_RESPONSE=$(curl -s -X POST "$BASE_URL/teams" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $DIANA_TOKEN" \
    -d '{"name":"Beta Team","description":"Команда тестирования","status":"active"}')
echo "$BETA_RESPONSE" | jq '.'
BETA_TEAM_ID=$(echo "$BETA_RESPONSE" | jq -r '.id')
echo -e "${BLUE}Beta Team ID: $BETA_TEAM_ID${NC}"
echo ""

# ============================================
# 5. НАЗНАЧЕНИЕ УЧАСТНИКОВ В КОМАНДЫ
# ============================================
print_header "5. НАЗНАЧЕНИЕ УЧАСТНИКОВ В КОМАНДЫ"

echo -e "${GREEN}✓ Назначение Alice в Alpha Team как developer${NC}"
curl -s -X POST "$BASE_URL/assignments" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $DIANA_TOKEN" \
    -d "{\"userId\":2,\"teamId\":$ALPHA_TEAM_ID,\"role\":\"developer\"}" | jq '.'
echo ""

echo -e "${GREEN}✓ Назначение Bob в Alpha Team как senior_developer${NC}"
curl -s -X POST "$BASE_URL/assignments" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $DIANA_TOKEN" \
    -d "{\"userId\":3,\"teamId\":$ALPHA_TEAM_ID,\"role\":\"senior_developer\"}" | jq '.'
echo ""

echo -e "${GREEN}✓ Назначение Charlie в Alpha Team как tester${NC}"
curl -s -X POST "$BASE_URL/assignments" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $DIANA_TOKEN" \
    -d "{\"userId\":4,\"teamId\":$ALPHA_TEAM_ID,\"role\":\"tester\"}" | jq '.'
echo ""

echo -e "${GREEN}✓ Назначение Diana в Alpha Team как manager${NC}"
curl -s -X POST "$BASE_URL/assignments" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $DIANA_TOKEN" \
    -d "{\"userId\":5,\"teamId\":$ALPHA_TEAM_ID,\"role\":\"manager\"}" | jq '.'
echo ""

echo -e "${GREEN}✓ Назначение Alice в Beta Team как lead_developer${NC}"
curl -s -X POST "$BASE_URL/assignments" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $DIANA_TOKEN" \
    -d "{\"userId\":2,\"teamId\":$BETA_TEAM_ID,\"role\":\"lead_developer\"}" | jq '.'
echo ""

echo -e "${GREEN}✓ Назначение Charlie в Beta Team как qa_lead${NC}"
curl -s -X POST "$BASE_URL/assignments" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $DIANA_TOKEN" \
    -d "{\"userId\":4,\"teamId\":$BETA_TEAM_ID,\"role\":\"qa_lead\"}" | jq '.'
echo ""

# ============================================
# 6. ПРОВЕРКА РЕЗУЛЬТАТОВ
# ============================================
print_header "6. ПРОВЕРКА РЕЗУЛЬТАТОВ"

echo -e "${GREEN}✓ Список всех команд${NC}"
curl -s -X GET "$BASE_URL/teams" \
    -H "Authorization: Bearer $DIANA_TOKEN" | jq '.'
echo ""

echo -e "${GREEN}✓ Alpha Team详细信息${NC}"
curl -s -X GET "$BASE_URL/teams/$ALPHA_TEAM_ID" \
    -H "Authorization: Bearer $DIANA_TOKEN" | jq '.'
echo ""

echo -e "${GREEN}✓ Участники Alpha Team${NC}"
curl -s -X GET "$BASE_URL/teams/$ALPHA_TEAM_ID/members" \
    -H "Authorization: Bearer $DIANA_TOKEN" | jq '.'
echo ""

echo -e "${GREEN}✓ Назначения Alpha Team${NC}"
curl -s -X GET "$BASE_URL/teams/$ALPHA_TEAM_ID/assignments" \
    -H "Authorization: Bearer $DIANA_TOKEN" | jq '.'
echo ""

echo -e "${GREEN}✓ Команды пользователя Alice${NC}"
curl -s -X GET "$BASE_URL/users/2/teams" \
    -H "Authorization: Bearer $ALICE_TOKEN" | jq '.'
echo ""

echo -e "${GREEN}✓ Назначения пользователя Bob${NC}"
curl -s -X GET "$BASE_URL/assignments/users/3" \
    -H "Authorization: Bearer $BOB_TOKEN" | jq '.'
echo ""

# ============================================
# 7. PROJECT MANAGER ОПЕРАЦИИ
# ============================================
print_header "7. PROJECT MANAGER ОПЕРАЦИИ"

echo -e "${GREEN}✓ Оценка навыков Alice${NC}"
curl -s -X POST "$BASE_URL/manager/skills/assess" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $DIANA_TOKEN" \
    -d "{\"userId\":2,\"skills\":{\"javascript\":90,\"typescript\":85,\"nestjs\":80}}" | jq '.'
echo ""

echo -e "${GREEN}✓ Получить навыки Alice${NC}"
curl -s -X GET "$BASE_URL/manager/skills/2" \
    -H "Authorization: Bearer $DIANA_TOKEN" | jq '.'
echo ""

echo -e "${GREEN}✓ Поиск участников по роли developer${NC}"
curl -s -X GET "$BASE_URL/manager/members?role=developer" \
    -H "Authorization: Bearer $DIANA_TOKEN" | jq '.'
echo ""

echo -e "${GREEN}✓ Назначить роль tech_lead через PM эндпоинт${NC}"
curl -s -X POST "$BASE_URL/manager/assignments" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $DIANA_TOKEN" \
    -d "{\"userId\":3,\"teamId\":$ALPHA_TEAM_ID,\"role\":\"tech_lead\"}" | jq '.'
echo ""

echo -e "${GREEN}✓ Мои команды (PM)${NC}"
curl -s -X GET "$BASE_URL/manager/teams" \
    -H "Authorization: Bearer $DIANA_TOKEN" | jq '.'
echo ""

# ============================================
# 8. ADMIN ОПЕРАЦИИ
# ============================================
print_header "8. ADMIN ОПЕРАЦИИ"

echo -e "${GREEN}✓ Список всех пользователей${NC}"
curl -s -X GET "$BASE_URL/admin/users" \
    -H "Authorization: Bearer $EVE_TOKEN" | jq '.'
echo ""

echo -e "${GREEN}✓ Настройки системы${NC}"
curl -s -X GET "$BASE_URL/admin/settings" \
    -H "Authorization: Bearer $EVE_TOKEN" | jq '.'
echo ""

echo -e "${GREEN}✓ Изменить настройки системы${NC}"
curl -s -X PUT "$BASE_URL/admin/settings" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $EVE_TOKEN" \
    -d '{"maxTeamsPerUser":10,"autoAssignmentEnabled":true,"minTeamSize":2,"maxTeamSize":8}' | jq '.'
echo ""

# ============================================
# 9. ИЗМЕНЕНИЕ И ОТЗЫВ НАЗНАЧЕНИЙ
# ============================================
print_header "9. ИЗМЕНЕНИЕ И ОТЗЫВ НАЗНАЧЕНИЙ"

# Получаем ID первого назначения
ASSIGNMENT_ID=$(curl -s -X GET "$BASE_URL/teams/$ALPHA_TEAM_ID/assignments" \
    -H "Authorization: Bearer $DIANA_TOKEN" | jq -r '.[0].id')

echo -e "${GREEN}✓ Изменить роль в назначении (ID: $ASSIGNMENT_ID)${NC}"
curl -s -X PUT "$BASE_URL/assignments/$ASSIGNMENT_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $DIANA_TOKEN" \
    -d '{"role":"senior_developer"}' | jq '.'
echo ""

# ============================================
# 10. РЕДАКТИРОВАНИЕ КОМАНДЫ
# ============================================
print_header "10. РЕДАКТИРОВАНИЕ КОМАНДЫ"

echo -e "${GREEN}✓ Обновить команду Alpha Team${NC}"
curl -s -X PUT "$BASE_URL/teams/$ALPHA_TEAM_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $DIANA_TOKEN" \
    -d '{"description":"Обновлённое описание команды Alpha","status":"active"}' | jq '.'
echo ""

# ============================================
# ФИНАЛ
# ============================================
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓ Все тесты выполнены!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}Полезные команды для очистки:${NC}"
echo "  # Удалить базу данных и начать заново:"
echo "  rm teams-up.sqlite"
echo ""
echo "  # Перезапустить сервер:"
echo "  npm run start:dev"
