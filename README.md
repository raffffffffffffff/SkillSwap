# SkillSwap

SkillSwap — Angular 21 приложение для поиска партнёров по взаимному обучению. Пользователь указывает, чему может обучать и что хочет изучить, ищет совместимых людей, отправляет swap request, планирует сессии, оставляет отзывы и работает с группами по интересам.

## Стек

- Angular 21, standalone components, lazy routes
- Taiga UI 5
- Signal Store на `@ngrx/signals`
- Mock API/data layer на `localStorage`
- Jest unit tests
- Playwright e2e tests
- ESLint, Stylelint, Prettier

## Демо-аккаунт

- Email: `alina@example.com`
- Password: `password`

## Запуск

```bash
npm install
npm start
```

Приложение откроется на `http://localhost:4200`.

## Проверки

```bash
npm run build
npm test
npm run e2e
npm run lint
npm run stylelint
```

Если Playwright запускается впервые:

```bash
npx playwright install chromium
```

## Архитектура

```text
src/app
  core/
    auth/
    guards/
    interceptors/
    models/
    services/
    stores/
  shared/
    layout/
    pipes/
    ui/
  features/
    dashboard/
    profile/
    discover/
    requests/
    matches/
    sessions/
    reviews/
    groups/
```

## Реализовано

- login / register / logout с токеном в `localStorage`
- protected routes через `authGuard`
- token/error/mock interceptors
- профиль и CRUD навыков teach/learn
- discover: поиск, фильтры, сортировка, compatibility score
- swap requests: incoming/outgoing, accept/decline
- matches по принятым обменам
- sessions: создание, planned/completed/cancelled, notes
- reviews с пересчётом рейтинга
- dashboard metrics и топ-3 рекомендаций
- groups и материалы

Публичный URL для деплоя: `TODO: добавить после публикации на Vercel/GitLab Pages/Firebase`.
