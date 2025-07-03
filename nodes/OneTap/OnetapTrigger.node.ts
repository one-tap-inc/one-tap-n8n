import type {
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IPollFunctions,
	IWebhookFunctions,
	IWebhookResponseData,
	ITriggerFunctions,
	ITriggerResponse,
} from 'n8n-workflow';

import { NodeConnectionType } from 'n8n-workflow';

export class OneTapTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'OneTap Trigger',
		name: 'onetapTrigger',
		group: ['trigger'],
		version: 1,
		description: 'Listen for OneTap events like check-ins, check-outs, and new participants',
		defaults: {
			name: 'OneTap Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'onetapApi',
				required: true,
			},
		],
		polling: true,
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
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
				displayName: 'Trigger On',
				name: 'triggerOn',
				type: 'options',
				options: [
					{
						name: 'Check-In',
						value: 'checkin',
						description: 'Trigger when a participant checks in',
					},
					{
						name: 'Check-Out',
						value: 'checkout',
						description: 'Trigger when a participant checks out',
					},
					{
						name: 'New Participant',
						value: 'participant',
						description: 'Trigger when a new participant is created',
					},
					{
						name: 'Profile Created',
						value: 'profile',
						description: 'Trigger when a new profile is created',
					},
				],
				default: 'checkin',
				description: 'The event to trigger on',
			},
			{
				displayName: 'Trigger Method',
				name: 'triggerMethod',
				type: 'options',
				options: [
					{
						name: 'Polling',
						value: 'polling',
						description: 'Check for new events by polling the API regularly',
					},
					{
						name: 'Webhook',
						value: 'webhook',
						description: 'Listen for webhook calls from OneTap (if supported)',
					},
				],
				default: 'polling',
				description: 'How to listen for events',
			},
			{
				displayName: 'Poll Interval (Minutes)',
				name: 'pollInterval',
				type: 'number',
				default: 5,
				description: 'How often to check for new events (in minutes)',
				displayOptions: {
					show: {
						triggerMethod: ['polling'],
					},
				},
				typeOptions: {
					minValue: 1,
					maxValue: 60,
				},
			},
			{
				displayName: 'List ID',
				name: 'listId',
				type: 'string',
				default: '',
				description: 'Optional: Only trigger for events from a specific list',
				displayOptions: {
					show: {
						triggerOn: ['checkin', 'checkout', 'participant'],
					},
				},
			},
			{
				displayName: 'Profile ID',
				name: 'profileId',
				type: 'string',
				default: '',
				description: 'Optional: Only trigger for events from a specific profile',
				displayOptions: {
					show: {
						triggerOn: ['checkin', 'checkout'],
					},
				},
			},
			{
				displayName: 'Additional Filters',
				name: 'additionalFilters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				options: [
					{
						displayName: 'Method',
						name: 'method',
						type: 'multiOptions',
						default: [],
						description: 'Filter by check-in/check-out method',
						options: [
							{ name: 'TAP', value: 'TAP' },
							{ name: 'QR', value: 'QR' },
							{ name: 'Manual', value: 'MANUAL' },
							{ name: 'Kiosk', value: 'KIOSK' },
							{ name: 'SMS', value: 'SMS' },
							{ name: 'Email', value: 'EMAIL' },
							{ name: 'Voice', value: 'VOICE' },
							{ name: 'Browser', value: 'BROWSER' },
							{ name: 'Mobile App', value: 'MOBILE_APP' },
						],
						displayOptions: {
							show: {
								'/triggerOn': ['checkin', 'checkout'],
							},
						},
					},
					{
						displayName: 'Source',
						name: 'source',
						type: 'string',
						default: '',
						description: 'Filter by source',
					},
				],
			},
		],
	};

	async poll(this: IPollFunctions): Promise<INodeExecutionData[][]> {
		const triggerOn = this.getNodeParameter('triggerOn') as string;
		const listId = this.getNodeParameter('listId') as string;
		const profileId = this.getNodeParameter('profileId') as string;
		const additionalFilters = this.getNodeParameter('additionalFilters') as any;

		// Get environment and set base URL accordingly
		const environment = this.getNodeParameter('environment') as string;
		const baseURL = environment === 'staging' 
			? 'http://localhost:1337' 
			: 'https://api-beta.onetapcheckin.com';

		const now = Math.floor(Date.now() / 1000);
		const pollInterval = this.getNodeParameter('pollInterval') as number;
		const sinceTimestamp = now - (pollInterval * 60); // Convert minutes to seconds

		let events: any[] = [];

		try {
			if (triggerOn === 'checkin' || triggerOn === 'checkout') {
				// Poll participants API for recent check-ins/check-outs
				const queryParams: Record<string, any> = {
					limit: 100,
					skip: 0,
					sortField: triggerOn === 'checkin' ? 'checkInDate' : 'checkOutDate',
					sortOrder: 'desc',
				};

				// Add timestamp filter
				if (triggerOn === 'checkin') {
					queryParams.gtCheckInDate = sinceTimestamp;
					queryParams.checkedIn = true;
				} else {
					queryParams.gtCheckOutDate = sinceTimestamp;
					queryParams.checkedOut = true;
				}

				// Add optional filters
				if (listId) queryParams.listId = listId;
				if (profileId) queryParams.profileId = profileId;

				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'onetap',
					{
						method: 'GET',
						url: `${baseURL}/api/participants`,
						qs: queryParams,
					},
				);

				events = Array.isArray(response) ? response : [response];

				// Apply additional filters
				if (additionalFilters.method && additionalFilters.method.length > 0) {
					const methodField = triggerOn === 'checkin' ? 'checkInMethod' : 'checkOutMethod';
					events = events.filter(event => 
						additionalFilters.method.includes(event[methodField])
					);
				}

				if (additionalFilters.source) {
					events = events.filter(event => 
						event.source && event.source.includes(additionalFilters.source)
					);
				}

			} else if (triggerOn === 'participant') {
				// Poll participants API for new participants
				const queryParams: Record<string, any> = {
					limit: 100,
					skip: 0,
					sortField: 'createdAt',
					sortOrder: 'desc',
				};

				if (listId) queryParams.listId = listId;

				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'onetap',
					{
						method: 'GET',
						url: `${baseURL}/api/participants`,
						qs: queryParams,
					},
				);

				events = Array.isArray(response) ? response : [response];

				// Filter by creation time (if createdAt is available)
				events = events.filter(event => {
					if (event.createdAt) {
						const createdAt = typeof event.createdAt === 'number' ? event.createdAt : 
										 Math.floor(new Date(event.createdAt).getTime() / 1000);
						return createdAt > sinceTimestamp;
					}
					return true; // Include if no timestamp available
				});

			} else if (triggerOn === 'profile') {
				// Poll profiles API for new profiles
				const queryParams: Record<string, any> = {
					page: 0,
					pageSize: 100,
					sortBy: 'createdAt',
					sortOrder: 'desc',
				};

				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'onetap',
					{
						method: 'GET',
						url: `${baseURL}/api/profiles`,
						qs: queryParams,
					},
				);

				events = Array.isArray(response.data) ? response.data : [response.data || response];

				// Filter by creation time (if createdAt is available)
				events = events.filter(event => {
					if (event.createdAt) {
						const createdAt = typeof event.createdAt === 'number' ? event.createdAt : 
										 Math.floor(new Date(event.createdAt).getTime() / 1000);
						return createdAt > sinceTimestamp;
					}
					return true; // Include if no timestamp available
				});
			}

			// Apply source filter if specified
			if (additionalFilters.source) {
				events = events.filter(event => 
					event.source && event.source.includes(additionalFilters.source)
				);
			}

		} catch (error) {
			// If there's an error, return empty array to avoid stopping the workflow
			// Error is silently handled to prevent workflow interruption
			return [[]];
		}

		// Convert events to node execution data
		const returnData: INodeExecutionData[] = events.map(event => ({
			json: {
				...event,
				triggerType: triggerOn,
				environment: environment,
				triggeredAt: now,
			},
		}));

		return [returnData];
	}

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const triggerOn = this.getNodeParameter('triggerOn') as string;
		const body = this.getBodyData();
		const headers = this.getHeaderData();
		const query = this.getQueryData();
		const environment = this.getNodeParameter('environment') as string;

		// Basic webhook validation (you may want to add signature verification)
		if (!body || typeof body !== 'object') {
			return {
				noWebhookResponse: true,
			};
		}

		// Filter webhook events based on trigger configuration
		const webhookData = body as any;
		
		// Add metadata to the webhook data
		const eventData = {
			...webhookData,
			triggerType: triggerOn,
			environment: environment,
			triggeredAt: Math.floor(Date.now() / 1000),
			headers,
			query,
		};

		// Apply filters if configured
		const listId = this.getNodeParameter('listId') as string;
		const profileId = this.getNodeParameter('profileId') as string;
		const additionalFilters = this.getNodeParameter('additionalFilters') as any;

		// Filter by list ID
		if (listId && webhookData.listId && webhookData.listId !== listId) {
			return { noWebhookResponse: true };
		}

		// Filter by profile ID
		if (profileId && webhookData.profileId && webhookData.profileId !== profileId) {
			return { noWebhookResponse: true };
		}

		// Filter by method
		if (additionalFilters.method && additionalFilters.method.length > 0) {
			const method = webhookData.method || webhookData.checkInMethod || webhookData.checkOutMethod;
			if (method && !additionalFilters.method.includes(method)) {
				return { noWebhookResponse: true };
			}
		}

		// Filter by source
		if (additionalFilters.source && webhookData.source && !webhookData.source.includes(additionalFilters.source)) {
			return { noWebhookResponse: true };
		}

		return {
			workflowData: [
				[
					{
						json: eventData,
					},
				],
			],
		};
	}

	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
		const triggerMethod = this.getNodeParameter('triggerMethod') as string;

		if (triggerMethod === 'webhook') {
			// For webhook mode, return webhook configuration
			// Note: Use the OneTap Webhook Manager node to automatically register webhooks
			// This provides better control over webhook lifecycle and configuration
			return {
				closeFunction: async () => {
					// Cleanup if needed
					// Note: If you used OneTap Webhook Manager, use it to unregister as well
				},
			};
		} else {
			// For polling mode, set up polling
			return {
				closeFunction: async () => {
					// Cleanup if needed for polling mode
				},
				// Note: Polling is handled by the poll() method automatically
			};
		}
	}
} 