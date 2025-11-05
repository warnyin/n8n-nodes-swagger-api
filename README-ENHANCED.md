# n8n-nodes-swagger-api

An n8n community node for integrating with REST APIs using Swagger/OpenAPI specifications. This node provides an intuitive interface to interact with any API that has a Swagger/OpenAPI specification, with features like service discovery, auto-generated inputs, and comprehensive authentication support.

## Features

- 🔍 **Service Discovery**: Automatically loads and parses Swagger/OpenAPI specifications
- 📋 **Organized Operation List**: Operations grouped by tags with summary, description, and endpoint information
- 🔧 **Auto-Generated Inputs**: Automatically generates input fields based on the selected operation's parameters
- 🔐 **Multiple Authentication Methods**: Support for API Key, Bearer Token, Basic Auth, and OAuth2
- 🌐 **Flexible Configuration**: Load Swagger specs from URL or paste JSON directly
- 📝 **Rich Operation Details**: Shows operation summary, description, and endpoint information
- 🔄 **Similar to HTTP Request Node**: Familiar interface for n8n users with additional Swagger-specific features

## Installation

```bash
npm install @warnyin/n8n-nodes-swagger-api
```

## Configuration

### 1. Credentials Setup

Create a new credential of type "Swagger API" and configure:

#### Swagger Source
- **From URL**: Load specification from a public URL (e.g., `https://api.example.com/swagger.json`)
- **From JSON**: Paste the Swagger/OpenAPI specification directly

#### Authentication Options
- **None**: No authentication required
- **API Key**: Provide API key name and value (sent in header or query parameter)
- **Bearer Token**: Provide bearer token for Authorization header
- **Basic Auth**: Provide username and password
- **OAuth2**: Provide access token

#### Additional Settings
- **Base URL**: Override the base URL from the Swagger specification
- **Ignore SSL Issues**: Skip SSL certificate validation (useful for development)
- **Timeout**: Request timeout in milliseconds (default: 10000)

### 2. Node Configuration

#### Operation Selection
- Choose from a searchable list of operations grouped by tags
- Each operation shows:
  - Operation summary and description
  - HTTP method and endpoint path
  - Operation ID (if available)

#### Parameters
The node automatically provides input fields based on the selected operation:

- **Path Parameters**: Required parameters in the URL path (e.g., `{id}` in `/users/{id}`)
- **Query Parameters**: Optional or required query string parameters
- **Headers**: Additional HTTP headers
- **Request Body**: For POST, PUT, PATCH operations (JSON, Form Data, Raw text)

#### Options
- **Response Format**: JSON, Text, or Auto-Detect
- **Full Response**: Return complete response including headers and status
- **Follow Redirects**: Whether to follow HTTP redirects
- **Ignore Response Code**: Don't fail on HTTP error status codes
- **Timeout**: Override default request timeout

## Usage Examples

### Example 1: Basic GET Request

1. Create Swagger API credentials pointing to `https://jsonplaceholder.typicode.com/swagger.json`
2. Select operation: "Get all posts (GET /posts)"
3. Add query parameters if needed (e.g., `_limit: 10`)
4. Execute to get list of posts

### Example 2: POST Request with Body

1. Select operation: "Create post (POST /posts)"
2. Enable "Send Body" and set content type to "JSON"
3. Add request body:
   ```json
   {
     "title": "My New Post",
     "body": "This is the post content",
     "userId": 1
   }
   ```
4. Execute to create new post

### Example 3: Path Parameters

1. Select operation: "Get post by ID (GET /posts/{id})"
2. Add path parameter: `id: 1`
3. Execute to get specific post

## Key Enhancements

This enhanced version includes:

1. **Service Discovery**: Operations grouped by tags from Swagger spec
2. **Auto-Generated UI**: Input fields automatically created based on operation parameters
3. **Rich Operation Details**: Summary, description, and endpoint shown for each operation
4. **Improved Authentication**: Multiple auth methods with proper credential management
5. **Better UX**: Searchable operation list similar to other n8n resource locator nodes

## Development

### Building the Node

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Watch for changes during development
npm run dev

# Run linting
npm run lint

# Format code
npm run format
```

## License

MIT - see [LICENSE.md](LICENSE.md)

## Support

- GitHub Issues: [Report bugs or request features](https://github.com/warnyin/n8n-nodes-swagger-api/issues)
- n8n Community: [n8n Community Forum](https://community.n8n.io/)

---

Made with ❤️ for the n8n community