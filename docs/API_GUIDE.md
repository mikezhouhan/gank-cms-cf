# Gank CMS API Guide

Complete guide for using Gank CMS REST API with multi-language support.

## Table of Contents

- [Authentication](#authentication)
- [Media Management](#media-management)
  - [Upload Media with Multi-language Alt](#upload-media-with-multi-language-alt)
  - [Update Media Translations](#update-media-translations)
  - [Query Media by Language](#query-media-by-language)
- [Posts Management](#posts-management)
  - [Create Post](#create-post)
  - [Create Multi-language Post](#create-multi-language-post)
  - [Update Post Translations](#update-post-translations)
  - [Query Posts by Language](#query-posts-by-language)
- [Complete Examples](#complete-examples)

---

## Authentication

All API requests require authentication using an API Key:

```bash
Authorization: users API-Key YOUR_API_KEY
```

To get your API Key:
1. Login to Admin Panel: `http://localhost:3000/admin`
2. Navigate to your user profile
3. Enable API Key and copy it

---

## Media Management

### Upload Media with Multi-language Alt

**Step 1: Upload image with default language (English)**

```bash
curl -X POST "http://localhost:3000/api/media?locale=en" \
  -H "Authorization: users API-Key YOUR_API_KEY" \
  -F '_payload={"alt":"Product Image"}' \
  -F "file=@/path/to/image.jpg"
```

**Response:**
```json
{
  "doc": {
    "id": 1,
    "alt": "Product Image",
    "url": "/api/media/file/image.jpg",
    "filename": "image.jpg",
    "mimeType": "image/jpeg",
    "filesize": 123456,
    "width": 1920,
    "height": 1080,
    "createdAt": "2025-10-30T00:00:00.000Z"
  },
  "message": "Media successfully created."
}
```

### Update Media Translations

**Step 2: Add Chinese Simplified translation**

```bash
curl -X PATCH "http://localhost:3000/api/media/1?locale=zh-CN" \
  -H "Authorization: users API-Key YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"alt": "产品图片"}'
```

**Step 3: Add Chinese Traditional translation**

```bash
curl -X PATCH "http://localhost:3000/api/media/1?locale=zh-TW" \
  -H "Authorization: users API-Key YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"alt": "產品圖片"}'
```

**Step 4: Add Japanese translation**

```bash
curl -X PATCH "http://localhost:3000/api/media/1?locale=ja" \
  -H "Authorization: users API-Key YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"alt": "製品画像"}'
```

**Step 5: Add Spanish translation**

```bash
curl -X PATCH "http://localhost:3000/api/media/1?locale=es" \
  -H "Authorization: users API-Key YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"alt": "Imagen del Producto"}'
```

### Query Media by Language

**English version:**
```bash
curl "http://localhost:3000/api/media/1?locale=en" \
  -H "Authorization: users API-Key YOUR_API_KEY"
```

**Chinese Simplified version:**
```bash
curl "http://localhost:3000/api/media/1?locale=zh-CN" \
  -H "Authorization: users API-Key YOUR_API_KEY"
```

**Japanese version:**
```bash
curl "http://localhost:3000/api/media/1?locale=ja" \
  -H "Authorization: users API-Key YOUR_API_KEY"
```

---

## Posts Management

### Create Post

**Step 1: Get Category ID**

```bash
curl "http://localhost:3000/api/categories?limit=1" \
  -H "Authorization: users API-Key YOUR_API_KEY"
```

**Response:**
```json
{
  "docs": [
    {
      "id": 1,
      "title": "General"
    }
  ]
}
```

### Create Multi-language Post

**Step 2: Create post with English content**

```bash
curl -X POST "http://localhost:3000/api/posts?locale=en" \
  -H "Authorization: users API-Key YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Welcome to Gank CMS",
    "slug": "welcome-to-gank-cms",
    "category": 1,
    "heroImage": 1,
    "publishedAt": "2025-10-30T00:00:00.000Z",
    "content": {
      "root": {
        "type": "root",
        "format": "",
        "indent": 0,
        "version": 1,
        "direction": "ltr",
        "children": [
          {
            "type": "heading",
            "tag": "h1",
            "format": "",
            "indent": 0,
            "version": 1,
            "direction": "ltr",
            "children": [
              {
                "type": "text",
                "text": "Welcome to Gank CMS",
                "format": 0,
                "style": "",
                "detail": 0,
                "mode": "normal",
                "version": 1
              }
            ]
          },
          {
            "type": "paragraph",
            "format": "",
            "indent": 0,
            "version": 1,
            "direction": "ltr",
            "children": [
              {
                "type": "text",
                "text": "This is a powerful content management system with multi-language support.",
                "format": 0,
                "style": "",
                "detail": 0,
                "mode": "normal",
                "version": 1
              }
            ]
          },
          {
            "type": "upload",
            "version": 1,
            "fields": {
              "caption": "Product Image"
            },
            "value": {
              "id": 1
            },
            "relationTo": "media",
            "format": ""
          }
        ]
      }
    }
  }'
```

**Response:**
```json
{
  "doc": {
    "id": 1,
    "title": "Welcome to Gank CMS",
    "slug": "welcome-to-gank-cms",
    "heroImage": {
      "id": 1,
      "alt": "Product Image",
      "url": "/api/media/file/image.jpg"
    },
    "category": {
      "id": 1,
      "title": "General"
    },
    "publishedAt": "2025-10-30T00:00:00.000Z",
    "createdAt": "2025-10-30T00:00:00.000Z"
  },
  "message": "Post successfully created."
}
```

### Update Post Translations

**Step 3: Add Chinese Simplified translation**

```bash
curl -X PATCH "http://localhost:3000/api/posts/1?locale=zh-CN" \
  -H "Authorization: users API-Key YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "欢迎使用 Gank CMS",
    "content": {
      "root": {
        "type": "root",
        "format": "",
        "indent": 0,
        "version": 1,
        "direction": "ltr",
        "children": [
          {
            "type": "heading",
            "tag": "h1",
            "format": "",
            "indent": 0,
            "version": 1,
            "direction": "ltr",
            "children": [
              {
                "type": "text",
                "text": "欢迎使用 Gank CMS",
                "format": 0,
                "style": "",
                "detail": 0,
                "mode": "normal",
                "version": 1
              }
            ]
          },
          {
            "type": "paragraph",
            "format": "",
            "indent": 0,
            "version": 1,
            "direction": "ltr",
            "children": [
              {
                "type": "text",
                "text": "这是一个功能强大的内容管理系统，支持多语言。",
                "format": 0,
                "style": "",
                "detail": 0,
                "mode": "normal",
                "version": 1
              }
            ]
          },
          {
            "type": "upload",
            "version": 1,
            "fields": {
              "caption": "产品图片"
            },
            "value": {
              "id": 1
            },
            "relationTo": "media",
            "format": ""
          }
        ]
      }
    }
  }'
```

**Step 4: Add Japanese translation**

```bash
curl -X PATCH "http://localhost:3000/api/posts/1?locale=ja" \
  -H "Authorization: users API-Key YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Gank CMSへようこそ",
    "content": {
      "root": {
        "type": "root",
        "format": "",
        "indent": 0,
        "version": 1,
        "direction": "ltr",
        "children": [
          {
            "type": "heading",
            "tag": "h1",
            "format": "",
            "indent": 0,
            "version": 1,
            "direction": "ltr",
            "children": [
              {
                "type": "text",
                "text": "Gank CMSへようこそ",
                "format": 0,
                "style": "",
                "detail": 0,
                "mode": "normal",
                "version": 1
              }
            ]
          },
          {
            "type": "paragraph",
            "format": "",
            "indent": 0,
            "version": 1,
            "direction": "ltr",
            "children": [
              {
                "type": "text",
                "text": "これは多言語対応の強力なコンテンツ管理システムです。",
                "format": 0,
                "style": "",
                "detail": 0,
                "mode": "normal",
                "version": 1
              }
            ]
          },
          {
            "type": "upload",
            "version": 1,
            "fields": {
              "caption": "製品画像"
            },
            "value": {
              "id": 1
            },
            "relationTo": "media",
            "format": ""
          }
        ]
      }
    }
  }'
```

### Query Posts by Language

**Get all posts in English:**
```bash
curl "http://localhost:3000/api/posts?locale=en&limit=10" \
  -H "Authorization: users API-Key YOUR_API_KEY"
```

**Get specific post in Chinese:**
```bash
curl "http://localhost:3000/api/posts/1?locale=zh-CN" \
  -H "Authorization: users API-Key YOUR_API_KEY"
```

**Get post with depth (includes related data):**
```bash
curl "http://localhost:3000/api/posts/1?locale=ja&depth=2" \
  -H "Authorization: users API-Key YOUR_API_KEY"
```

---

## Complete Examples

### Example 1: Upload Image and Create Multi-language Post

```bash
#!/bin/bash

API_KEY="YOUR_API_KEY"
BASE_URL="http://localhost:3000"

# 1. Upload image
echo "Uploading image..."
MEDIA_RESPONSE=$(curl -s -X POST "$BASE_URL/api/media?locale=en" \
  -H "Authorization: users API-Key $API_KEY" \
  -F '_payload={"alt":"Welcome Banner"}' \
  -F "file=@banner.jpg")

MEDIA_ID=$(echo $MEDIA_RESPONSE | jq -r '.doc.id')
echo "Media uploaded with ID: $MEDIA_ID"

# 2. Add media translations
echo "Adding media translations..."
curl -s -X PATCH "$BASE_URL/api/media/$MEDIA_ID?locale=zh-CN" \
  -H "Authorization: users API-Key $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"alt": "欢迎横幅"}' > /dev/null

curl -s -X PATCH "$BASE_URL/api/media/$MEDIA_ID?locale=ja" \
  -H "Authorization: users API-Key $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"alt": "ウェルカムバナー"}' > /dev/null

# 3. Create post in English
echo "Creating post..."
POST_RESPONSE=$(curl -s -X POST "$BASE_URL/api/posts?locale=en" \
  -H "Authorization: users API-Key $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Welcome to Our Platform\",
    \"slug\": \"welcome-to-platform\",
    \"category\": 1,
    \"heroImage\": $MEDIA_ID,
    \"publishedAt\": \"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\",
    \"content\": {
      \"root\": {
        \"type\": \"root\",
        \"children\": [
          {
            \"type\": \"paragraph\",
            \"children\": [
              {
                \"type\": \"text\",
                \"text\": \"Welcome to our platform!\"
              }
            ]
          }
        ]
      }
    }
  }")

POST_ID=$(echo $POST_RESPONSE | jq -r '.doc.id')
echo "Post created with ID: $POST_ID"

# 4. Add post translations
echo "Adding post translations..."
curl -s -X PATCH "$BASE_URL/api/posts/$POST_ID?locale=zh-CN" \
  -H "Authorization: users API-Key $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "欢迎来到我们的平台",
    "content": {
      "root": {
        "type": "root",
        "children": [
          {
            "type": "paragraph",
            "children": [
              {
                "type": "text",
                "text": "欢迎来到我们的平台！"
              }
            ]
          }
        ]
      }
    }
  }' > /dev/null

echo "✅ Complete! Post available in multiple languages."
echo "English: $BASE_URL/api/posts/$POST_ID?locale=en"
echo "Chinese: $BASE_URL/api/posts/$POST_ID?locale=zh-CN"
```

### Example 2: Batch Create Posts with Translations

```bash
#!/bin/bash

API_KEY="YOUR_API_KEY"
BASE_URL="http://localhost:3000"

# Array of posts with translations
declare -A POSTS

# Post 1
POSTS[1_en_title]="Getting Started Guide"
POSTS[1_zh_title]="入门指南"
POSTS[1_ja_title]="スタートガイド"

POSTS[1_en_content]="Learn how to get started with our platform."
POSTS[1_zh_content]="了解如何开始使用我们的平台。"
POSTS[1_ja_content]="当社のプラットフォームの使い方を学びましょう。"

# Post 2
POSTS[2_en_title]="Advanced Features"
POSTS[2_zh_title]="高级功能"
POSTS[2_ja_title]="高度な機能"

POSTS[2_en_content]="Explore advanced features and capabilities."
POSTS[2_zh_content]="探索高级功能和特性。"
POSTS[2_ja_content]="高度な機能を探索しましょう。"

# Create posts with all translations
for i in 1 2; do
  echo "Creating post $i..."
  
  # Create English version
  POST_RESPONSE=$(curl -s -X POST "$BASE_URL/api/posts?locale=en" \
    -H "Authorization: users API-Key $API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
      \"title\": \"${POSTS[${i}_en_title]}\",
      \"slug\": \"post-$i\",
      \"category\": 1,
      \"content\": {
        \"root\": {
          \"type\": \"root\",
          \"children\": [
            {
              \"type\": \"paragraph\",
              \"children\": [
                {
                  \"type\": \"text\",
                  \"text\": \"${POSTS[${i}_en_content]}\"
                }
              ]
            }
          ]
        }
      }
    }")
  
  POST_ID=$(echo $POST_RESPONSE | jq -r '.doc.id')
  
  # Add Chinese translation
  curl -s -X PATCH "$BASE_URL/api/posts/$POST_ID?locale=zh-CN" \
    -H "Authorization: users API-Key $API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
      \"title\": \"${POSTS[${i}_zh_title]}\",
      \"content\": {
        \"root\": {
          \"type\": \"root\",
          \"children\": [
            {
              \"type\": \"paragraph\",
              \"children\": [
                {
                  \"type\": \"text\",
                  \"text\": \"${POSTS[${i}_zh_content]}\"
                }
              ]
            }
          ]
        }
      }
    }" > /dev/null
  
  # Add Japanese translation
  curl -s -X PATCH "$BASE_URL/api/posts/$POST_ID?locale=ja" \
    -H "Authorization: users API-Key $API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
      \"title\": \"${POSTS[${i}_ja_title]}\",
      \"content\": {
        \"root\": {
          \"type\": \"root\",
          \"children\": [
            {
              \"type\": \"paragraph\",
              \"children\": [
                {
                  \"type\": \"text\",
                  \"text\": \"${POSTS[${i}_ja_content]}\"
                }
              ]
            }
          ]
        }
      }
    }" > /dev/null
  
  echo "✅ Post $POST_ID created with 3 languages"
done

echo "🎉 All posts created successfully!"
```

---

## Supported Languages

Gank CMS supports 25 languages:

| Code | Language | Code | Language |
|------|----------|------|----------|
| `en` | English | `ar` | Arabic (RTL) |
| `zh-CN` | Chinese (Simplified) | `id` | Bahasa Indonesia |
| `zh-TW` | Chinese (Traditional) | `vi` | Vietnamese |
| `es` | Spanish | `th` | Thai |
| `fr` | French | `ru` | Russian |
| `de` | German | `it` | Italian |
| `pt` | Portuguese | `nl` | Dutch |
| `ja` | Japanese | `tr` | Turkish |
| `ko` | Korean | `pl` | Polish |
| `hi` | Hindi | `sv` | Swedish |
| | | `ms` | Malay |
| | | `he` | Hebrew (RTL) |
| | | `uk` | Ukrainian |
| | | `cs` | Czech |
| | | `fi` | Finnish |

---

## API Endpoints Reference

### Media

- `POST /api/media?locale={locale}` - Upload media
- `GET /api/media?locale={locale}` - List all media
- `GET /api/media/{id}?locale={locale}` - Get specific media
- `PATCH /api/media/{id}?locale={locale}` - Update media
- `DELETE /api/media/{id}` - Delete media

### Posts

- `POST /api/posts?locale={locale}` - Create post
- `GET /api/posts?locale={locale}` - List all posts
- `GET /api/posts/{id}?locale={locale}` - Get specific post
- `PATCH /api/posts/{id}?locale={locale}` - Update post
- `DELETE /api/posts/{id}` - Delete post

### Categories

- `POST /api/categories` - Create category
- `GET /api/categories` - List all categories
- `GET /api/categories/{id}` - Get specific category
- `PATCH /api/categories/{id}` - Update category
- `DELETE /api/categories/{id}` - Delete category

### Users

- `POST /api/users` - Create user
- `GET /api/users` - List all users
- `GET /api/users/{id}` - Get specific user
- `PATCH /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### Authentication

- `POST /api/users/login` - Login
- `POST /api/users/logout` - Logout
- `GET /api/users/me` - Get current user

---

## Notes

1. **Localized Fields**: Only `title`, `content` in Posts and `alt` in Media are localized
2. **Default Language**: English (`en`) is the default fallback language
3. **Slug**: Slug is shared across all languages (not localized)
4. **Relations**: `heroImage`, `category`, `authors` are shared across all languages
5. **Media in Content**: Media IDs in content `upload` nodes are shared, but captions can be different per language

---

## SwaggerUI Documentation

For interactive API documentation, visit:

**Local Development:**
- SwaggerUI: `http://localhost:3000/api/docs`
- OpenAPI Spec: `http://localhost:3000/api/openapi.json`

**Production:**
- SwaggerUI: `https://your-domain.com/api/docs`
- OpenAPI Spec: `https://your-domain.com/api/openapi.json`

---

## Troubleshooting

### Media Upload Returns 400 Error

**Error:** `The following field is invalid: Alt`

**Solution:** Use `_payload` field for JSON data:
```bash
-F '_payload={"alt":"Your alt text"}'  # ✅ Correct
-F 'alt=Your alt text'                  # ❌ Wrong
```

### Post Creation Missing Locale

**Problem:** Created post only shows in default language

**Solution:** Specify `locale` parameter:
```bash
POST /api/posts?locale=en  # ✅ Specify locale
POST /api/posts            # Uses default locale
```

### Content Images Not Showing

**Problem:** Images uploaded but not visible in content

**Solution:** Ensure Media ID is correctly referenced in content upload nodes:
```json
{
  "type": "upload",
  "value": {
    "id": 1  // ✅ Reference existing media ID
  },
  "relationTo": "media"
}
```

---

For more information, visit the [Payload CMS Documentation](https://payloadcms.com/docs).

