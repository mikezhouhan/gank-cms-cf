# Gank CMS Documentation

Welcome to the Gank CMS documentation directory.

## 📚 Available Documentation

### [API Guide](./API_GUIDE.md)
Complete REST API documentation with curl examples for:
- **Multi-language Media Management** - Upload and manage media with 25 language support
- **Multi-language Posts Management** - Create and manage posts with translations
- **Complete Examples** - Shell scripts for batch operations
- **Troubleshooting** - Common issues and solutions

## 🌍 Multi-language Support

Gank CMS supports **25 languages** out of the box:

English, Chinese (Simplified & Traditional), Spanish, French, German, Portuguese, Japanese, Korean, Hindi, Arabic, Bahasa Indonesia, Vietnamese, Thai, Russian, Italian, Dutch, Turkish, Polish, Swedish, Malay, Hebrew, Ukrainian, Czech, and Finnish.

## 🚀 Quick Start

### 1. Authentication

Get your API Key from the Admin Panel:
```bash
http://localhost:3000/admin
```

### 2. Upload Media

```bash
curl -X POST "http://localhost:3000/api/media?locale=en" \
  -H "Authorization: users API-Key YOUR_API_KEY" \
  -F '_payload={"alt":"My Image"}' \
  -F "file=@image.jpg"
```

### 3. Create Post

```bash
curl -X POST "http://localhost:3000/api/posts?locale=en" \
  -H "Authorization: users API-Key YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Post",
    "slug": "my-first-post",
    "category": 1,
    "content": {
      "root": {
        "type": "root",
        "children": [
          {
            "type": "paragraph",
            "children": [
              {
                "type": "text",
                "text": "Hello World!"
              }
            ]
          }
        ]
      }
    }
  }'
```

## 📖 Additional Resources

- **SwaggerUI**: `http://localhost:3000/api/docs` - Interactive API documentation
- **OpenAPI Spec**: `http://localhost:3000/api/openapi.json` - Machine-readable API specification
- **Payload CMS Docs**: https://payloadcms.com/docs - Official Payload CMS documentation

## 🏗️ Architecture

```
Gank CMS
├── Next.js 15 - Frontend framework
├── Payload CMS 3 - Headless CMS
├── Cloudflare Workers - Edge deployment
├── D1 - SQLite database
└── R2 - Object storage for media
```

## 🔑 Key Features

- ✅ **25 Language Support** - Built-in internationalization
- ✅ **Rich Text Editor** - Lexical-based editor with media support
- ✅ **API-First** - REST API with OpenAPI documentation
- ✅ **Media Management** - Upload and organize media files
- ✅ **Role-Based Access** - User authentication and authorization
- ✅ **Edge Deployment** - Fast global content delivery

## 📝 Contributing

When adding new documentation:

1. Keep examples up-to-date with the latest API
2. Include both curl and JavaScript examples where applicable
3. Document all required and optional parameters
4. Provide error handling examples
5. Test all code examples before committing

## 🐛 Issues

Found a bug or have a question? Please open an issue on GitHub.

## 📄 License

[Add your license information here]

