# Хэндофф: course-platform

Бриф для агента/разработчика, продолжающего работу. Секретов здесь нет —
они только в `.env.prod` (локально + на сервере), в git их НЕТ.

## Что и где
- **Платформа курсов**, домен **courses.ew-production.ru**.
- Git: `git@github-mad:madproject-ew/course-platform.git` (ветка `main`; пуш по SSH
  через хост-алиас `github-mad` → `~/.ssh/id_ed25519_mad`; HTTPS не работает).
- Стек: Next.js (App Router, standalone) + Prisma + Postgres + Prodamus (оплата).
- **Деплой: push в `main` → авто-деплой на прод** через GitHub Actions
  (`.github/workflows/deploy.yml` гоняет `./deploy.sh` на сервере; секреты CI: `SSH_PRIVATE_KEY`, `ENV_PROD`).
  Локально `deploy.sh` тоже можно запускать вручную.

## Архитектура курса = ДВЕ части
1. **Контент** — файлы на диске, **вшиты в образ** (`COPY content` в Dockerfile):
   ```
   content/courses/<slug>/
     _meta.json                  # title, description, slug, highlights, modules[]
     NN-slug-modulya/            # папка модуля; ПРЕФИКС NN определяет пейволл!
       _meta.json                # title, description, number
       NN-slug-uroka.mdx         # frontmatter: title, type: article|demo|task, опц. quiz[]
   ```
   Загрузчик: `src/lib/courses-loader.ts`. Модули/уроки сортируются по имени файла.
   Картинки — `<module>/images/*.png`, ссылка из урока `![alt](./images/x.png)`.
2. **Строка в БД `Course`** (модель: `slug @unique, title, description, price Int(=2499),
   freeModules Int(=1), isPublished Bool(=true), imageUrl?`). Отсюда **цена и кнопка покупки**.
   Связи: `CourseAccess` (кто купил), `Transaction` (платежи Prodamus).
   ⚠️ **slug в БД должен ТОЧНО совпадать с папкой контента**, иначе цена/уроки не свяжутся.

**Пейволл:** `isFreeModule = getModuleNumber(slug) <= course.freeModules`. Поэтому папки
модулей обязательно `01-…`, `02-…`. Покупка → `payments/create` читает `course.price`.

**Витрина (`src/app/page.tsx`):** показывает (а) хардкод `AUTHORED_COURSES` из
`src/lib/data.ts` (сейчас 1 — «Промпт-инженеринг» на Stepik, цена в коде) + (б) текстовые
курсы из контента, цену берёт из БД по slug. Это две РАЗНЫЕ витрины — не путать.

## Как добавить курс (в админке СОЗДАНИЯ нет, только редактирование!)
1. Разложить контент в `content/courses/<slug>/…` (модули + `.mdx`).
2. Завести строку в БД — через `prisma/seed.ts` (upsert) **и/или** прямой upsert на проде:
   ```
   docker exec -i course-platform-app node   # скормить JS с PrismaClient.course.upsert(...)
   ```
   Кириллицу слать через `base64 | ssh … 'base64 -d | docker exec -i course-platform-app node'`,
   чтобы не билась в шелле.
3. **Деплой** (`deploy.sh`) — он НЕ запускает seed, только rsync+build+up. DB-строку добавляешь отдельно (п.2).

## Публикация
`isPublished=false` реально работает (enforcement добавлен): витрина прячет (`hiddenSlugs` в
`page.tsx`), `/course/<slug>` → `notFound`, `payments/create` → 403. Купившие сохраняют доступ.
Переключать — в админке `/admin/courses` кнопкой «Снять с публикации / Опубликовать», либо в БД.

## Доступы
- **Админка:** `courses.ew-production.ru/admin/courses`. Логин `supoalex1117@gmail.com` через
  **email/пароль** (роль `admin` в JWT; Google-вход может дать роль user).
- **Прод-БД/контейнеры:** SSH `root@194.34.239.226 -p 18 -i ~/.ssh/srv_194_34`; контейнеры
  `course-platform-app`, `course-platform-postgres`.
- **Метрика:** Яндекс.Метрика `109570272` (webvisor:true).
- **Секреты** (`.env.prod`: AUTH_SECRET, DATABASE_URL, Prodamus, Google OAuth, Yandex) —
  только локально + на сервере, в git НЕТ.

## Текущее состояние курсов
- **`neurovideo`** («Нейровидео с нуля») — опубликован, **299₽**, 6 уроков, 1-й бесплатно.
  Свой курс (исходник в `i_am/курс/archive.md`); переработан: пошаговые инструкции, контекст
  Казахстана (₸/Kaspi/OLX). ⚠️ В тексте пока остались плейсхолдеры скриншотов/видео
  (`[СКРИНШОТ: …]`, `[ВИДЕО-ПРИМЕР: …]`) — заменить на реальные.
- **`vue`** (Vue 3) — **СНЯТ с публикации**. Контент с HTML Academy; учебные проекты
  **TaskBoard/OnlinePizza** — исходного курса, ждут замены.

## Открытые задачи
1. **Адаптировать vue:** придумать **свои похожие проекты** (доска-задач + интернет-магазин) и
   **переименовать TaskBoard/OnlinePizza** по ~58 урокам (вшиты во все 7 модулей). Ссылки на
   vuejs.org/MDN/доки — ОСТАВЛЯТЬ. Картинки не битые; пользователь чистит `i_am/курс/vue-images/`
   вручную. После — republish.
2. **Google OAuth redirect URI** `https://courses.ew-production.ru/api/auth/google/callback`
   добавить в Google Console.
3. После правок — `git push` (бэкап) + `deploy.sh` (прод, только с явного разрешения пользователя).

## Правила
- **Любое действие на проде** (SSH, `deploy.sh`, запись в прод-БД) — **только с явного
  разрешения пользователя**.
- Память проекта: `…/-personal-ew-production-i-am/memory/` → `project_course_adaptation.md`
  (детали по vue). Прочитать перед стартом.
