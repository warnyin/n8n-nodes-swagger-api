# n8n-nodes-swagger-api

This n8n node allows you to integrate with REST APIs using Swagger/OpenAPI specifications.

## Features

- Load Swagger/OpenAPI specs from URL or paste as JSON
- Support for all HTTP methods (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS)
- Multiple authentication methods:
  - API Key (Header or Query Parameter)
  - Bearer Token
  - Basic Auth
  - OAuth2
- Path parameters replacement
- Query parameters
- Custom headers
- Request body for POST/PUT/PATCH
- Configurable options (response format, full response, follow redirects, etc.)
- SSL certificate validation control
- Configurable timeout

## Installation

### Community Node

1. Go to Settings > Community Nodes in n8n
2. Select Install
3. Enter `n8n-nodes-swagger-api`
4. Agree to the risks and install

### Manual Installation

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run build` to compile the TypeScript code
4. Link the package to your n8n installation

## Usage

### Setting up Credentials

1. Create new credentials in n8n
2. Choose "Swagger API" from the credential types
3. Configure:
   - **Swagger Source**: Choose "From URL" or "From JSON"
   - **Swagger JSON URL** (if using URL): Enter the URL to your Swagger/OpenAPI specification
   - **Swagger JSON** (if using JSON): Paste your Swagger/OpenAPI specification
   - **Base URL** (optional): Override the base URL from the spec
   - **Authentication**: Select authentication method and provide credentials
   - **Ignore SSL Issues** (optional): Ignore SSL certificate validation
   - **Timeout** (optional): Request timeout in milliseconds

### Using the Node

1. Add the "Swagger API" node to your workflow
2. Select your Swagger API credentials
3. Configure the request:
   - **Endpoint**: API endpoint path (e.g., `/users/{id}`)
   - **Method**: HTTP method (GET, POST, PUT, etc.)
   - **Path Parameters**: Replace placeholders in the endpoint
   - **Query Parameters**: Add query parameters to the URL
   - **Headers**: Add custom headers
   - **Request Body**: JSON body for POST/PUT/PATCH requests
   - **Options**: Additional options like response format

## Examples

### Example 1: Get User by ID

- Endpoint: `/users/{id}`
- Method: GET
- Path Parameters:
  - Name: `id`
  - Value: `123`

### Example 2: Create a New Post

- Endpoint: `/posts`
- Method: POST
- Request Body:
```json
{
  "title": "My New Post",
  "content": "This is the content of my post"
}
```

### Example 3: Search with Query Parameters

- Endpoint: `/search`
- Method: GET
- Query Parameters:
  - Name: `q`
  - Value: `n8n automation`
  - Name: `limit`
  - Value: `10`

## Development

### Build

```bash
npm run build
```

### Watch Mode

```bash
npm run dev
```

### Lint

```bash
npm run lint
```

### Format

```bash
npm run format
```

## License

MIT

## Author

Your Name

## Support

For issues and feature requests, please create an issue in the repository.
