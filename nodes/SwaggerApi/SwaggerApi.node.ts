import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	IHttpRequestOptions,
	IHttpRequestMethods,
	IDataObject,
} from 'n8n-workflow';

interface SwaggerSpec {
	openapi?: string;
	swagger?: string;
	info?: any;
	servers?: Array<{ url: string }>;
	host?: string;
	basePath?: string;
	schemes?: string[];
	paths: {
		[path: string]: {
			[method: string]: {
				summary?: string;
				description?: string;
				operationId?: string;
				parameters?: any[];
				requestBody?: any;
				responses?: any;
			};
		};
	};
}

/**
 * Helper function to fetch Swagger specification from URL
 */
async function fetchSwaggerSpec(
	url: string,
	allowUnauthorizedCerts: boolean = false,
	timeout: number = 10000,
): Promise<SwaggerSpec> {
	const https = await import('https');
	const http = await import('http');
	const { URL } = await import('url');

	return new Promise((resolve, reject) => {
		const parsedUrl = new URL(url);
		const protocol = parsedUrl.protocol === 'https:' ? https : http;

		const options: any = {
			hostname: parsedUrl.hostname,
			port: parsedUrl.port,
			path: parsedUrl.pathname + parsedUrl.search,
			method: 'GET',
			headers: {
				'Accept': 'application/json',
			},
			timeout,
		};

		if (allowUnauthorizedCerts) {
			options.rejectUnauthorized = false;
		}

		const req = protocol.request(options, (res) => {
			let data = '';

			res.on('data', (chunk) => {
				data += chunk;
			});

			res.on('end', () => {
				try {
					const spec = JSON.parse(data);
					resolve(spec);
				} catch (error) {
					reject(new Error(`Failed to parse Swagger JSON: ${error}`));
				}
			});
		});

		req.on('error', (error) => {
			reject(new Error(`Failed to fetch Swagger spec: ${error}`));
		});

		req.on('timeout', () => {
			req.destroy();
			reject(new Error('Request timeout'));
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
		const scheme = spec.schemes && spec.schemes.length > 0 ? spec.schemes[0] : 'https';
		const basePath = spec.basePath || '';
		return `${scheme}://${spec.host}${basePath}`;
	}

	return '';
}

export class SwaggerApi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Swagger API',
		name: 'swaggerApi',
		icon: 'file:swagger-api.svg',
		group: ['transform'],
		version: 1,
		description: 'Make HTTP requests to APIs defined by Swagger/OpenAPI specifications',
		defaults: {
			name: 'Swagger API',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'swaggerApiCredentials',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Endpoint',
				name: 'endpoint',
				type: 'string',
				default: '',
				placeholder: '/users/{id}',
				description: 'API endpoint path (e.g., /users, /posts/{id})',
				required: true,
			},
			{
				displayName: 'Method',
				name: 'method',
				type: 'options',
				options: [
					{
						name: 'GET',
						value: 'GET',
					},
					{
						name: 'POST',
						value: 'POST',
					},
					{
						name: 'PUT',
						value: 'PUT',
					},
					{
						name: 'PATCH',
						value: 'PATCH',
					},
					{
						name: 'DELETE',
						value: 'DELETE',
					},
					{
						name: 'HEAD',
						value: 'HEAD',
					},
					{
						name: 'OPTIONS',
						value: 'OPTIONS',
					},
				],
				default: 'GET',
				description: 'HTTP method to use',
			},
			{
				displayName: 'Path Parameters',
				name: 'pathParameters',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				placeholder: 'Add Path Parameter',
				description: 'Path parameters to replace in the endpoint URL',
				options: [
					{
						name: 'parameter',
						displayName: 'Parameter',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								default: '',
								placeholder: 'id',
								description: 'Parameter name (as it appears in the path)',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Parameter value',
							},
						],
					},
				],
			},
			{
				displayName: 'Query Parameters',
				name: 'queryParameters',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				placeholder: 'Add Query Parameter',
				description: 'Query parameters to add to the URL',
				options: [
					{
						name: 'parameter',
						displayName: 'Parameter',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								default: '',
								placeholder: 'page',
								description: 'Query parameter name',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Query parameter value',
							},
						],
					},
				],
			},
			{
				displayName: 'Headers',
				name: 'headers',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				placeholder: 'Add Header',
				description: 'Additional headers to send with the request',
				options: [
					{
						name: 'parameter',
						displayName: 'Header',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								default: '',
								placeholder: 'Content-Type',
								description: 'Header name',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Header value',
							},
						],
					},
				],
			},
			{
				displayName: 'Request Body',
				name: 'body',
				type: 'json',
				displayOptions: {
					show: {
						method: ['POST', 'PUT', 'PATCH'],
					},
				},
				default: '{}',
				description: 'Request body as JSON',
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Response Format',
						name: 'responseFormat',
						type: 'options',
						options: [
							{
								name: 'JSON',
								value: 'json',
							},
							{
								name: 'Text',
								value: 'text',
							},
							{
								name: 'Auto-Detect',
								value: 'autodetect',
							},
						],
						default: 'autodetect',
						description: 'How to parse the response',
					},
					{
						displayName: 'Full Response',
						name: 'fullResponse',
						type: 'boolean',
						default: false,
						description: 'Whether to return the full response (including headers and status code)',
					},
					{
						displayName: 'Follow Redirects',
						name: 'followRedirects',
						type: 'boolean',
						default: true,
						description: 'Whether to follow HTTP redirects',
					},
					{
						displayName: 'Ignore Response Code',
						name: 'ignoreResponseCode',
						type: 'boolean',
						default: false,
						description: 'Whether to succeed even when HTTP status code indicates an error',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// Get credentials
		const credentials = await this.getCredentials('swaggerApiCredentials');

		// Load Swagger spec
		let swaggerSpec: SwaggerSpec;
		if (credentials.swaggerSource === 'url') {
			const swaggerUrl = credentials.swaggerUrl as string;
			const allowUnauthorizedCerts = credentials.allowUnauthorizedCerts as boolean || false;
			const timeout = credentials.timeout as number || 10000;

			try {
				swaggerSpec = await fetchSwaggerSpec(swaggerUrl, allowUnauthorizedCerts, timeout);
			} catch (error) {
				throw new NodeOperationError(
					this.getNode(),
					`Failed to load Swagger spec from URL: ${error}`,
				);
			}
		} else {
			const swaggerJson = credentials.swaggerJson as string;
			try {
				swaggerSpec = typeof swaggerJson === 'string' ? JSON.parse(swaggerJson) : swaggerJson;
			} catch (error) {
				throw new NodeOperationError(
					this.getNode(),
					`Failed to parse Swagger JSON: ${error}`,
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
				'Could not determine base URL. Please provide a base URL in the credentials.',
			);
		}

		// Remove trailing slash from base URL
		baseUrl = baseUrl.replace(/\/$/, '');

		for (let i = 0; i < items.length; i++) {
			try {
				const method = this.getNodeParameter('method', i) as IHttpRequestMethods;
				let endpoint = this.getNodeParameter('endpoint', i) as string;
				const pathParameters = this.getNodeParameter('pathParameters', i, {}) as IDataObject;
				const queryParameters = this.getNodeParameter('queryParameters', i, {}) as IDataObject;
				const headers = this.getNodeParameter('headers', i, {}) as IDataObject;
				const options = this.getNodeParameter('options', i, {}) as IDataObject;

				// Replace path parameters
				if (pathParameters.parameter) {
					const params = pathParameters.parameter as Array<{ name: string; value: string }>;
					for (const param of params) {
						endpoint = endpoint.replace(`{${param.name}}`, encodeURIComponent(param.value));
					}
				}

				// Build full URL
				let url = `${baseUrl}${endpoint}`;

				// Add query parameters
				if (queryParameters.parameter) {
					const params = queryParameters.parameter as Array<{ name: string; value: string }>;
					const queryString = params
						.map((p) => `${encodeURIComponent(p.name)}=${encodeURIComponent(p.value)}`)
						.join('&');
					if (queryString) {
						url += `?${queryString}`;
					}
				}

				// Build headers
				const requestHeaders: IDataObject = {
					'Content-Type': 'application/json',
				};

				// Add custom headers
				if (headers.parameter) {
					const customHeaders = headers.parameter as Array<{ name: string; value: string }>;
					for (const header of customHeaders) {
						requestHeaders[header.name] = header.value;
					}
				}

				// Add authentication
				const authentication = credentials.authentication as string;
				if (authentication === 'apiKey') {
					const apiKeyLocation = credentials.apiKeyLocation as string;
					const apiKeyName = credentials.apiKeyName as string;
					const apiKeyValue = credentials.apiKeyValue as string;

					if (apiKeyLocation === 'header') {
						requestHeaders[apiKeyName] = apiKeyValue;
					} else if (apiKeyLocation === 'query') {
						const separator = url.includes('?') ? '&' : '?';
						url += `${separator}${encodeURIComponent(apiKeyName)}=${encodeURIComponent(apiKeyValue)}`;
					}
				} else if (authentication === 'bearerToken') {
					const bearerToken = credentials.bearerToken as string;
					requestHeaders['Authorization'] = `Bearer ${bearerToken}`;
				} else if (authentication === 'basicAuth') {
					const username = credentials.username as string;
					const password = credentials.password as string;
					const encodedCredentials = Buffer.from(`${username}:${password}`).toString('base64');
					requestHeaders['Authorization'] = `Basic ${encodedCredentials}`;
				} else if (authentication === 'oauth2') {
					const accessToken = credentials.accessToken as string;
					requestHeaders['Authorization'] = `Bearer ${accessToken}`;
				}

				// Build request options
				const requestOptions: IHttpRequestOptions = {
					method,
					url,
					headers: requestHeaders,
					skipSslCertificateValidation: credentials.allowUnauthorizedCerts as boolean,
					timeout: credentials.timeout as number || 10000,
					returnFullResponse: options.fullResponse as boolean || false,
					ignoreHttpStatusErrors: options.ignoreResponseCode as boolean || false,
				};

				// Add body for POST, PUT, PATCH
				if (['POST', 'PUT', 'PATCH'].includes(method)) {
					const bodyParam = this.getNodeParameter('body', i, '{}') as string;
					const body = typeof bodyParam === 'string' ? JSON.parse(bodyParam) : bodyParam;
					requestOptions.body = body;
				}

				// Make the request
				const response = await this.helpers.httpRequest(requestOptions);

				// Handle response
				let responseData: any;
				const responseFormat = options.responseFormat as string || 'autodetect';

				if (options.fullResponse) {
					responseData = response;
				} else {
					responseData = response;
				}

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
