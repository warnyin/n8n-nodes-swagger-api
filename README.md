<div align="center">

# 🔌 @warnyin/n8n-nodes-swagger-api

### Seamlessly integrate with REST APIs using Swagger/OpenAPI specifications in n8n

[![npm version](https://img.shields.io/npm/v/@warnyin/n8n-nodes-swagger-api.svg?style=flat-square)](https://www.npmjs.com/package/@warnyin/n8n-nodes-swagger-api)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![n8n](https://img.shields.io/badge/n8n-Community%20Node-00D4AA?style=flat-square&logo=n8n)](https://n8n.io)
[![GitHub stars](https://img.shields.io/github/stars/warnyin/n8n-nodes-swagger-api?style=flat-square)](https://github.com/warnyin/n8n-nodes-swagger-api/stargazers)

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Examples](#-examples) • [Development](#-development)

</div>

---

## 📖 About

This **n8n community node** enables you to connect to any REST API that provides a Swagger/OpenAPI specification. Simply point to your API's Swagger JSON, configure authentication, and start making requests with full type safety and documentation at your fingertips.

Perfect for integrating with enterprise APIs, microservices, and third-party platforms that expose their endpoints through OpenAPI specifications.

## ✨ Features

<table>
<tr>
<td>

### 📝 Swagger/OpenAPI Support
- 🔗 Load specs from URL or paste directly
- 📊 Supports OpenAPI 3.x and Swagger 2.x
- 🎯 Automatic base URL detection
- 🔄 Dynamic endpoint configuration

</td>
<td>

### 🔐 Authentication
- 🔑 API Key (Header or Query)
- 🎫 Bearer Token
- 👤 Basic Authentication
- 🔓 OAuth2 Support
- ⚙️ No Authentication option

</td>
</tr>
<tr>
<td>

### 🌐 HTTP Methods
- ✅ GET
- ✅ POST
- ✅ PUT
- ✅ PATCH
- ✅ DELETE
- ✅ HEAD
- ✅ OPTIONS

</td>
<td>

### ⚡ Advanced Features
- 🔀 Path parameter replacement
- 🔍 Query parameter support
- 📤 Custom headers
- 📦 JSON request bodies
- 🚦 Response format options
- ⏱️ Configurable timeout
- 🔒 SSL certificate control

</td>
</tr>
</table>

## 📦 Installation

### Option 1: Community Nodes (Recommended)

1. Open your n8n instance
2. Navigate to **Settings** → **Community Nodes**
3. Click **Install**
4. Enter: `@warnyin/n8n-nodes-swagger-api`
5. Agree to the risks and click **Install**

### Option 2: Manual Installation

```bash
# Navigate to your n8n installation directory
cd ~/.n8n/custom

# Clone the repository
git clone https://github.com/warnyin/n8n-nodes-swagger-api.git

# Install dependencies
cd n8n-nodes-swagger-api
npm install

# Build the node
npm run build

# Restart n8n
```

### Option 3: Local Development

```bash
# Clone and install
git clone https://github.com/warnyin/n8n-nodes-swagger-api.git
cd n8n-nodes-swagger-api
npm install
npm run build

# Link to n8n
npm link
cd ~/.n8n
npm link @warnyin/n8n-nodes-swagger-api

# Restart n8n
```

## 🚀 Usage

### Step 1: Create Credentials

<details>
<summary><b>Click to expand credential setup</b></summary>

1. In n8n, go to **Credentials** → **New**
2. Search for **Swagger API**
3. Configure the following:

#### Swagger Source
Choose how to provide your API specification:
- **From URL**: Enter the URL to your `swagger.json` or `openapi.json`
  ```
  https://api.example.com/v1/swagger.json
  ```
- **From JSON**: Paste your entire Swagger/OpenAPI specification

#### Base URL (Optional)
Override the base URL from the spec:
```
https://api.example.com/v1
```

#### Authentication
Select your authentication method:

**API Key**
- Location: Header or Query Parameter
- Name: `X-API-Key` or your custom header/param name
- Value: Your API key

**Bearer Token**
- Token: Your bearer token

**Basic Auth**
- Username: Your username
- Password: Your password

**OAuth2**
- Access Token: Your OAuth2 access token

#### Optional Settings
- **Ignore SSL Issues**: Enable for self-signed certificates
- **Timeout**: Request timeout in milliseconds (default: 10000)

</details>

### Step 2: Use the Node

1. Add **Swagger API** node to your workflow
2. Select your credentials
3. Configure your request:

#### Basic Configuration

| Field | Description | Example |
|-------|-------------|---------|
| **Endpoint** | API path (supports placeholders) | `/users/{id}` |
| **Method** | HTTP method | `GET`, `POST`, etc. |

#### Path Parameters
Replace placeholders in your endpoint:
- Name: `id`
- Value: `12345`

Result: `/users/{id}` → `/users/12345`

#### Query Parameters
Add query strings to your request:
- Name: `page`
- Value: `1`
- Name: `limit`
- Value: `50`

Result: `?page=1&limit=50`

#### Headers
Add custom headers:
- Name: `Content-Type`
- Value: `application/json`

#### Request Body
For POST/PUT/PATCH requests, add JSON body:
```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

#### Options
- **Response Format**: JSON, Text, or Auto-Detect
- **Full Response**: Include headers and status code
- **Follow Redirects**: Enable/disable redirect following
- **Ignore Response Code**: Don't fail on HTTP errors

## 💡 Examples

### Example 1: Get User Profile

**Scenario**: Fetch a user's profile from a REST API

```
Endpoint: /users/{userId}
Method: GET
Path Parameters:
  - userId: 12345
```

**Result**:
```json
{
  "id": 12345,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "admin"
}
```

---

### Example 2: Create a Blog Post

**Scenario**: Create a new blog post with title and content

```
Endpoint: /posts
Method: POST
Request Body:
{
  "title": "My First Post",
  "content": "This is the content of my blog post",
  "author": "John Doe",
  "tags": ["n8n", "automation", "api"]
}
```

**Result**:
```json
{
  "id": 789,
  "title": "My First Post",
  "status": "published",
  "createdAt": "2025-01-15T10:30:00Z"
}
```

---

### Example 3: Search Products with Filters

**Scenario**: Search for products with pagination and filters

```
Endpoint: /products/search
Method: GET
Query Parameters:
  - q: laptop
  - category: electronics
  - minPrice: 500
  - maxPrice: 2000
  - page: 1
  - limit: 20
  - sort: price_asc
```

**Result**:
```json
{
  "results": [
    {
      "id": 101,
      "name": "Gaming Laptop XYZ",
      "price": 1499,
      "category": "electronics"
    }
  ],
  "total": 45,
  "page": 1,
  "totalPages": 3
}
```

---

### Example 4: Update User with Authentication

**Scenario**: Update user details with Bearer token auth

```
Credentials:
  - Authentication: Bearer Token
  - Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Node Configuration:
  - Endpoint: /users/{id}
  - Method: PATCH
  - Path Parameters:
      - id: 12345
  - Request Body:
      {
        "name": "Jane Doe",
        "email": "jane@example.com"
      }
```

---

### Example 5: Delete Resource

**Scenario**: Delete a resource by ID

```
Endpoint: /resources/{resourceId}
Method: DELETE
Path Parameters:
  - resourceId: abc-123
```

**Result**:
```json
{
  "message": "Resource deleted successfully",
  "resourceId": "abc-123"
}
```

## 🔧 Use Cases

### 1. **Microservices Integration**
Connect multiple microservices in your architecture using their OpenAPI specs.

### 2. **Third-Party API Integration**
Integrate with SaaS platforms that provide Swagger documentation (Stripe, Shopify, etc.).

### 3. **Internal API Automation**
Automate workflows with your company's internal REST APIs.

### 4. **API Testing & Monitoring**
Build automated tests and health checks for your APIs.

### 5. **Data Synchronization**
Sync data between different systems using standardized API calls.

## 🛠️ Development

### Prerequisites
- Node.js 18+
- npm or yarn
- n8n installed (for testing)

### Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/warnyin/n8n-nodes-swagger-api.git
cd n8n-nodes-swagger-api

# Install dependencies
npm install

# Build the project
npm run build
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Compile TypeScript and copy assets |
| `npm run dev` | Watch mode for development |
| `npm run lint` | Run ESLint |
| `npm run lintfix` | Fix ESLint errors automatically |
| `npm run format` | Format code with Prettier |

### Project Structure

```
@warnyin/n8n-nodes-swagger-api/
├── credentials/
│   └── SwaggerApiCredentials.credentials.ts  # Credential type definition
├── nodes/
│   └── SwaggerApi/
│       ├── SwaggerApi.node.ts                # Main node implementation
│       └── swagger-api.svg                   # Node icon
├── package.json                               # Package configuration
├── tsconfig.json                              # TypeScript configuration
└── README.md                                  # This file
```

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Contribution Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Make sure `npm run lint` passes
- Keep commits clean and descriptive

## 📝 Roadmap

- [ ] Auto-generate node parameters from Swagger spec
- [ ] Support for file uploads/downloads
- [ ] Batch request support
- [ ] Request/Response transformation
- [ ] Built-in retry logic
- [ ] Rate limiting support
- [ ] WebSocket support for compatible specs

## ❓ FAQ

<details>
<summary><b>Q: Does this work with OpenAPI 3.x?</b></summary>
Yes! This node supports both Swagger 2.x and OpenAPI 3.x specifications.
</details>

<details>
<summary><b>Q: Can I use this with private/internal APIs?</b></summary>
Absolutely! You can paste the Swagger JSON directly or use a URL accessible from your n8n instance.
</details>

<details>
<summary><b>Q: What if my API doesn't have a Swagger spec?</b></summary>
Consider using the standard HTTP Request node instead, or create a Swagger specification for your API.
</details>

<details>
<summary><b>Q: How do I handle API rate limits?</b></summary>
Use n8n's built-in "Wait" node between requests or implement custom retry logic in your workflow.
</details>

## 🐛 Bug Reports & Feature Requests

Found a bug or have an idea? Please open an issue!

- **Bug Reports**: [Create a bug report](https://github.com/warnyin/n8n-nodes-swagger-api/issues/new?labels=bug)
- **Feature Requests**: [Request a feature](https://github.com/warnyin/n8n-nodes-swagger-api/issues/new?labels=enhancement)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 👤 Author

**warnyin**

- GitHub: [@warnyin](https://github.com/warnyin)
- Repository: [n8n-nodes-swagger-api](https://github.com/warnyin/n8n-nodes-swagger-api)

## 🌟 Show Your Support

Give a ⭐️ if this project helped you!

## 🙏 Acknowledgments

- [n8n](https://n8n.io) - Workflow automation platform
- [Swagger/OpenAPI](https://swagger.io) - API specification standard
- The n8n community for inspiration and support

---

<div align="center">

Made with ❤️ for the n8n community

**[⬆ Back to Top](#-warnyinn8n-nodes-swagger-api)**

</div>
