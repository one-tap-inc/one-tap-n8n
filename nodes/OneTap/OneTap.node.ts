import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class OneTap implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'OneTap',
		name: 'onetap',
		group: ['marketing'],
		version: 1,
		description: 'Manage visitors, check-ins, and attendance with OneTap',
		defaults: {
			name: 'OneTap',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'onetap',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: 'https://api-beta.onetapcheckin.com',
			url: '',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Profile',
						value: 'profile',
					},
				],
				default: 'profile',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['profile'],
					},
				},
				options: [
					{
						name: 'Get All',
						value: 'getAll',
						description: 'Fetch all profiles',
						action: 'Get all profiles',
					},
				],
				default: 'getAll',
			},
			{
				displayName: 'Page',
				name: 'page',
				type: 'number',
				default: 1,
				description: 'Page number to retrieve',
				displayOptions: {
					show: {
						resource: ['profile'],
						operation: ['getAll'],
					},
				},
			},
			{
				displayName: 'Page Size',
				name: 'pageSize',
				type: 'number',
				default: 50,
				description: 'Number of profiles to retrieve per page',
				displayOptions: {
					show: {
						resource: ['profile'],
						operation: ['getAll'],
					},
				},
			},
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				default: false,
				description: 'Whether to return all results or only up to the page size limit',
				displayOptions: {
					show: {
						resource: ['profile'],
						operation: ['getAll'],
					},
				},
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['profile'],
						operation: ['getAll'],
					},
				},
				options: [
					{
						displayName: 'Search',
						name: 'search',
						type: 'string',
						default: '',
						description: 'Search by name, email, or phone number',
						placeholder: 'john',
						routing: {
							send: {
								type: 'query',
								property: 'search',
							},
						},
					},
					{
						displayName: 'Sort By',
						name: 'sortBy',
						type: 'options',
						default: '',
						description: 'Field to sort by',
						options: [
							{
								name: 'Name',
								value: 'name',
							},
							{
								name: 'Email',
								value: 'email',
							},
							{
								name: 'Created At',
								value: 'createdAt',
							},
						],
						routing: {
							send: {
								type: 'query',
								property: 'sortBy',
							},
						},
					},
					{
						displayName: 'Sort Order',
						name: 'sortOrder',
						type: 'options',
						default: 'asc',
						description: 'Sort direction',
						options: [
							{
								name: 'Ascending',
								value: 'asc',
							},
							{
								name: 'Descending',
								value: 'desc',
							},
						],
						routing: {
							send: {
								type: 'query',
								property: 'sortOrder',
							},
						},
					},
					{
						displayName: 'Favorite',
						name: 'favorite',
						type: 'boolean',
						default: false,
						description: 'Filter by favorite status',
						routing: {
							send: {
								type: 'query',
								property: 'favorite',
							},
						},
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				if (resource === 'profile') {
					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const page = this.getNodeParameter('page', i) as number;
						const pageSize = this.getNodeParameter('pageSize', i) as number;

						if (returnAll) {
							// Fetch all profiles by paginating through all pages
							let allProfiles: any[] = [];
							let currentPage = 1;
							let hasMoreData = true;

							while (hasMoreData) {
								const response = await this.helpers.httpRequestWithAuthentication.call(
									this,
									'onetap',
									{
										method: 'GET',
										url: `/api/profiles?page=${currentPage}&pageSize=${pageSize}`,
									},
								);

								if (response.data && Array.isArray(response.data)) {
									allProfiles = allProfiles.concat(response.data);
									// Check if we got fewer results than requested, indicating last page
									hasMoreData = response.data.length === pageSize;
									currentPage++;
								} else {
									hasMoreData = false;
								}
							}

							// Return all profiles as separate items
							for (const profile of allProfiles) {
								returnData.push({
									json: profile,
									pairedItem: i,
								});
							}
						} else {
							// Fetch single page
							const response = await this.helpers.httpRequestWithAuthentication.call(
								this,
								'onetap',
								{
									method: 'GET',
									url: `/api/profiles?page=${page}&pageSize=${pageSize}`,
								},
							);

							if (response.data && Array.isArray(response.data)) {
								for (const profile of response.data) {
									returnData.push({
										json: profile,
										pairedItem: i,
									});
								}
							} else {
								returnData.push({
									json: response,
									pairedItem: i,
								});
							}
						}
					}
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: error.message },
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
					});
				}
			}
		}

		return [returnData];
	}
}
