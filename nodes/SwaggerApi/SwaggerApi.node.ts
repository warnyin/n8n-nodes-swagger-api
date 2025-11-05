import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
  IHttpRequestOptions,
  IHttpRequestMethods,
  IDataObject,
  ILoadOptionsFunctions,
  INodeListSearchResult,
  INodeListSearchItems,
} from "n8n-workflow";

interface SwaggerSpec {
  openapi?: string;
  swagger?: string;
  info?: any;
  servers?: Array<{ url: string }>;
  host?: string;
  basePath?: string;
  schemes?: string[];
  tags?: Array<{ name: string; description?: string }>;
  paths: {
    [path: string]: {
      [method: string]: {
        summary?: string;
        description?: string;
        operationId?: string;
        tags?: string[];
        parameters?: Array<{
          name: string;
          in: "query" | "header" | "path" | "cookie";
          required?: boolean;
          description?: string;
          schema?: any;
          type?: string;
        }>;
        requestBody?: {
          description?: string;
          required?: boolean;
          content?: any;
        };
        responses?: any;
      };
    };
  };
}

interface OperationInfo {
  path: string;
  method: string;
  operationId?: string;
  summary?: string;
  description?: string;
  tags?: string[];
  parameters?: any[];
  requestBody?: any;
}

/**
 * Helper function to fetch Swagger specification from URL
 */
async function fetchSwaggerSpec(
  url: string,
  allowUnauthorizedCerts: boolean = false,
  timeout: number = 10000
): Promise<SwaggerSpec> {
  const https = await import("https");
  const http = await import("http");
  const { URL } = await import("url");

  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const protocol = parsedUrl.protocol === "https:" ? https : http;

    const options: any = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      timeout,
    };

    if (allowUnauthorizedCerts) {
      options.rejectUnauthorized = false;
    }

    const req = protocol.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const spec = JSON.parse(data);
          resolve(spec);
        } catch (error) {
          reject(new Error(`Failed to parse Swagger JSON: ${error}`));
        }
      });
    });

    req.on("error", (error) => {
      reject(new Error(`Failed to fetch Swagger spec: ${error}`));
    });

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });

    req.end();
  });
}

/**
 * Helper function to get base URL from Swagger spec
 */
function getBaseUrlFromSpec(spec: SwaggerSpec): string {
  // OpenAPI 3.x
  if (spec.servers && spec.servers.length > 0) {
    return spec.servers[0].url;
  }

  // Swagger 2.x
  if (spec.host) {
    const scheme =
      spec.schemes && spec.schemes.length > 0 ? spec.schemes[0] : "https";
    const basePath = spec.basePath || "";
    return `${scheme}://${spec.host}${basePath}`;
  }

  return "";
}

export class SwaggerApi implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Swagger API",
    name: "swaggerApi",
    icon: "file:swagger-api.svg",
    group: ["transform"],
    version: 1,
    description:
      "Make HTTP requests to APIs defined by Swagger/OpenAPI specifications",
    defaults: {
      name: "Swagger API",
    },
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      {
        name: "swaggerApiCredentials",
        required: true,
      },
    ],
    properties: [
      {
        displayName: "Operation",
        name: "operation",
        type: "resourceLocator",
        default: { mode: "list", value: "" },
        required: true,
        description: "Choose the API operation to execute",
        modes: [
          {
            displayName: "From List",
            name: "list",
            type: "list",
            placeholder: "Select an operation...",
            typeOptions: {
              searchListMethod: "getOperations",
              searchable: true,
            },
          },
        ],
      },
      // Dynamic fields that will be added based on selected operation
      {
        displayName: "Operation Details",
        name: "operationDetails",
        type: "notice",
        displayOptions: {
          show: {
            "@version": [1],
          },
          hide: {
            operation: [""],
          },
        },
        default: "",
        typeOptions: {
          theme: "info",
        },
      },
      // Path Parameters - dynamically generated
      {
        displayName: "Path Parameters",
        name: "pathParameters",
        type: "fixedCollection",
        typeOptions: {
          multipleValues: true,
        },
        default: {},
        placeholder: "Add Path Parameter",
        description: "Path parameters required for this endpoint",
        displayOptions: {
          show: {
            "@version": [1],
          },
        },
        options: [
          {
            name: "parameter",
            displayName: "Parameter",
            values: [
              {
                displayName: "Name",
                name: "name",
                type: "string",
                default: "",
                description: "Parameter name",
                required: true,
              },
              {
                displayName: "Value",
                name: "value",
                type: "string",
                default: "",
                description: "Parameter value",
                required: true,
              },
            ],
          },
        ],
      },
      // Query Parameters - dynamically generated
      {
        displayName: "Query Parameters",
        name: "queryParameters",
        type: "fixedCollection",
        typeOptions: {
          multipleValues: true,
        },
        default: {},
        placeholder: "Add Query Parameter",
        description: "Query parameters for the request",
        options: [
          {
            name: "parameter",
            displayName: "Parameter",
            values: [
              {
                displayName: "Name",
                name: "name",
                type: "string",
                default: "",
                description: "Query parameter name",
                required: true,
              },
              {
                displayName: "Value",
                name: "value",
                type: "string",
                default: "",
                description: "Query parameter value",
                required: true,
              },
            ],
          },
        ],
      },
      // Headers
      {
        displayName: "Headers",
        name: "headers",
        type: "fixedCollection",
        typeOptions: {
          multipleValues: true,
        },
        default: {},
        placeholder: "Add Header",
        description: "Additional headers to send with the request",
        options: [
          {
            name: "parameter",
            displayName: "Header",
            values: [
              {
                displayName: "Name",
                name: "name",
                type: "string",
                default: "",
                placeholder: "Content-Type",
                description: "Header name",
                required: true,
              },
              {
                displayName: "Value",
                name: "value",
                type: "string",
                default: "",
                description: "Header value",
                required: true,
              },
            ],
          },
        ],
      },
      // Request Body
      {
        displayName: "Send Body",
        name: "sendBody",
        type: "boolean",
        default: false,
        description: "Whether to send a request body",
        displayOptions: {
          show: {
            "@version": [1],
          },
        },
      },
      {
        displayName: "Body Content Type",
        name: "bodyContentType",
        type: "options",
        displayOptions: {
          show: {
            sendBody: [true],
          },
        },
        options: [
          {
            name: "JSON",
            value: "json",
          },
          {
            name: "Form Data",
            value: "form-data",
          },
          {
            name: "Form Encoded",
            value: "form-urlencoded",
          },
          {
            name: "Raw",
            value: "raw",
          },
        ],
        default: "json",
        description: "Content type of the body data",
      },
      {
        displayName: "Body",
        name: "body",
        type: "json",
        displayOptions: {
          show: {
            sendBody: [true],
            bodyContentType: ["json"],
          },
        },
        default: "{}",
        description: "Request body as JSON",
      },
      {
        displayName: "Body",
        name: "body",
        type: "string",
        displayOptions: {
          show: {
            sendBody: [true],
            bodyContentType: ["raw"],
          },
        },
        default: "",
        description: "Raw request body",
      },
      // Options
      {
        displayName: "Options",
        name: "options",
        type: "collection",
        placeholder: "Add Option",
        default: {},
        options: [
          {
            displayName: "Response Format",
            name: "responseFormat",
            type: "options",
            options: [
              {
                name: "JSON",
                value: "json",
              },
              {
                name: "Text",
                value: "text",
              },
              {
                name: "Auto-Detect",
                value: "autodetect",
              },
            ],
            default: "autodetect",
            description: "How to parse the response",
          },
          {
            displayName: "Full Response",
            name: "fullResponse",
            type: "boolean",
            default: false,
            description:
              "Whether to return the full response (including headers and status code)",
          },
          {
            displayName: "Follow Redirects",
            name: "followRedirects",
            type: "boolean",
            default: true,
            description: "Whether to follow HTTP redirects",
          },
          {
            displayName: "Ignore Response Code",
            name: "ignoreResponseCode",
            type: "boolean",
            default: false,
            description:
              "Whether to succeed even when HTTP status code indicates an error",
          },
          {
            displayName: "Timeout",
            name: "timeout",
            type: "number",
            typeOptions: {
              minValue: 1,
            },
            default: 10000,
            description:
              "Time in milliseconds to wait for a response before failing the request",
          },
        ],
      },
    ],
  };

  methods = {
    listSearch: {
      async getOperations(
        this: ILoadOptionsFunctions
      ): Promise<INodeListSearchResult> {
        const credentials = await this.getCredentials("swaggerApiCredentials");

        let swaggerSpec: SwaggerSpec;
        try {
          if (credentials.swaggerSource === "url") {
            const swaggerUrl = credentials.swaggerUrl as string;
            const allowUnauthorizedCerts =
              (credentials.allowUnauthorizedCerts as boolean) || false;
            const timeout = (credentials.timeout as number) || 10000;
            swaggerSpec = await fetchSwaggerSpec(
              swaggerUrl,
              allowUnauthorizedCerts,
              timeout
            );
          } else {
            const swaggerJson = credentials.swaggerJson as string;
            swaggerSpec =
              typeof swaggerJson === "string"
                ? JSON.parse(swaggerJson)
                : swaggerJson;
          }
        } catch (error) {
          throw new NodeOperationError(
            this.getNode(),
            `Failed to load Swagger spec: ${error instanceof Error ? error.message : String(error)}`
          );
        }

        const operations: INodeListSearchItems[] = [];
        const groupedByTag: { [tag: string]: INodeListSearchItems[] } = {};

        // Group operations by tags
        for (const [path, pathItem] of Object.entries(swaggerSpec.paths)) {
          for (const [method, operation] of Object.entries(pathItem)) {
            if (typeof operation !== "object" || !operation) continue;

            const operationInfo: OperationInfo = {
              path,
              method: method.toUpperCase(),
              operationId: operation.operationId,
              summary: operation.summary,
              description: operation.description,
              tags: operation.tags || ["Untagged"],
              parameters: operation.parameters,
              requestBody: operation.requestBody,
            };

            const value = JSON.stringify(operationInfo);
            const displayName =
              operation.summary || `${method.toUpperCase()} ${path}`;
            const description = [
              operation.description,
              `Endpoint: ${method.toUpperCase()} ${path}`,
              operation.operationId
                ? `Operation ID: ${operation.operationId}`
                : "",
            ]
              .filter(Boolean)
              .join("\n");

            const item: INodeListSearchItems = {
              name: displayName,
              value,
              description,
            };

            // Group by first tag
            const primaryTag =
              (operation.tags && operation.tags[0]) || "Untagged";
            if (!groupedByTag[primaryTag]) {
              groupedByTag[primaryTag] = [];
            }
            groupedByTag[primaryTag].push(item);
          }
        }

        // Flatten grouped operations while preserving tag structure
        const tags = Object.keys(groupedByTag).sort((a, b) =>
          a.localeCompare(b)
        );
        for (const tag of tags) {
          // Add tag header
          const tagOperations = [
            {
              name: `--- ${tag} ---`,
              value: "",
              description: `Operations in ${tag} category`,
            },
            ...groupedByTag[tag],
          ];
          operations.push(...tagOperations);
        }

        return {
          results: operations,
        };
      },
    },
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    // Get credentials
    const credentials = await this.getCredentials("swaggerApiCredentials");

    // Load Swagger spec
    let swaggerSpec: SwaggerSpec;
    if (credentials.swaggerSource === "url") {
      const swaggerUrl = credentials.swaggerUrl as string;
      const allowUnauthorizedCerts =
        (credentials.allowUnauthorizedCerts as boolean) || false;
      const timeout = (credentials.timeout as number) || 10000;

      try {
        swaggerSpec = await fetchSwaggerSpec(
          swaggerUrl,
          allowUnauthorizedCerts,
          timeout
        );
      } catch (error) {
        throw new NodeOperationError(
          this.getNode(),
          `Failed to load Swagger spec from URL: ${error}`
        );
      }
    } else {
      const swaggerJson = credentials.swaggerJson as string;
      try {
        swaggerSpec =
          typeof swaggerJson === "string"
            ? JSON.parse(swaggerJson)
            : swaggerJson;
      } catch (error) {
        throw new NodeOperationError(
          this.getNode(),
          `Failed to parse Swagger JSON: ${error}`
        );
      }
    }

    // Get base URL
    let baseUrl = credentials.baseUrl as string;
    if (!baseUrl) {
      baseUrl = getBaseUrlFromSpec(swaggerSpec);
    }
    if (!baseUrl) {
      throw new NodeOperationError(
        this.getNode(),
        "Could not determine base URL. Please provide a base URL in the credentials."
      );
    }

    // Remove trailing slash from base URL
    baseUrl = baseUrl.replace(/\/$/, "");

    for (let i = 0; i < items.length; i++) {
      try {
        // Get selected operation
        const operationParam = this.getNodeParameter("operation", i) as any;
        let operationInfo: OperationInfo;

        if (typeof operationParam === "string") {
          operationInfo = JSON.parse(operationParam);
        } else if (operationParam && operationParam.value) {
          operationInfo = JSON.parse(operationParam.value);
        } else {
          throw new NodeOperationError(this.getNode(), "No operation selected");
        }

        const method = operationInfo.method as IHttpRequestMethods;
        let endpoint = operationInfo.path;

        const pathParameters = this.getNodeParameter(
          "pathParameters",
          i,
          {}
        ) as IDataObject;
        const queryParameters = this.getNodeParameter(
          "queryParameters",
          i,
          {}
        ) as IDataObject;
        const headers = this.getNodeParameter("headers", i, {}) as IDataObject;
        const options = this.getNodeParameter("options", i, {});

        // Replace path parameters
        if (pathParameters.parameter) {
          const params = pathParameters.parameter as Array<{
            name: string;
            value: string;
          }>;
          for (const param of params) {
            endpoint = endpoint.replace(
              `{${param.name}}`,
              encodeURIComponent(param.value)
            );
          }
        }

        // Build full URL
        let url = `${baseUrl}${endpoint}`;

        // Add query parameters
        if (queryParameters.parameter) {
          const params = queryParameters.parameter as Array<{
            name: string;
            value: string;
          }>;
          const queryString = params
            .map(
              (p) =>
                `${encodeURIComponent(p.name)}=${encodeURIComponent(p.value)}`
            )
            .join("&");
          if (queryString) {
            url += `?${queryString}`;
          }
        }

        // Build headers
        const requestHeaders: IDataObject = {
          "Content-Type": "application/json",
        };

        // Add custom headers
        if (headers.parameter) {
          const customHeaders = headers.parameter as Array<{
            name: string;
            value: string;
          }>;
          for (const header of customHeaders) {
            requestHeaders[header.name] = header.value;
          }
        }

        // Add authentication
        const authentication = credentials.authentication as string;
        if (authentication === "apiKey") {
          const apiKeyLocation = credentials.apiKeyLocation as string;
          const apiKeyName = credentials.apiKeyName as string;
          const apiKeyValue = credentials.apiKeyValue as string;

          if (apiKeyLocation === "header") {
            requestHeaders[apiKeyName] = apiKeyValue;
          } else if (apiKeyLocation === "query") {
            const separator = url.includes("?") ? "&" : "?";
            url += `${separator}${encodeURIComponent(apiKeyName)}=${encodeURIComponent(apiKeyValue)}`;
          }
        } else if (authentication === "bearerToken") {
          const bearerToken = credentials.bearerToken as string;
          requestHeaders["Authorization"] = `Bearer ${bearerToken}`;
        } else if (authentication === "basicAuth") {
          const username = credentials.username as string;
          const password = credentials.password as string;
          const encodedCredentials = Buffer.from(
            `${username}:${password}`
          ).toString("base64");
          requestHeaders["Authorization"] = `Basic ${encodedCredentials}`;
        } else if (authentication === "oauth2") {
          const accessToken = credentials.accessToken as string;
          requestHeaders["Authorization"] = `Bearer ${accessToken}`;
        }

        // Build request options
        const requestOptions: IHttpRequestOptions = {
          method,
          url,
          headers: requestHeaders,
          skipSslCertificateValidation:
            credentials.allowUnauthorizedCerts as boolean,
          timeout:
            (options as any).timeout ||
            (credentials.timeout as number) ||
            10000,
          returnFullResponse:
            ((options as any).fullResponse as boolean) || false,
          ignoreHttpStatusErrors:
            ((options as any).ignoreResponseCode as boolean) || false,
        };

        // Add body for POST, PUT, PATCH
        const sendBody = this.getNodeParameter("sendBody", i, false) as boolean;
        if (sendBody && ["POST", "PUT", "PATCH"].includes(method)) {
          const bodyContentType = this.getNodeParameter(
            "bodyContentType",
            i,
            "json"
          ) as string;

          if (bodyContentType === "json") {
            const bodyParam = this.getNodeParameter("body", i, "{}") as string;
            const body =
              typeof bodyParam === "string" ? JSON.parse(bodyParam) : bodyParam;
            requestOptions.body = body;
          } else if (bodyContentType === "raw") {
            const body = this.getNodeParameter("body", i, "") as string;
            requestOptions.body = body;
            requestHeaders["Content-Type"] = "text/plain";
          }
        }

        // Make the request
        const response = await this.helpers.httpRequest(requestOptions);

        // Handle response
        const responseData = response;

        returnData.push({
          json: responseData,
          pairedItem: { item: i },
        });
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: error instanceof Error ? error.message : String(error),
            },
            pairedItem: { item: i },
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
