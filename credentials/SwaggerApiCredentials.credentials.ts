import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class SwaggerApiCredentials implements ICredentialType {
	name = 'swaggerApiCredentials';
	displayName = 'Swagger API';
	documentationUrl = 'https://swagger.io/specification/';
	properties: INodeProperties[] = [
		{
			displayName: 'Swagger Source',
			name: 'swaggerSource',
			type: 'options',
			options: [
				{
					name: 'From URL',
					value: 'url',
					description: 'Load Swagger/OpenAPI specification from a URL',
				},
				{
					name: 'From JSON',
					value: 'json',
					description: 'Paste Swagger/OpenAPI specification as JSON',
				},
			],
			default: 'url',
			description: 'How to provide the Swagger/OpenAPI specification',
		},
		{
			displayName: 'Swagger JSON URL',
			name: 'swaggerUrl',
			type: 'string',
			displayOptions: {
				show: {
					swaggerSource: ['url'],
				},
			},
			default: '',
			placeholder: 'https://api.example.com/swagger.json',
			description: 'URL to the Swagger/OpenAPI JSON specification',
			required: true,
		},
		{
			displayName: 'Swagger JSON',
			name: 'swaggerJson',
			type: 'json',
			displayOptions: {
				show: {
					swaggerSource: ['json'],
				},
			},
			default: '{}',
			description: 'The Swagger/OpenAPI specification as JSON. Must be a valid Swagger 2.x or OpenAPI 3.x specification.',
			placeholder: '{"openapi": "3.0.0", "info": {...}, "paths": {...}}',
			required: true,
			validateType: 'object',
			ignoreValidationDuringExecution: true,
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: '',
			placeholder: 'https://api.example.com',
			description: 'Base URL for API requests (overrides the server URL in Swagger spec if provided)',
		},
		{
			displayName: 'Authentication',
			name: 'authentication',
			type: 'options',
			options: [
				{
					name: 'None',
					value: 'none',
				},
				{
					name: 'API Key',
					value: 'apiKey',
				},
				{
					name: 'Bearer Token',
					value: 'bearerToken',
				},
				{
					name: 'Basic Auth',
					value: 'basicAuth',
				},
				{
					name: 'OAuth2',
					value: 'oauth2',
				},
			],
			default: 'none',
			description: 'Authentication method to use',
		},
		// API Key Authentication
		{
			displayName: 'API Key Location',
			name: 'apiKeyLocation',
			type: 'options',
			displayOptions: {
				show: {
					authentication: ['apiKey'],
				},
			},
			options: [
				{
					name: 'Header',
					value: 'header',
				},
				{
					name: 'Query Parameter',
					value: 'query',
				},
			],
			default: 'header',
			description: 'Where to send the API key',
		},
		{
			displayName: 'API Key Name',
			name: 'apiKeyName',
			type: 'string',
			displayOptions: {
				show: {
					authentication: ['apiKey'],
				},
			},
			default: 'X-API-Key',
			description: 'Name of the API key header or query parameter',
			required: true,
		},
		{
			displayName: 'API Key Value',
			name: 'apiKeyValue',
			type: 'string',
			typeOptions: {
				password: true,
			},
			displayOptions: {
				show: {
					authentication: ['apiKey'],
				},
			},
			default: '',
			description: 'The API key value',
			required: true,
		},
		// Bearer Token Authentication
		{
			displayName: 'Bearer Token',
			name: 'bearerToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			displayOptions: {
				show: {
					authentication: ['bearerToken'],
				},
			},
			default: '',
			description: 'The bearer token for authentication',
			required: true,
		},
		// Basic Auth
		{
			displayName: 'Username',
			name: 'username',
			type: 'string',
			displayOptions: {
				show: {
					authentication: ['basicAuth'],
				},
			},
			default: '',
			description: 'Username for basic authentication',
			required: true,
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: {
				password: true,
			},
			displayOptions: {
				show: {
					authentication: ['basicAuth'],
				},
			},
			default: '',
			description: 'Password for basic authentication',
			required: true,
		},
		// OAuth2
		{
			displayName: 'Access Token',
			name: 'accessToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			displayOptions: {
				show: {
					authentication: ['oauth2'],
				},
			},
			default: '',
			description: 'OAuth2 access token',
			required: true,
		},
		// Optional Settings
		{
			displayName: 'Ignore SSL Issues',
			name: 'allowUnauthorizedCerts',
			type: 'boolean',
			default: false,
			description: 'Whether to download the response even if SSL certificate validation is not possible',
		},
		{
			displayName: 'Timeout',
			name: 'timeout',
			type: 'number',
			default: 10000,
			description: 'Time in milliseconds to wait for a response before giving up (default: 10000)',
		},
	];
}
