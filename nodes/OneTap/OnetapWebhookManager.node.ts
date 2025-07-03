import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class OneTapWebhookManager implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'OneTap Webhook Manager',
		name: 'onetapWebhookManager',
		group: ['transform'],
		version: 1,
		description: 'Register and manage webhooks with OneTap',
		defaults: {
			name: 'OneTap Webhook Manager',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'onetap',
				required: true,
			},
		],
		requestDefaults: {
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Environment',
				name: 'environment',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Production',
						value: 'production',
						description: 'Use production OneTap API server',
					},
					{
						name: 'Staging',
						value: 'staging', 
						description: 'Use staging/development OneTap API server',
					},
				],
				default: 'production',
				description: 'Select which OneTap environment to use',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Register Webhook',
						value: 'register',
						description: 'Register a new webhook with OneTap',
						action: 'Register a new webhook',
					},
					{
						name: 'Unregister Webhook',
						value: 'unregister',
						description: 'Unregister an existing webhook',
						action: 'Unregister an existing webhook',
					},
					{
						name: 'List Webhooks',
						value: 'list',
						description: 'List all registered webhooks',
						action: 'List all registered webhooks',
					},
					{
						name: 'Update Webhook',
						value: 'update',
						description: 'Update an existing webhook',
						action: 'Update an existing webhook',
					},
				],
				default: 'register',
			},
			// REGISTER WEBHOOK FIELDS
			{
				displayName: 'Webhook URL',
				name: 'webhookUrl',
				type: 'string',
				required: true,
				default: '',
				description: 'The URL that OneTap should call when events occur',
				placeholder: 'https://your-n8n-instance.com/webhook/your-webhook-ID',
				displayOptions: {
					show: {
						operation: ['register', 'update'],
					},
				},
			},
			{
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				required: true,
				default: ['checkin'],
				description: 'Events that should trigger the webhook',
				options: [
					{
						name: 'Participant Check-In',
						value: 'participant.checkin',
						description: 'Participant checked in',
					},
					{
						name: 'Participant Check-Out',
						value: 'participant.checkout',
						description: 'Participant checked out',
					},
					{
						name: 'New Participant',
						value: 'participant.created',
						description: 'New participant created',
					},
					{
						name: 'Profile Created',
						value: 'profile.created',
						description: 'New profile created',
					},
					{
						name: 'Profile Updated',
						value: 'profile.updated',
					},
					{
						name: 'Profile Deleted',
						value: 'profile.deleted',
					},
					{
						name: 'List Created',
						value: 'list.created',
					},
					{
						name: 'List Updated',
						value: 'list.updated',
					},
					{
						name: 'List Deleted',
						value: 'list.deleted',
					},
					{
						name: 'Participant Deleted',
						value: 'participant.deleted',
					},
					{
						name: 'Passport Created',
						value: 'passport.created',
					},
					{
						name: 'Passport Deleted',
						value: 'passport.deleted',
					},
					{
						name: 'All Events',
						value: '*',
						description: 'Subscribe to all events (wildcard)',
					},
				],
				displayOptions: {
					show: {
						operation: ['register', 'update'],
					},
				},
			},
			{
				displayName: 'Additional Settings',
				name: 'additionalSettings',
				type: 'collection',
				placeholder: 'Add Setting',
				default: {},
				displayOptions: {
					show: {
						operation: ['register', 'update'],
					},
				},
				options: [
					{
						displayName: 'Webhook Name',
						name: 'name',
						type: 'string',
						default: '',
						description: 'Name for the webhook (for identification)',
						placeholder: 'n8n-checkin-webhook',
					},
					{
						displayName: 'Description',
						name: 'description',
						type: 'string',
						default: '',
						description: 'Description of the webhook purpose',
						placeholder: 'Webhook for processing check-ins in n8n',
					},
					{
						displayName: 'Active',
						name: 'active',
						type: 'boolean',
						default: true,
						description: 'Whether the webhook is active',
					},
					{
						displayName: 'Secret',
						name: 'secret',
						type: 'string',
						typeOptions: { password: true },
						default: '',
						description: 'Secret for webhook signature verification (optional)',
						placeholder: 'your-webhook-secret',
					},
				],
			},
			// UNREGISTER/UPDATE WEBHOOK FIELDS
			{
				displayName: 'Integration ID',
				name: 'integrationId',
				type: 'string',
				required: true,
				default: '',
				description: 'The ID of the integration to unregister or update',
				displayOptions: {
					show: {
						operation: ['unregister', 'update'],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const operation = this.getNodeParameter('operation', 0) as string;

		// Get environment and set base URL accordingly
		const environment = this.getNodeParameter('environment', 0) as string;
		const baseURL = environment === 'staging' 
			? 'http://localhost:1337' 
			: 'https://api-beta.onetapcheckin.com';

		for (let i = 0; i < items.length; i++) {
			try {
				if (operation === 'register') {
					const webhookUrl = this.getNodeParameter('webhookUrl', i) as string;
					const events = this.getNodeParameter('events', i) as string[];
					const additionalSettings = this.getNodeParameter('additionalSettings', i) as Record<string, any>;

					// Build the request body according to OneTap API format
					const body: Record<string, any> = {
						name: additionalSettings.name || 'n8n Integration',
						description: additionalSettings.description || 'Webhook integration created from n8n',
						webhookSettings: {
							url: webhookUrl,
							events: events,
							isActive: additionalSettings.active !== undefined ? additionalSettings.active : true,
						},
					};

					// Add optional webhook headers
					if (additionalSettings.secret) {
						body.webhookSettings.headers = {
							'X-Webhook-Secret': additionalSettings.secret,
						};
					}

					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'onetap',
						{
							method: 'POST',
							url: `${baseURL}/api/organization/integrations`,
							body,
						},
					);

					returnData.push({
						json: {
							success: true,
							operation: 'register',
							environment: environment,
							integrationId: response.data?.id || response.id,
							apiKey: response.data?.apiKey,
							webhookUrl: webhookUrl,
							events: events,
							...response.data,
						},
						pairedItem: i,
					});

				} else if (operation === 'unregister') {
					const integrationId = this.getNodeParameter('integrationId', i) as string;

					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'onetap',
						{
							method: 'DELETE',
							url: `${baseURL}/api/organization/integrations/${integrationId}`,
						},
					);

					returnData.push({
						json: {
							success: true,
							operation: 'unregister',
							environment: environment,
							integrationId: integrationId,
							...response,
						},
						pairedItem: i,
					});

				} else if (operation === 'list') {
					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'onetap',
						{
							method: 'GET',
							url: `${baseURL}/api/organization/integrations`,
						},
					);

					// If response has data array, return each integration as separate item
					if (Array.isArray(response.data)) {
						for (const integration of response.data) {
							returnData.push({
								json: {
									operation: 'list',
									environment: environment,
									...integration,
								},
								pairedItem: i,
							});
						}
					} else {
						returnData.push({
							json: {
								operation: 'list',
								environment: environment,
								...response,
							},
							pairedItem: i,
						});
					}

				} else if (operation === 'update') {
					const integrationId = this.getNodeParameter('integrationId', i) as string;
					const webhookUrl = this.getNodeParameter('webhookUrl', i) as string;
					const events = this.getNodeParameter('events', i) as string[];
					const additionalSettings = this.getNodeParameter('additionalSettings', i) as Record<string, any>;

					// Build the request body according to OneTap API format
					const body: Record<string, any> = {
						webhookSettings: {
							url: webhookUrl,
							events: events,
							isActive: additionalSettings.active !== undefined ? additionalSettings.active : true,
						},
					};

					// Add optional fields
					if (additionalSettings.name) body.name = additionalSettings.name;
					if (additionalSettings.description) body.description = additionalSettings.description;
					
					// Add optional webhook headers
					if (additionalSettings.secret) {
						body.webhookSettings.headers = {
							'X-Webhook-Secret': additionalSettings.secret,
						};
					}

					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'onetap',
						{
							method: 'PUT',
							url: `${baseURL}/api/organization/integrations/${integrationId}`,
							body,
						},
					);

					returnData.push({
						json: {
							success: true,
							operation: 'update',
							environment: environment,
							integrationId: integrationId,
							...response.data,
						},
						pairedItem: i,
					});
				}

			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { 
							success: false,
							operation: operation,
							error: error.message 
						},
						error,
						pairedItem: i,
					});
				} else {
					if (error.context) {
						error.context.itemIndex = i;
						throw error;
					}
					throw new NodeOperationError(this.getNode(), error, {
						itemIndex: i,
						description: `Failed to ${operation} webhook with OneTap: ${error.message}`,
					});
				}
			}
		}

		return [returnData];
	}
} 