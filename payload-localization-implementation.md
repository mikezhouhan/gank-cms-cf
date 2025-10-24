# Payload CMS 本地化实现详解

## 概述

Payload CMS 的本地化功能是一个复杂而强大的系统，支持在字段级别进行多语言内容管理。本文档详细解释了本地化功能的实现原理，包括配置方式、数据存储结构以及在不同数据库适配器中的具体实现。

## 核心概念

### 字段级本地化

Payload 的本地化在**字段级别**而非文档级别工作，这意味着：

- 不能在 collection 级别设置 `localized: true`
- 只能在字段级别设置 `localized: true`
- 可以选择性地对某些字段进行本地化
- 复杂字段类型（array、blocks、group）也支持本地化

### 配置方式

#### 全局配置

```typescript
// payload.config.ts
export default buildConfig({
  localization: {
    locales: ['en', 'es', 'de'], // 支持的语言代码
    defaultLocale: 'en',         // 默认语言
    fallback: true,              // 启用回退机制
  },
  collections: [
    // 你的 collections
  ]
})
```

#### 完整配置对象

```typescript
localization: {
  locales: [
    { code: 'en', label: 'English' },
    { code: 'ar', label: 'Arabic', rtl: true }, // 支持 RTL
    { code: 'es', label: 'Spanish', fallbackLocale: 'en' }, // 字段级回退
  ],
  defaultLocale: 'en',
  fallback: true,
  filterAvailableLocales: async ({ req, locales }) => {
    // 动态过滤可用语言
    return locales.filter(locale => userCanAccess(locale))
  }
}
```

#### 字段级配置

```typescript
// Collection 字段配置
{
  name: 'title',
  type: 'text',
  localized: true  // ✅ 在字段级别设置
}

// 复杂字段的本地化
{
  name: 'content',
  type: 'array',
  localized: true,  // 整个数组本地化
  fields: [
    { name: 'text', type: 'text' },
    { name: 'number', type: 'number' }
  ]
}

// 嵌套字段的本地化
{
  name: 'items',
  type: 'array',
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true  // 只有数组内的特定字段本地化
    }
  ]
}
```

## 数据转换流程

### 1. 用户输入阶段（String）

用户通过 API 或 Admin Panel 提交数据时，输入的是普通字符串：

```typescript
// API 请求数据
{
  "title": "Hello World"  // ← 这是 string
}
```

### 2. Payload 内部处理（beforeChange Hook）

在 `beforeChange` hook 中，Payload 将单个 locale 的数据转换为包含所有 locale 的对象结构：

```typescript
// mergeLocaleActions 处理逻辑
if (localization && fieldShouldBeLocalized({ field, parentIsLocalized })) {
  mergeLocaleActions.push(() => {
    const localeData: Record<string, unknown> = {}

    for (const locale of localization.localeCodes) {
      const fieldValue =
        locale === req.locale
          ? siblingData[field.name!]
          : siblingDocWithLocales?.[field.name!]?.[locale]

      // 更新 locale 值（如果不是 undefined）
      if (typeof fieldValue !== 'undefined') {
        localeData[locale] = fieldValue
      }
    }

    // 如果有 locale 数据，设置数据
    if (Object.keys(localeData).length > 0) {
      siblingData[field.name!] = localeData
    }
  })
}
```

### 3. 数据库存储（Object）

最终存储到数据库的是对象结构：

```json
{
  "_id": "...",
  "title": {
    "en": "Hello World",
    "es": "Hola Mundo",
    "de": "Hallo Welt"
  },
  "description": "Non-localized field",  // 非本地化字段保持原样
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### 4. 数据读取（String）

当读取数据时，Payload 会根据请求的 locale 将对象结构扁平化回字符串：

```typescript
// 请求英文版本
const post = await payload.findByID({
  collection: 'posts',
  id: postId,
  locale: 'en'
})

// 返回结果
{
  "title": "Hello World"  // ← 从对象中提取的字符串
}
```

## 不同数据库适配器的实现

### MongoDB 实现

MongoDB 原生支持 JSON 对象，直接在文档中存储本地化数据：

```javascript
// MongoDB 文档结构
{
  "_id": ObjectId("..."),
  "title": {
    "en": "Hello World",
    "es": "Hola Mundo",
    "de": "Hallo Welt"
  },
  "description": "Non-localized field"
}
```

### PostgreSQL 实现

PostgreSQL 使用 JSONB 字段类型存储本地化数据：

```sql
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title JSONB,  -- 本地化字段存储为 JSONB
  description TEXT,  -- 非本地化字段
  created_at TIMESTAMP DEFAULT NOW()
);

-- 数据示例
INSERT INTO posts (title, description) VALUES
('{"en": "Hello World", "es": "Hola Mundo"}', 'Non-localized description');
```

### SQLite 实现

SQLite 通过独立的 `_locales` 表和 JSON 模式支持本地化：

#### 表结构

```sql
-- 主表
CREATE TABLE posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  description TEXT,  -- 非本地化字段
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 本地化表
CREATE TABLE posts_locales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  _locale TEXT NOT NULL,           -- 'en', 'es', 'de' 等
  _parent_id INTEGER NOT NULL,     -- 关联到主表的 ID
  title TEXT,                      -- 本地化的 title 字段
  localized_description TEXT,      -- 本地化的 description 字段
  FOREIGN KEY (_parent_id) REFERENCES posts(id) ON DELETE CASCADE,
  UNIQUE(_locale, _parent_id)
);
```

#### 数据存储

```sql
-- 主表数据
INSERT INTO posts (id, description, created_at, updated_at)
VALUES (1, 'Non-localized description', '2024-01-01', '2024-01-01');

-- 本地化数据
INSERT INTO posts_locales (_locale, _parent_id, title, localized_description) VALUES
('en', 1, 'Hello World', 'English description'),
('es', 1, 'Hola Mundo', 'Descripción en español'),
('de', 1, 'Hallo Welt', 'Deutsche Beschreibung');
```

#### JSON 模式支持

SQLite 适配器使用 `text` 列的 `json` 模式来存储复杂的 JSON 数据：

```typescript
// SQLite 列定义
case 'jsonb': {
  columns[key] = text(column.name, { mode: 'json' })
  break
}
```

## API 使用方式

### REST API

```bash
# 创建英文版本
POST /api/posts
{
  "title": "Hello World"
}

# 更新西班牙语版本
PUT /api/posts/123?locale=es
{
  "title": "Hola Mundo"
}

# 获取特定语言版本
GET /api/posts/123?locale=es

# 获取所有语言版本
GET /api/posts/123?locale=all

# 使用回退语言
GET /api/posts/123?locale=fr&fallback-locale=en
```

### GraphQL API

```graphql
# 查询特定语言
query {
  Posts(locale: es, fallbackLocale: en) {
    docs {
      title
    }
  }
}

# 创建多语言内容
mutation {
  createPost(locale: en, data: { title: "Hello World" }) {
    title
  }
}
```

### Local API

```typescript
// 创建文档
const post = await payload.create({
  collection: 'posts',
  data: { title: 'Hello World' },
  locale: 'en'
})

// 更新特定语言版本
await payload.update({
  id: post.id,
  collection: 'posts',
  data: { title: 'Hola Mundo' },
  locale: 'es'
})

// 查询特定语言
const spanishPost = await payload.findByID({
  collection: 'posts',
  id: post.id,
  locale: 'es',
  fallbackLocale: 'en'
})

// 获取所有语言版本
const allLocales = await payload.findByID({
  collection: 'posts',
  id: post.id,
  locale: 'all'
})
```

## 高级特性

### 回退机制

```typescript
// 全局回退配置
localization: {
  fallback: true,  // 启用全局回退
  defaultLocale: 'en'
}

// 字段级回退
{
  code: 'en-GB',
  fallbackLocale: 'en'  // 英式英语回退到美式英语
}

// 多级回退
{
  code: 'zh-HK',
  fallbackLocale: ['zh-CN', 'en']  // 港繁 → 简中 → 英文
}
```

### 动态语言过滤

```typescript
localization: {
  filterAvailableLocales: async ({ req, locales }) => {
    // 基于用户权限过滤
    if (req.user?.role === 'admin') {
      return locales
    }

    // 基于租户配置过滤
    const tenant = await getTenantFromRequest(req)
    return locales.filter(locale =>
      tenant.supportedLocales.includes(locale.code)
    )
  }
}
```

### 复杂字段的本地化

#### Array 字段本地化

```typescript
// 整个数组本地化
{
  name: 'items',
  type: 'array',
  localized: true,
  fields: [
    { name: 'text', type: 'text' },
    { name: 'number', type: 'number' }
  ]
}

// 存储结构
{
  "items": {
    "en": [
      { "id": "1", "text": "Item 1", "number": 10 },
      { "id": "2", "text": "Item 2", "number": 20 }
    ],
    "es": [
      { "id": "1", "text": "Artículo 1", "number": 10 },
      { "id": "2", "text": "Artículo 2", "number": 20 }
    ]
  }
}
```

#### Blocks 字段本地化

```typescript
{
  name: 'content',
  type: 'blocks',
  localized: true,
  blocks: [
    {
      slug: 'text-block',
      fields: [
        { name: 'content', type: 'richText' }
      ]
    }
  ]
}
```

#### Group 字段本地化

```typescript
{
  name: 'seo',
  type: 'group',
  localized: true,
  fields: [
    { name: 'title', type: 'text' },
    { name: 'description', type: 'textarea' }
  ]
}
```

## 前端集成

### React Provider

```typescript
import { LocaleProvider } from '@payloadcms/ui'

export default function App() {
  return (
    <LocaleProvider>
      <YourApp />
    </LocaleProvider>
  )
}
```

### 语言切换

```typescript
import { useLocale } from '@payloadcms/ui'

function LanguageSwitcher() {
  const { locale, setLocale, locales } = useLocale()

  return (
    <select
      value={locale.code}
      onChange={(e) => setLocale(e.target.value)}
    >
      {locales.map(loc => (
        <option key={loc.code} value={loc.code}>
          {loc.label}
        </option>
      ))}
    </select>
  )
}
```

## 性能优化

### 索引优化

```typescript
// 为本地化字段创建索引
{
  name: 'title',
  type: 'text',
  localized: true,
  index: true  // 在所有语言版本上创建索引
}
```

### 查询优化

```typescript
// 只查询需要的语言
const posts = await payload.find({
  collection: 'posts',
  locale: 'en',  // 只查询英文版本
  select: {
    title: true,
    description: false  // 排除不需要的字段
  }
})

// 批量查询多语言
const allPosts = await payload.find({
  collection: 'posts',
  locale: 'all',  // 获取所有语言版本
  limit: 10
})
```

## 最佳实践

### 1. 字段设计

```typescript
// ✅ 推荐：选择性本地化
{
  fields: [
    { name: 'title', type: 'text', localized: true },
    { name: 'content', type: 'richText', localized: true },
    { name: 'slug', type: 'text', localized: true },
    { name: 'status', type: 'select', options: ['draft', 'published'] }, // 不本地化
    { name: 'publishedAt', type: 'date' }, // 不本地化
  ]
}

// ❌ 避免：过度本地化
{
  fields: [
    { name: 'id', type: 'text', localized: true }, // 不应该本地化
    { name: 'createdAt', type: 'date', localized: true }, // 不应该本地化
  ]
}
```

### 2. 回退策略

```typescript
// ✅ 推荐：合理的回退链
{
  code: 'zh-HK',
  fallbackLocale: ['zh-CN', 'en']  // 港繁 → 简中 → 英文
}

// ❌ 避免：循环回退
{
  code: 'en',
  fallbackLocale: 'es'  // 如果 es 也回退到 en，会造成循环
}
```

### 3. 数据迁移

```typescript
// 将现有字段转换为本地化字段
const migrateToLocalized = async () => {
  const posts = await payload.find({
    collection: 'posts',
    limit: 1000
  })

  for (const post of posts.docs) {
    await payload.update({
      id: post.id,
      collection: 'posts',
      data: {
        title: {
          en: post.title,  // 将现有值设为默认语言
          es: '',          // 其他语言留空待翻译
          de: ''
        }
      }
    })
  }
}
```

## 常见问题

### Q: 为什么不能在 collection 级别设置 localized?

A: Payload 采用字段级本地化设计是为了提供更大的灵活性。不是所有字段都需要本地化（如 ID、时间戳、状态等），字段级控制可以减少数据冗余和提高性能。

### Q: SQLite 如何支持本地化？

A: SQLite 通过以下方式支持本地化：
1. 使用独立的 `_locales` 表存储本地化字段
2. 通过外键关联主表和本地化表
3. 使用 `text` 列的 `json` 模式存储复杂数据结构

### Q: 如何处理本地化字段的唯一性约束？

A: 在本地化字段上设置 `unique: true` 时，约束会应用到每个语言版本：

```typescript
{
  name: 'slug',
  type: 'text',
  localized: true,
  unique: true  // 每个语言的 slug 都必须唯一
}
```

### Q: 如何在不同语言间复制内容？

A: 使用 Admin Panel 的复制功能或通过 API：

```typescript
// 从英文复制到西班牙语
const englishPost = await payload.findByID({
  collection: 'posts',
  id: postId,
  locale: 'en'
})

await payload.update({
  id: postId,
  collection: 'posts',
  locale: 'es',
  data: {
    title: englishPost.title,  // 复制后手动翻译
    content: englishPost.content
  }
})
```

## 总结

Payload CMS 的本地化功能通过以下特点提供了强大而灵活的多语言支持：

1. **字段级控制**：精确控制哪些字段需要本地化
2. **数据库无关**：在 MongoDB、PostgreSQL、SQLite 等数据库中都能正常工作
3. **性能优化**：通过合理的数据结构和索引策略保证查询性能
4. **回退机制**：支持多级语言回退，提供良好的用户体验
5. **API 一致性**：REST、GraphQL、Local API 都提供统一的本地化接口

这种设计既保证了功能的完整性，又维持了良好的性能和开发体验。
