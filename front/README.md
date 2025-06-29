# Sobesilka Frontend

Современный фронтенд на базе Rsbuild, React, TypeScript с автогенерацией API клиента.

## Технологии
- **Rsbuild** - быстрый сборщик на базе Rspack
- **React 19** + **TypeScript** - основной стек
- **TailwindCSS** - стилизация
- **TanStack Query** - управление состоянием сервера
- **Orval** - автогенерация API клиента
- **Axios** - HTTP клиент
- **FSD Architecture** - архитектура проекта

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
