# Sobesilka Frontend

Современное React приложение с использованием Rsbuild, TailwindCSS и Feature-Sliced Design архитектуры. Проект включает автогенерацию API клиента с помощью Orval и интегрированную систему управления состоянием через TanStack Query.

## Технологии

| Технология     | Версия  |
| -------------- | ------- |
| React          | ^19.1.0 |
| TypeScript     | ^5.8.3  |
| Rsbuild        | ^1.4.0  |
| TailwindCSS    | ^4.1.11 |
| TanStack Query | ^5.81.5 |
| Axios          | ^1.10.0 |
| Orval          | ^7.10.0 |
| ESLint         | ^9.29.0 |
| Prettier       | ^3.5.3  |

## Команды

### Разработка

```bash
npm run dev          # Запуск dev сервера
```

### Генерация API

```bash
npm run api:generate      # Генерация API (требует запущенный backend)
npm run api:generate:full # Автозапуск backend + генерация API
```

### Линтинг и форматирование

```bash
npm run lint        # ESLint
npm run format      # Prettier
```

### Сборка

```bash
npm run build       # Production сборка
npm run preview     # Превью production сборки
```

## Структура проекта (FSD)

```
src/
├── app/           # Инициализация приложения
│   ├── providers/ # React провайдеры
│   └── config/    # Конфигурация приложения
├── pages/         # Страницы приложения
├── widgets/       # Комплексные UI блоки
├── features/      # Бизнес-функции
├── entities/      # Бизнес-сущности
└── shared/        # Переиспользуемые ресурсы
    ├── api/       # API клиент и конфигурация
    ├── ui/        # UI компоненты
    ├── lib/       # Утилиты
    └── config/    # Общие конфигурации
```

## API Generation

Orval автоматически генерирует TypeScript клиент на основе OpenAPI схемы от FastAPI backend.

Сгенерированный код включает:

- Типы данных (interfaces, types)
- React Query хуки (useQuery, useMutation)
- Axios клиент с кастомными настройками

Файлы генерируются в `src/shared/api/generated/`
