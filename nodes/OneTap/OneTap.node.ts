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
		icon: 'file:onetap.svg',
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
					{
						name: 'Passport',
						value: 'passports',
					},
					{
						name: 'Punch Pass',
						value: 'punchPasses',
					},
					{
						name: 'Participant',
						value: 'participants',
					},
					{
						name: 'List',
						value: 'lists',
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
						name: 'Get Many',
						value: 'getAll',
						description: 'Fetch many profiles',
						action: 'Get many profiles',
						routing: {
							request: {
								method: 'GET',
								url: '/api/profiles',
							},
						},
					},
					{
						name: 'Get Single',
						value: 'getSingle',
						description: 'Get a specific profile by ID',
						action: 'Get a specific profile',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new profile',
						action: 'Create a profile',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a profile',
						action: 'Update a profile',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a specific profile',
						action: 'Delete a profile',
					},
					{
						name: 'Delete Multiple',
						value: 'deleteMultiple',
						description: 'Delete multiple profiles',
						action: 'Delete multiple profiles',
					},
					{
						name: 'Update Avatar',
						value: 'updateAvatar',
						description: 'Update profile avatar image',
						action: 'Update profile avatar',
					},
					{
						name: 'Get Custom Fields',
						value: 'getCustomFields',
						description: 'Get custom fields schema',
						action: 'Get custom fields schema',
					},
					{
						name: 'Find by Check-in Code',
						value: 'findByCheckInCode',
						description: 'Find profile by check-in code',
						action: 'Find profile by check in code',
					},
				],
				default: 'getAll',
			},
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				default: false,
				description: 'Whether to return all results or only up to a given limit',
				displayOptions: {
					show: {
						resource: ['profile'],
						operation: ['getAll'],
					},
				},
			},
			{
				displayName: 'Page',
				name: 'page',
				type: 'number',
				default: 0,
				description: 'Page number to retrieve',
				typeOptions: {
					minValue: 0,
				},
				displayOptions: {
					show: {
						resource: ['profile'],
						operation: ['getAll'],
						returnAll: [false],
					},
				},
				routing: {
					send: {
						type: 'query',
						property: 'page',
					},
				},
			},
			{
				displayName: 'Page Size',
				name: 'pageSize',
				type: 'number',
				default: 50,
				description: 'Number of profiles to retrieve per page',
				typeOptions: {
					minValue: 1,
					maxValue: 100,
				},
				displayOptions: {
					show: {
						resource: ['profile'],
						operation: ['getAll'],
						returnAll: [false],
					},
				},
				routing: {
					send: {
						type: 'query',
						property: 'pageSize',
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
						default: 'name',
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
						description: 'Whether to filter by favorite status',
						routing: {
							send: {
								type: 'query',
								property: 'favorite',
							},
						},
					},
				],
			},
			// PROFILE ID FIELDS FOR VARIOUS OPERATIONS
			{
				displayName: 'Profile ID',
				name: 'profileId',
				type: 'string',
				required: true,
				default: '',
				description: 'The ID of the profile',
				displayOptions: {
					show: {
						resource: ['profile'],
						operation: ['getSingle', 'update', 'delete', 'updateAvatar'],
					},
				},
			},
			{
				displayName: 'Update Fields',
				name: 'updateFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['profile'],
						operation: ['update'],
					},
				},
				options: [
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
						description: 'Full name of the profile',
						placeholder: 'John Doe',
					},
					{
						displayName: 'Email',
						name: 'email',
						type: 'string',
						default: '',
						description: 'Email address (must be valid email format)',
						placeholder: 'john@example.com',
					},
					{
						displayName: 'Phone',
						name: 'phone',
						type: 'string',
						default: '',
						description: 'Phone number (digits only, automatically formatted)',
						placeholder: '1234567890',
					},
					{
						displayName: 'Address',
						name: 'address',
						type: 'string',
						default: '',
						description: 'Physical address',
						placeholder: '123 Main St, City, State',
					},
					{
						displayName: 'Notes',
						name: 'notes',
						type: 'string',
						default: '',
						description: 'Additional notes about the profile',
						placeholder: 'VIP member',
					},
					{
						displayName: 'Favorite',
						name: 'favorite',
						type: 'boolean',
						default: false,
						description: 'Whether to mark profile as favorite',
					},
					{
						displayName: 'Check-in Code',
						name: 'checkInCode',
						type: 'string',
						default: '',
						description: 'Unique alphanumeric check-in code',
						placeholder: 'JD001',
					},
					{
						displayName: 'Custom Fields',
						name: 'customFields',
						type: 'fixedCollection',
						default: {},
						description: 'Custom field values',
						typeOptions: {
							multipleValues: true,
						},
						options: [
							{
								displayName: 'Custom Field',
								name: 'customField',
								values: [
									{
										displayName: 'Field Name',
										name: 'name',
										type: 'string',
										default: '',
										description: 'Name of the custom field',
										placeholder: 'employeeId',
									},
									{
										displayName: 'Field Type',
										name: 'type',
										type: 'options',
										default: 'string',
										description: 'Type of the custom field value',
										options: [
											{
												name: 'String',
												value: 'string',
											},
											{
												name: 'Number',
												value: 'number',
											},
											{
												name: 'Boolean',
												value: 'boolean',
											},
											{
												name: 'Date',
												value: 'date',
											},
											{
												name: 'Array',
												value: 'array',
											},
										],
									},
									{
										displayName: 'Field Value',
										name: 'value',
										type: 'string',
										default: '',
										description: 'Value of the custom field',
										placeholder: 'EMP001',
									},
								],
							},
						],
					},
				],
			},
			// CREATE PROFILE FIELDS
			{
				displayName: 'Profile Name',
				name: 'profileName',
				type: 'string',
				required: true,
				default: '',
				description: 'Name of the profile',
				displayOptions: {
					show: {
						resource: ['profile'],
						operation: ['create'],
					},
				},
			},
			{
				displayName: 'Create Fields',
				name: 'createFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['profile'],
						operation: ['create'],
					},
				},
				options: [
					{
						displayName: 'Email',
						name: 'email',
						type: 'string',
						default: '',
						description: 'Email address (must be valid email format)',
						placeholder: 'john@example.com',
					},
					{
						displayName: 'Phone',
						name: 'phone',
						type: 'string',
						default: '',
						description: 'Phone number (digits only, automatically formatted)',
						placeholder: '1234567890',
					},
					{
						displayName: 'Address',
						name: 'address',
						type: 'string',
						default: '',
						description: 'Physical address',
						placeholder: '123 Main St, City, State',
					},
					{
						displayName: 'Notes',
						name: 'notes',
						type: 'string',
						default: '',
						description: 'Additional notes about the profile',
						placeholder: 'VIP member',
					},
					{
						displayName: 'Favorite',
						name: 'favorite',
						type: 'boolean',
						default: false,
						description: 'Whether to mark profile as favorite',
					},
					{
						displayName: 'Check-in Code',
						name: 'checkInCode',
						type: 'string',
						default: '',
						description: 'Unique alphanumeric check-in code',
						placeholder: 'JD001',
					},
					{
						displayName: 'Allow Duplicate',
						name: 'allowDuplicate',
						type: 'boolean',
						default: false,
						description: 'Whether to allow duplicate profiles',
					},
					{
						displayName: 'Duplicate Phone Allowed',
						name: 'duplicatePhoneAllowed',
						type: 'boolean',
						default: false,
						description: 'Whether to allow duplicate phone numbers',
					},
					{
						displayName: 'Send Confirmation Email',
						name: 'enableSendConfirmationEmail',
						type: 'boolean',
						default: false,
						description: 'Whether to send confirmation email after creation',
					},
					{
						displayName: 'Time Zone',
						name: 'timeZone',
						type: 'string',
						default: '',
						description: 'Timezone identifier',
						placeholder: 'America/Chicago',
					},
					{
						displayName: 'Source',
						name: 'source',
						type: 'string',
						default: '',
						description: 'Creation source',
						placeholder: 'API',
					},
					{
						displayName: 'Custom Fields',
						name: 'customFields',
						type: 'fixedCollection',
						default: {},
						description: 'Custom field values',
						typeOptions: {
							multipleValues: true,
						},
						options: [
							{
								displayName: 'Custom Field',
								name: 'customField',
								values: [
									{
										displayName: 'Field Name',
										name: 'name',
										type: 'string',
										default: '',
										description: 'Name of the custom field',
										placeholder: 'employeeId',
									},
									{
										displayName: 'Field Type',
										name: 'type',
										type: 'options',
										default: 'string',
										description: 'Type of the custom field value',
										options: [
											{
												name: 'String',
												value: 'string',
											},
											{
												name: 'Number',
												value: 'number',
											},
											{
												name: 'Boolean',
												value: 'boolean',
											},
											{
												name: 'Date',
												value: 'date',
											},
											{
												name: 'Array',
												value: 'array',
											},
										],
									},
									{
										displayName: 'Field Value',
										name: 'value',
										type: 'string',
										default: '',
										description: 'Value of the custom field',
										placeholder: 'EMP001',
									},
								],
							},
						],
					},
				],
			},
			// DELETE MULTIPLE PROFILES FIELDS
			{
				displayName: 'Profile IDs',
				name: 'profileIds',
				type: 'string',
				required: true,
				default: '',
				description: 'Comma-separated profile IDs to delete',
				displayOptions: {
					show: {
						resource: ['profile'],
						operation: ['deleteMultiple'],
					},
				},
			},
			// UPDATE AVATAR FIELDS
			{
				displayName: 'Avatar File',
				name: 'avatarFile',
				type: 'string',
				default: '',
				description:
					'Avatar image file (base64 encoded or binary data property from previous node)',
				displayOptions: {
					show: {
						resource: ['profile'],
						operation: ['updateAvatar'],
					},
				},
			},
			// FIND BY CHECK-IN CODE FIELDS
			{
				displayName: 'Check-in Code',
				name: 'checkInCode',
				type: 'string',
				required: true,
				default: '',
				description: 'The check-in code to search for',
				displayOptions: {
					show: {
						resource: ['profile'],
						operation: ['findByCheckInCode'],
					},
				},
			},

			// PASSPORTS OPERATIONS
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['passports'],
					},
				},
				options: [
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Fetch many passes for a profile or participant',
						action: 'Get many passes for a profile or participant',
					},
					{
						name: 'Get by Participant',
						value: 'getByParticipant',
						description: 'Fetch passport for a specific participant (DEPRECATED)',
						action: 'Get passport for a specific participant',
					},
					{
						name: 'Get by Profile',
						value: 'getByProfile',
						description: 'Fetch passes for a specific profile (DEPRECATED)',
						action: 'Get passes for a specific profile',
					},
					{
						name: 'Get Groups',
						value: 'getGroups',
						description: 'Fetch all group passes',
						action: 'Get all group passes',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a group pass',
						action: 'Delete a group pass',
					},
					{
						name: 'Send',
						value: 'send',
						description: 'Send a passport via SMS or email',
						action: 'Send a passport via SMS or email',
					},
				],
				default: 'getAll',
			},
			// GET ALL PASSPORTS FIELDS
			{
				displayName: 'Profile ID',
				name: 'profileId',
				type: 'string',
				default: '',
				description: 'Profile ID to fetch passes for',
				displayOptions: {
					show: {
						resource: ['passports'],
						operation: ['getAll'],
					},
				},
			},
			{
				displayName: 'Participant ID',
				name: 'participantId',
				type: 'string',
				default: '',
				description: 'Participant ID to fetch passes for',
				displayOptions: {
					show: {
						resource: ['passports'],
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
						resource: ['passports'],
						operation: ['getAll'],
					},
				},
				options: [
					{
						displayName: 'Passport Type',
						name: 'passportType',
						type: 'string',
						default: '',
						description: 'Filter by passport type',
					},
					{
						displayName: 'Page',
						name: 'page',
						type: 'number',
						default: 0,
						description: 'Page number for pagination',
					},
					{
						displayName: 'Page Size',
						name: 'pageSize',
						type: 'number',
						default: 50,
						description: 'Number of results per page',
					},
				],
			},
			// GET BY PARTICIPANT FIELDS
			{
				displayName: 'Participant ID',
				name: 'participantId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['passports'],
						operation: ['getByParticipant'],
					},
				},
			},
			// GET BY PROFILE FIELDS
			{
				displayName: 'Profile ID',
				name: 'profileId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['passports'],
						operation: ['getByProfile'],
					},
				},
			},
			{
				displayName: 'Custom Barcode',
				name: 'customBarcode',
				type: 'boolean',
				default: false,
				description: 'Whether to include custom barcode',
				displayOptions: {
					show: {
						resource: ['passports'],
						operation: ['getByProfile'],
					},
				},
			},
			// GET GROUPS FIELDS
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 50,
				description: 'Max number of results to return',
				displayOptions: {
					show: {
						resource: ['passports'],
						operation: ['getGroups'],
					},
				},
			},
			// DELETE PASSPORT FIELDS
			{
				displayName: 'Passport ID',
				name: 'passportId',
				type: 'string',
				required: true,
				default: '',
				description: 'Passport ID to delete',
				displayOptions: {
					show: {
						resource: ['passports'],
						operation: ['delete'],
					},
				},
			},
			// SEND PASSPORT FIELDS
			{
				displayName: 'Passport ID',
				name: 'passportId',
				type: 'string',
				required: true,
				default: '',
				description: 'Passport ID to send',
				displayOptions: {
					show: {
						resource: ['passports'],
						operation: ['send'],
					},
				},
			},
			{
				displayName: 'Channel',
				name: 'channel',
				type: 'options',
				required: true,
				default: 'sms',
				description: 'Delivery channel',
				options: [
					{
						name: 'SMS',
						value: 'sms',
					},
					{
						name: 'Email',
						value: 'email',
					},
				],
				displayOptions: {
					show: {
						resource: ['passports'],
						operation: ['send'],
					},
				},
			},
			{
				displayName: 'Destination',
				name: 'destination',
				type: 'string',
				required: true,
				default: '',
				description: 'Phone number or email address',
				placeholder: 'john@example.com or +1234567890',
				displayOptions: {
					show: {
						resource: ['passports'],
						operation: ['send'],
					},
				},
			},

			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['punchPasses'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new punch passport',
						action: 'Create a new punch passport',
					},
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get many punch passes for a profile',
						action: 'Get many punch passes for a profile',
					},
					{
						name: 'Get Single',
						value: 'getSingle',
						description: 'Get a single punch pass with check-ins',
						action: 'Get a single punch pass with check ins',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a punch passport',
						action: 'Update a punch passport',
					},
					{
						name: 'Redeem',
						value: 'redeem',
						description: 'Redeem a punch passport by associating a check-in',
						action: 'Redeem a punch passport by associating a check in',
					},
				],
				default: 'getAll',
			},
			// CREATE PUNCH PASS FIELDS
			{
				displayName: 'Profile ID',
				name: 'profileId',
				type: 'string',
				required: true,
				default: '',
				description: 'Profile ID to create punch pass for',
				displayOptions: {
					show: {
						resource: ['punchPasses'],
						operation: ['create', 'getAll'],
					},
				},
			},
			{
				displayName: 'Starts At',
				name: 'startsAt',
				type: 'dateTime',
				required: true,
				default: '',
				description: 'Start date and time',
				displayOptions: {
					show: {
						resource: ['punchPasses'],
						operation: ['create'],
					},
				},
			},
			{
				displayName: 'Create Fields',
				name: 'createFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['punchPasses'],
						operation: ['create'],
					},
				},
				options: [
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
						description: 'Name for the punch pass',
						placeholder: 'Coffee Loyalty Card',
					},
					{
						displayName: 'Expires At',
						name: 'expiresAt',
						type: 'dateTime',
						default: '',
						description: 'Expiration date and time',
					},
					{
						displayName: 'Check Ins Limit',
						name: 'checkInsLimit',
						type: 'number',
						default: 10,
						description: 'Maximum number of check-ins allowed (positive integer)',
						typeOptions: {
							minValue: 1,
						},
					},
				],
			},
			{
				displayName: 'Passport ID',
				name: 'passportId',
				type: 'string',
				required: true,
				default: '',
				description: 'The punch pass ID',
				displayOptions: {
					show: {
						resource: ['punchPasses'],
						operation: ['getSingle', 'update', 'redeem'],
					},
				},
			},
			// UPDATE PUNCH PASS FIELDS
			{
				displayName: 'Update Fields',
				name: 'updateFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['punchPasses'],
						operation: ['update'],
					},
				},
				options: [
					{
						displayName: 'Status',
						name: 'status',
						type: 'boolean',
						default: true,
						description: 'Whether the passport is active',
					},
					{
						displayName: 'Check Ins Limit',
						name: 'checkInsLimit',
						type: 'number',
						default: 10,
						description: 'New check-ins limit',
						typeOptions: {
							minValue: 1,
						},
					},
					{
						displayName: 'Check In IDs',
						name: 'checkInIds',
						type: 'string',
						default: '',
						description: 'Comma-separated check-in IDs to associate',
						placeholder: 'checkin123,checkin456',
					},
				],
			},
			// REDEEM PUNCH PASS FIELDS
			{
				displayName: 'Check In ID',
				name: 'checkInId',
				type: 'string',
				required: true,
				default: '',
				description: 'Check-in ID to associate with the passport',
				displayOptions: {
					show: {
						resource: ['punchPasses'],
						operation: ['redeem'],
					},
				},
			},
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				default: false,
				description: 'Whether to return all results or only up to a given limit',
				displayOptions: {
					show: {
						resource: ['punchPasses'],
						operation: ['getAll'],
					},
				},
			},
			{
				displayName: 'Page',
				name: 'page',
				type: 'number',
				default: 0,
				description: 'Page number to retrieve',
				typeOptions: {
					minValue: 0,
				},
				displayOptions: {
					show: {
						resource: ['punchPasses'],
						operation: ['getAll', 'getSingle'],
						returnAll: [false],
					},
				},
			},
			{
				displayName: 'Page Size',
				name: 'pageSize',
				type: 'number',
				default: 50,
				description: 'Number of items to retrieve per page',
				typeOptions: {
					minValue: 1,
					maxValue: 100,
				},
				displayOptions: {
					show: {
						resource: ['punchPasses'],
						operation: ['getAll', 'getSingle'],
						returnAll: [false],
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
						resource: ['punchPasses'],
						operation: ['getAll', 'getSingle'],
					},
				},
				options: [
					{
						displayName: 'Sort Field',
						name: 'sortField',
						type: 'string',
						default: '',
						description: 'Field to sort by',
						placeholder: 'name',
					},
					{
						displayName: 'Sort Direction',
						name: 'sortDirection',
						type: 'options',
						default: 'ascending',
						options: [
							{
								name: 'Ascending',
								value: 'ascending',
							},
							{
								name: 'Descending',
								value: 'descending',
							},
						],
					},
					{
						displayName: 'Search Text',
						name: 'searchText',
						type: 'string',
						default: '',
						description: 'Text to search for',
						placeholder: 'search term',
					},
					{
						displayName: 'Search Type',
						name: 'searchType',
						type: 'options',
						default: 'partial',
						description: 'Type of search to perform',
						options: [
							{
								name: 'Exact',
								value: 'exact',
							},
							{
								name: 'Exact (Ignore Case)',
								value: 'exactIgnoreCase',
							},
							{
								name: 'Partial',
								value: 'partial',
							},
						],
					},
					{
						displayName: 'Filter Field',
						name: 'filterField',
						type: 'string',
						default: '',
						description: 'Field to filter by',
						placeholder: 'status',
					},
					{
						displayName: 'Equal To',
						name: 'equalTo',
						type: 'string',
						default: '',
						description: 'Value to filter by (equals)',
						placeholder: 'active',
					},
					{
						displayName: 'Not Equal To',
						name: 'notEqualTo',
						type: 'string',
						default: '',
						description: 'Value to filter by (not equals)',
						placeholder: 'inactive',
					},
					{
						displayName: 'Greater Than',
						name: 'greaterThan',
						type: 'string',
						default: '',
						description: 'Value to filter by (greater than)',
						placeholder: '100',
					},
					{
						displayName: 'Less Than',
						name: 'lessThan',
						type: 'string',
						default: '',
						description: 'Value to filter by (less than)',
						placeholder: '500',
					},
					{
						displayName: 'Contains',
						name: 'contains',
						type: 'string',
						default: '',
						description: 'Value to filter by (contains)',
						placeholder: 'coffee',
					},
					{
						displayName: 'Greater Than Date',
						name: 'greaterThanDate',
						type: 'dateTime',
						default: '',
						description: 'Filter by date (greater than)',
					},
					{
						displayName: 'Less Than Date',
						name: 'lessThanDate',
						type: 'dateTime',
						default: '',
						description: 'Filter by date (less than)',
					},
				],
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['participants'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create participant(s)',
						action: 'Create participant s',
					},
					{
						name: 'Get Single',
						value: 'getSingle',
						description: 'Get a single participant',
						action: 'Get a single participant',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a participant',
						action: 'Update a participant',
					},
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get many participants',
						action: 'Get many participants',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a participant',
						action: 'Delete a participant',
					},
					{
						name: 'Check In',
						value: 'checkIn',
						description: 'Check in a participant',
						action: 'Check in a participant',
					},
					{
						name: 'Check Out',
						value: 'checkOut',
						description: 'Check out a participant',
						action: 'Check out a participant',
					},
					{
						name: 'Undo Check In',
						value: 'undoCheckIn',
						description: 'Undo check-in for a participant',
						action: 'Undo check in for a participant',
					},
					{
						name: 'Undo Check Out',
						value: 'undoCheckOut',
						description: 'Undo check-out for a participant',
						action: 'Undo check out for a participant',
					},
				],
				default: 'getAll',
			},
			// CREATE PARTICIPANT FIELDS
			{
				displayName: 'List ID',
				name: 'listId',
				type: 'string',
				default: '',
				description: 'Single list ID (required if not using List IDs)',
				displayOptions: {
					show: {
						resource: ['participants'],
						operation: ['create'],
					},
				},
			},
			{
				displayName: 'List IDs',
				name: 'listIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list IDs (alternative to List ID)',
				displayOptions: {
					show: {
						resource: ['participants'],
						operation: ['create'],
					},
				},
			},
			{
				displayName: 'Profile ID',
				name: 'profileId',
				type: 'string',
				default: '',
				description: 'Single profile ID (required if not using Profile IDs or Add All Profiles)',
				displayOptions: {
					show: {
						resource: ['participants'],
						operation: ['create'],
					},
				},
			},
			{
				displayName: 'Profile IDs',
				name: 'profileIds',
				type: 'string',
				default: '',
				description: 'Comma-separated profile IDs (alternative to Profile ID)',
				displayOptions: {
					show: {
						resource: ['participants'],
						operation: ['create'],
					},
				},
			},
			{
				displayName: 'Add All Profiles',
				name: 'addAllProfile',
				type: 'boolean',
				default: false,
				description: 'Whether to add all profiles (alternative to specifying profile IDs)',
				displayOptions: {
					show: {
						resource: ['participants'],
						operation: ['create'],
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
						resource: ['participants'],
						operation: ['create'],
					},
				},
				options: [
					{
						displayName: 'Not Allow Duplicate',
						name: 'notAllowDuplicate',
						type: 'boolean',
						default: false,
						description: 'Whether to prevent duplicate participants',
					},
					{
						displayName: 'Override Parent Auto Add',
						name: 'overrideParentAutoAdd',
						type: 'boolean',
						default: false,
						description: 'Whether to override parent auto-add setting',
					},
					{
						displayName: 'Search Text',
						name: 'searchText',
						type: 'string',
						default: '',
						description: 'Search text filter',
					},
					{
						displayName: 'Checked In',
						name: 'checkedIn',
						type: 'boolean',
						default: false,
						description: 'Whether participant is checked in',
					},
					{
						displayName: 'Checked Out',
						name: 'checkedOut',
						type: 'boolean',
						default: false,
						description: 'Whether participant is checked out',
					},
					{
						displayName: 'Check In Date',
						name: 'checkInDate',
						type: 'dateTime',
						default: '',
						description: 'Check-in date and time',
					},
					{
						displayName: 'Check Out Date',
						name: 'checkOutDate',
						type: 'dateTime',
						default: '',
						description: 'Check-out date and time',
					},
					{
						displayName: 'Check In Method',
						name: 'checkInMethod',
						type: 'options',
						default: 'TAP',
						description: 'Method used for check-in',
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
					},
					{
						displayName: 'Check Out Method',
						name: 'checkOutMethod',
						type: 'options',
						default: 'TAP',
						description: 'Method used for check-out',
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
					},
					{
						displayName: 'Check In Time Zone',
						name: 'checkInTimeZone',
						type: 'string',
						default: '',
						description: 'Time zone for check-in (e.g., America/Chicago)',
						placeholder: 'America/Chicago',
					},
					{
						displayName: 'Check Out Time Zone',
						name: 'checkOutTimeZone',
						type: 'string',
						default: '',
						description: 'Time zone for check-out (e.g., America/Chicago)',
						placeholder: 'America/Chicago',
					},
					{
						displayName: 'Check In Installation ID',
						name: 'checkInInstallationId',
						type: 'string',
						default: '',
						description: 'Installation ID for check-in',
					},
					{
						displayName: 'Check In Location',
						name: 'checkInLocation',
						type: 'fixedCollection',
						default: {},
						description: 'GPS coordinates for check-in',
						options: [
							{
								displayName: 'Coordinates',
								name: 'coordinates',
								values: [
									{
										displayName: 'Latitude',
										name: 'lat',
										type: 'number',
										default: 0,
										description: 'Latitude coordinate',
									},
									{
										displayName: 'Longitude',
										name: 'lng',
										type: 'number',
										default: 0,
										description: 'Longitude coordinate',
									},
								],
							},
						],
					},
					{
						displayName: 'Check Out Location',
						name: 'checkOutLocation',
						type: 'fixedCollection',
						default: {},
						description: 'GPS coordinates for check-out',
						options: [
							{
								displayName: 'Coordinates',
								name: 'coordinates',
								values: [
									{
										displayName: 'Latitude',
										name: 'lat',
										type: 'number',
										default: 0,
										description: 'Latitude coordinate',
									},
									{
										displayName: 'Longitude',
										name: 'lng',
										type: 'number',
										default: 0,
										description: 'Longitude coordinate',
									},
								],
							},
						],
					},
					{
						displayName: 'Check In IP Address',
						name: 'checkInIpAddress',
						type: 'string',
						default: '',
						description: 'IP address for check-in',
					},
					{
						displayName: 'Check In Notes',
						name: 'checkInNotes',
						type: 'string',
						default: '',
						description: 'Notes for check-in',
					},
					{
						displayName: 'Check Out Notes',
						name: 'checkOutNotes',
						type: 'string',
						default: '',
						description: 'Notes for check-out',
					},
					{
						displayName: 'Source',
						name: 'source',
						type: 'string',
						default: '',
						description: 'Source of the participant creation',
					},
				],
			},
			// GET SINGLE PARTICIPANT FIELDS
			{
				displayName: 'Participant ID',
				name: 'participantId',
				type: 'string',
				required: true,
				default: '',
				description: 'The ID of the participant',
				displayOptions: {
					show: {
						resource: ['participants'],
						operation: [
							'getSingle',
							'update',
							'delete',
							'checkIn',
							'checkOut',
							'undoCheckIn',
							'undoCheckOut',
						],
					},
				},
			},
			// UPDATE PARTICIPANT FIELDS
			{
				displayName: 'Update Fields',
				name: 'updateFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['participants'],
						operation: ['update'],
					},
				},
				options: [
					{
						displayName: 'Check In Date',
						name: 'checkInDate',
						type: 'dateTime',
						default: '',
						description: 'Check-in date and time',
					},
					{
						displayName: 'Check Out Date',
						name: 'checkOutDate',
						type: 'dateTime',
						default: '',
						description: 'Check-out date and time',
					},
					{
						displayName: 'Notes',
						name: 'notes',
						type: 'string',
						default: '',
						description: 'General notes',
					},
					{
						displayName: 'Check In Notes',
						name: 'checkInNotes',
						type: 'string',
						default: '',
						description: 'Check-in notes',
					},
					{
						displayName: 'Check Out Notes',
						name: 'checkOutNotes',
						type: 'string',
						default: '',
						description: 'Check-out notes',
					},
					{
						displayName: 'Check In Method',
						name: 'checkInMethod',
						type: 'string',
						default: '',
						description: 'Check-in method',
					},
					{
						displayName: 'Check Out Method',
						name: 'checkOutMethod',
						type: 'string',
						default: '',
						description: 'Check-out method',
					},
					{
						displayName: 'Location',
						name: 'location',
						type: 'fixedCollection',
						default: {},
						description: 'GPS coordinates',
						options: [
							{
								displayName: 'Coordinates',
								name: 'coordinates',
								values: [
									{
										displayName: 'Latitude',
										name: 'lat',
										type: 'number',
										default: 0,
										description: 'Latitude coordinate',
									},
									{
										displayName: 'Longitude',
										name: 'lng',
										type: 'number',
										default: 0,
										description: 'Longitude coordinate',
									},
								],
							},
						],
					},
					{
						displayName: 'Time Zone',
						name: 'timeZone',
						type: 'string',
						default: '',
						placeholder: 'America/Chicago',
					},
					{
						displayName: 'Installation ID',
						name: 'installationId',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Source',
						name: 'source',
						type: 'string',
						default: '',
						description: 'Source of the update',
					},
				],
			},
			// GET ALL PARTICIPANTS FIELDS
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				default: false,
				description: 'Whether to return all results or only up to a given limit',
				displayOptions: {
					show: {
						resource: ['participants'],
						operation: ['getAll'],
					},
				},
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 50,
				description: 'Max number of results to return',
				typeOptions: {
					minValue: 1,
				},
				displayOptions: {
					show: {
						resource: ['participants'],
						operation: ['getAll'],
						returnAll: [false],
					},
				},
			},
			{
				displayName: 'Skip',
				name: 'skip',
				type: 'number',
				default: 0,
				description: 'Number of participants to skip (for pagination)',
				typeOptions: {
					minValue: 0,
				},
				displayOptions: {
					show: {
						resource: ['participants'],
						operation: ['getAll'],
						returnAll: [false],
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
						resource: ['participants'],
						operation: ['getAll'],
					},
				},
				options: [
					{
						displayName: 'List ID',
						name: 'listId',
						type: 'string',
						default: '',
						description: 'Single list ID',
					},
					{
						displayName: 'List IDs',
						name: 'listIds',
						type: 'string',
						default: '',
						description: 'Comma-separated list IDs',
					},
					{
						displayName: 'Profile ID',
						name: 'profileId',
						type: 'string',
						default: '',
						description: 'Single profile ID',
					},
					{
						displayName: 'Profile IDs',
						name: 'profileIds',
						type: 'string',
						default: '',
						description: 'Comma-separated profile IDs',
					},
					{
						displayName: 'Checked In',
						name: 'checkedIn',
						type: 'boolean',
						default: false,
						description: 'Whether to filter by check-in status',
					},
					{
						displayName: 'Checked Out',
						name: 'checkedOut',
						type: 'boolean',
						default: false,
						description: 'Whether to filter by check-out status',
					},
					{
						displayName: 'Check-Ins After Date',
						name: 'gtCheckInDate',
						type: 'dateTime',
						default: '',
						description: 'Filter check-ins after this date',
					},
					{
						displayName: 'Check-Ins Before Date',
						name: 'ltCheckInDate',
						type: 'dateTime',
						default: '',
						description: 'Filter check-ins before this date',
					},
					{
						displayName: 'Check-Outs After Date',
						name: 'gtCheckOutDate',
						type: 'dateTime',
						default: '',
						description: 'Filter check-outs after this date',
					},
					{
						displayName: 'Check-Outs Before Date',
						name: 'ltCheckOutDate',
						type: 'dateTime',
						default: '',
						description: 'Filter check-outs before this date',
					},
					{
						displayName: 'IP Address',
						name: 'ipAddress',
						type: 'string',
						default: '',
						description: 'Filter by IP address',
					},
					{
						displayName: 'Search List Query',
						name: 'searchListQuery',
						type: 'string',
						default: '',
						description: 'Search by list name',
					},
					{
						displayName: 'Sort Field',
						name: 'sortField',
						type: 'options',
						default: 'checkInDate',
						description: 'Field to sort by',
						options: [
							{ name: 'Check In Date', value: 'checkInDate' },
							{ name: 'Check Out Date', value: 'checkOutDate' },
							{ name: 'Created At', value: 'createdAt' },
							{ name: 'Updated At', value: 'updatedAt' },
							{ name: 'Name', value: 'name' },
							{ name: 'Email', value: 'email' },
							{ name: 'Phone', value: 'phone' },
							{ name: 'Check In Code', value: 'checkInCode' },
							{ name: 'Last Name', value: 'lastName' },
							{ name: 'Favorite', value: 'favorite' },
						],
					},
					{
						displayName: 'Sort Order',
						name: 'sortOrder',
						type: 'options',
						default: 'asc',
						description: 'Sort direction',
						options: [
							{ name: 'Ascending', value: 'asc' },
							{ name: 'Descending', value: 'desc' },
						],
					},
				],
			},
			// DELETE PARTICIPANT FIELDS
			{
				displayName: 'List ID',
				name: 'listId',
				type: 'string',
				default: '',
				description: 'Optional list ID for targeted removal',
				displayOptions: {
					show: {
						resource: ['participants'],
						operation: ['delete'],
					},
				},
			},
			// LISTS OPERATIONS
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['lists'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new list',
						action: 'Create a new list',
					},
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get many lists',
						action: 'Get many lists',
					},
					{
						name: 'Get Single',
						value: 'getSingle',
						description: 'Get a single list',
						action: 'Get a single list',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a list',
						action: 'Update a list',
					},
					{
						name: 'Delete Single',
						value: 'deleteSingle',
						description: 'Delete a single list',
						action: 'Delete a single list',
					},
					{
						name: 'Delete Multiple',
						value: 'deleteMultiple',
						description: 'Delete multiple lists',
						action: 'Delete multiple lists',
					},
					{
						name: 'Get List Survey Data',
						value: 'getListSurveyData',
						description: 'Get survey data for a list',
						action: 'Get survey data for a list',
					},
				],
				default: 'getAll',
			},
			// CHECK IN/OUT FIELDS
			{
				displayName: 'Check-in/Check-Out Fields',
				name: 'checkFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['participants'],
						operation: ['checkIn', 'checkOut'],
					},
				},
				options: [
					{
						displayName: 'List ID',
						name: 'listId',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Profile ID',
						name: 'profileId',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Method',
						name: 'method',
						type: 'options',
						default: 'MANUAL',
						description: 'Check-in/check-out method',
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
					},
					{
						displayName: 'Source',
						name: 'source',
						type: 'string',
						default: '',
						description: 'Source of the check-in/check-out',
					},
					{
						displayName: 'Location',
						name: 'location',
						type: 'fixedCollection',
						default: {},
						description: 'GPS coordinates',
						options: [
							{
								displayName: 'Coordinates',
								name: 'coordinates',
								values: [
									{
										displayName: 'Latitude',
										name: 'lat',
										type: 'number',
										default: 0,
										description: 'Latitude coordinate',
									},
									{
										displayName: 'Longitude',
										name: 'lng',
										type: 'number',
										default: 0,
										description: 'Longitude coordinate',
									},
								],
							},
						],
					},
					{
						displayName: 'Time Zone',
						name: 'timeZone',
						type: 'string',
						default: '',
						placeholder: 'America/Chicago',
					},
					{
						displayName: 'Installation ID',
						name: 'installationId',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Send Visitor Alert',
						name: 'sendVisitorAlert',
						type: 'boolean',
						default: false,
					},
				],
			},
			// CREATE LIST FIELDS
			{
				displayName: 'List Name',
				name: 'listName',
				type: 'string',
				required: true,
				default: '',
				description: 'Name of the list',
				displayOptions: {
					show: {
						resource: ['lists'],
						operation: ['create'],
					},
				},
			},
			{
				displayName: 'List Date',
				name: 'listDate',
				type: 'dateTime',
				required: true,
				default: '',
				description: 'Date of the list',
				displayOptions: {
					show: {
						resource: ['lists'],
						operation: ['create'],
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
						resource: ['lists'],
						operation: ['create'],
					},
				},
				options: [
					{
						displayName: 'Description',
						name: 'description',
						type: 'string',
						default: '',
						description: 'List description',
					},
					{
						displayName: 'Notes',
						name: 'notes',
						type: 'string',
						default: '',
						description: 'List notes',
					},
					{
						displayName: 'End Date',
						name: 'endDate',
						type: 'dateTime',
						default: '',
						description: 'End date of the list',
					},
					{
						displayName: 'Time Zone',
						name: 'timeZone',
						type: 'string',
						default: '',
						placeholder: 'America/Chicago',
					},
					{
						displayName: 'Auto Create Child List',
						name: 'autoCreateChildList',
						type: 'boolean',
						default: false,
						description: 'Whether to auto create child lists for recurring lists',
					},
					{
						displayName: 'Check Out Enabled',
						name: 'checkOutEnabled',
						type: 'boolean',
						default: false,
						description: 'Whether to enable check-out for this list',
					},
					{
						displayName: 'Check In Option',
						name: 'checkInOption',
						type: 'options',
						default: 'manual',
						description: 'Check-in method option',
						options: [
							{ name: 'TAP', value: 'tap' },
							{ name: 'QR', value: 'qr' },
							{ name: 'Manual', value: 'manual' },
							{ name: 'Kiosk', value: 'kiosk' },
							{ name: 'SMS', value: 'sms' },
							{ name: 'Email', value: 'email' },
							{ name: 'Voice', value: 'voice' },
							{ name: 'Browser', value: 'browser' },
							{ name: 'Mobile App', value: 'mobile_app' },
						],
					},
					{
						displayName: 'Check Out Option',
						name: 'checkOutOption',
						type: 'options',
						default: 'manual',
						description: 'Check-out method option',
						options: [
							{ name: 'TAP', value: 'tap' },
							{ name: 'QR', value: 'qr' },
							{ name: 'Manual', value: 'manual' },
							{ name: 'Kiosk', value: 'kiosk' },
							{ name: 'SMS', value: 'sms' },
							{ name: 'Email', value: 'email' },
							{ name: 'Voice', value: 'voice' },
							{ name: 'Browser', value: 'browser' },
							{ name: 'Mobile App', value: 'mobile_app' },
						],
					},
					{
						displayName: 'Is Open Registration',
						name: 'isOpenRegistration',
						type: 'boolean',
						default: false,
						description: 'Whether to enable open registration',
					},
					{
						displayName: 'Open Registration Setting',
						name: 'openRegistrationSetting',
						type: 'options',
						default: 'closed',
						description: 'Open registration type',
						options: [
							{ name: 'Open', value: 'open' },
							{ name: 'Closed', value: 'closed' },
							{ name: 'Profiles', value: 'profiles' },
						],
					},
					{
						displayName: 'Source',
						name: 'source',
						type: 'string',
						default: '',
						description: 'Source of the list creation',
					},
					{
						displayName: 'Parent ID',
						name: 'parentId',
						type: 'string',
						default: '',
						description: 'Parent list ID for child lists',
					},
					{
						displayName: 'Schedule',
						name: 'schedule',
						type: 'fixedCollection',
						default: {},
						description: 'Recurring schedule for the list',
						options: [
							{
								displayName: 'Days',
								name: 'days',
								values: [
									{
										displayName: 'Friday',
										name: 'friday',
										type: 'boolean',
										default: false,
									},
									{
										displayName: 'Monday',
										name: 'monday',
										type: 'boolean',
										default: false,
									},
									{
										displayName: 'Saturday',
										name: 'saturday',
										type: 'boolean',
										default: false,
									},
									{
										displayName: 'Sunday',
										name: 'sunday',
										type: 'boolean',
										default: false,
									},
									{
										displayName: 'Thursday',
										name: 'thursday',
										type: 'boolean',
										default: false,
									},
									{
										displayName: 'Tuesday',
										name: 'tuesday',
										type: 'boolean',
										default: false,
									},
									{
										displayName: 'Wednesday',
										name: 'wednesday',
										type: 'boolean',
										default: false,
									},
								],
							},
						],
					},
				],
			},
			// GET ALL LISTS FIELDS
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				default: false,
				description: 'Whether to return all results or only up to a given limit',
				displayOptions: {
					show: {
						resource: ['lists'],
						operation: ['getAll'],
					},
				},
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 50,
				description: 'Max number of results to return',
				typeOptions: {
					minValue: 1,
				},
				displayOptions: {
					show: {
						resource: ['lists'],
						operation: ['getAll'],
						returnAll: [false],
					},
				},
			},
			{
				displayName: 'Skip',
				name: 'skip',
				type: 'number',
				default: 0,
				description: 'Number of lists to skip (for pagination)',
				typeOptions: {
					minValue: 0,
				},
				displayOptions: {
					show: {
						resource: ['lists'],
						operation: ['getAll'],
						returnAll: [false],
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
						resource: ['lists'],
						operation: ['getAll'],
					},
				},
				options: [
					{
						displayName: 'Sort Field',
						name: 'sortField',
						type: 'options',
						default: 'date',
						description: 'Field to sort by',
						options: [
							{ name: 'Date', value: 'date' },
							{ name: 'Name', value: 'name' },
							{ name: 'Created At', value: 'createdAt' },
							{ name: 'Updated At', value: 'updatedAt' },
							{ name: 'Size', value: 'size' },
						],
					},
					{
						displayName: 'Sort Direction',
						name: 'sortDirection',
						type: 'options',
						default: 'descending',
						options: [
							{ name: 'Ascending', value: 'ascending' },
							{ name: 'Descending', value: 'descending' },
						],
					},
					{
						displayName: 'Search Query',
						name: 'searchQuery',
						type: 'string',
						default: '',
						description: 'Search by list name',
					},
					{
						displayName: 'List Type',
						name: 'listType',
						type: 'options',
						default: 'all',
						description: 'Filter by list type',
						options: [
							{ name: 'All', value: 'all' },
							{ name: 'Recurring', value: 'recurring' },
							{ name: 'Children', value: 'children' },
							{ name: 'Individual', value: 'individual' },
							{ name: 'Root', value: 'root' },
						],
					},
					{
						displayName: 'Archived',
						name: 'archived',
						type: 'boolean',
						default: false,
						description: 'Whether to filter by archived status',
					},
					{
						displayName: 'Parent List ID',
						name: 'parentListId',
						type: 'string',
						default: '',
						description: 'Filter by parent list ID',
					},
					{
						displayName: 'Is Open Registration Enabled',
						name: 'isOpenRegistrationEnabled',
						type: 'boolean',
						default: false,
						description: 'Whether to filter by open registration status',
					},
					{
						displayName: 'Start Date',
						name: 'startDate',
						type: 'dateTime',
						default: '',
						description: 'Filter lists after this date',
					},
					{
						displayName: 'End Date',
						name: 'endDate',
						type: 'dateTime',
						default: '',
						description: 'Filter lists before this date',
					},
				],
			},
			// GET SINGLE LIST FIELDS
			{
				displayName: 'List ID',
				name: 'listId',
				type: 'string',
				required: true,
				default: '',
				description: 'The ID of the list',
				displayOptions: {
					show: {
						resource: ['lists'],
						operation: ['getSingle', 'update', 'deleteSingle', 'getListSurveyData'],
					},
				},
			},
			// UPDATE LIST FIELDS
			{
				displayName: 'Update Fields',
				name: 'updateFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['lists'],
						operation: ['update'],
					},
				},
				options: [
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
						description: 'List name',
					},
					{
						displayName: 'Description',
						name: 'description',
						type: 'string',
						default: '',
						description: 'List description',
					},
					{
						displayName: 'Date',
						name: 'date',
						type: 'dateTime',
						default: '',
						description: 'List date',
					},
					{
						displayName: 'End Date',
						name: 'endDate',
						type: 'dateTime',
						default: '',
					},
					{
						displayName: 'Time Zone',
						name: 'timeZone',
						type: 'string',
						default: '',
						placeholder: 'America/Chicago',
					},
					{
						displayName: 'Auto Create Child List',
						name: 'autoCreateChildList',
						type: 'boolean',
						default: false,
						description: 'Whether to auto create child lists',
					},
					{
						displayName: 'Check In Option',
						name: 'checkInOption',
						type: 'options',
						default: 'manual',
						description: 'Check-in method option',
						options: [
							{ name: 'TAP', value: 'tap' },
							{ name: 'QR', value: 'qr' },
							{ name: 'Manual', value: 'manual' },
							{ name: 'Kiosk', value: 'kiosk' },
							{ name: 'SMS', value: 'sms' },
							{ name: 'Email', value: 'email' },
							{ name: 'Voice', value: 'voice' },
							{ name: 'Browser', value: 'browser' },
							{ name: 'Mobile App', value: 'mobile_app' },
						],
					},
					{
						displayName: 'Check Out Option',
						name: 'checkOutOption',
						type: 'options',
						default: 'manual',
						description: 'Check-out method option',
						options: [
							{ name: 'TAP', value: 'tap' },
							{ name: 'QR', value: 'qr' },
							{ name: 'Manual', value: 'manual' },
							{ name: 'Kiosk', value: 'kiosk' },
							{ name: 'SMS', value: 'sms' },
							{ name: 'Email', value: 'email' },
							{ name: 'Voice', value: 'voice' },
							{ name: 'Browser', value: 'browser' },
							{ name: 'Mobile App', value: 'mobile_app' },
						],
					},
					{
						displayName: 'Check Out Enabled',
						name: 'checkOutEnabled',
						type: 'boolean',
						default: false,
						description: 'Whether to enable check-out',
					},
					{
						displayName: 'Is Open Registration',
						name: 'isOpenRegistration',
						type: 'boolean',
						default: false,
						description: 'Whether to enable open registration',
					},
					{
						displayName: 'Open Registration Setting',
						name: 'openRegistrationSetting',
						type: 'options',
						default: 'closed',
						description: 'Open registration type',
						options: [
							{ name: 'Open', value: 'open' },
							{ name: 'Closed', value: 'closed' },
							{ name: 'Profiles', value: 'profiles' },
						],
					},
					{
						displayName: 'Source',
						name: 'source',
						type: 'string',
						default: '',
						description: 'Source of the update',
					},
					{
						displayName: 'Schedule',
						name: 'schedule',
						type: 'fixedCollection',
						default: {},
						description: 'Recurring schedule for the list',
						options: [
							{
								displayName: 'Days',
								name: 'days',
								values: [
									{
										displayName: 'Friday',
										name: 'friday',
										type: 'boolean',
										default: false,
									},
									{
										displayName: 'Monday',
										name: 'monday',
										type: 'boolean',
										default: false,
									},
									{
										displayName: 'Saturday',
										name: 'saturday',
										type: 'boolean',
										default: false,
									},
									{
										displayName: 'Sunday',
										name: 'sunday',
										type: 'boolean',
										default: false,
									},
									{
										displayName: 'Thursday',
										name: 'thursday',
										type: 'boolean',
										default: false,
									},
									{
										displayName: 'Tuesday',
										name: 'tuesday',
										type: 'boolean',
										default: false,
									},
									{
										displayName: 'Wednesday',
										name: 'wednesday',
										type: 'boolean',
										default: false,
									},
								],
							},
						],
					},
				],
			},
			// DELETE MULTIPLE LISTS FIELDS
			{
				displayName: 'List IDs',
				name: 'listIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list IDs to delete',
				displayOptions: {
					show: {
						resource: ['lists'],
						operation: ['deleteMultiple'],
					},
				},
			},
			{
				displayName: 'Delete All',
				name: 'deleteAll',
				type: 'boolean',
				default: false,
				description: 'Whether to delete all lists for the organization',
				displayOptions: {
					show: {
						resource: ['lists'],
						operation: ['deleteMultiple'],
					},
				},
			},

			// GET LIST SURVEY DATA FIELDS
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['lists'],
						operation: ['getListSurveyData'],
					},
				},
				options: [
					{
						displayName: 'Profile ID',
						name: 'profileId',
						type: 'string',
						default: '',
						description: 'Template survey data for specific profile',
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

						if (returnAll) {
							// Fetch all profiles by paginating through all pages
							let allProfiles: any[] = [];
							let currentPage = 0;
							let hasMoreData = true;
							const pageSize = 50; // Use reasonable default for pagination

							while (hasMoreData) {
								const additionalFields = this.getNodeParameter('additionalFields', i) as {
									search?: string;
									sortBy?: string;
									sortOrder?: string;
									favorite?: boolean;
								};

								// Build query parameters, excluding empty values
								const queryParams: Record<string, any> = {
									page: currentPage,
									pageSize: pageSize,
								};

								if (additionalFields.search) queryParams.search = additionalFields.search;
								if (additionalFields.sortBy) queryParams.sortBy = additionalFields.sortBy;
								if (additionalFields.sortOrder) queryParams.sortOrder = additionalFields.sortOrder;
								if (additionalFields.favorite !== undefined)
									queryParams.favorite = additionalFields.favorite;

								const response = await this.helpers.httpRequestWithAuthentication.call(
									this,
									'onetap',
									{
										method: 'GET',
										url: 'https://api-beta.onetapcheckin.com/api/profiles',
										qs: queryParams,
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
							// Single page request
							const additionalFields = this.getNodeParameter('additionalFields', i) as {
								search?: string;
								sortBy?: string;
								sortOrder?: string;
								favorite?: boolean;
							};

							// Build query parameters, excluding empty values
							const queryParams: Record<string, any> = {
								page: this.getNodeParameter('page', i),
								pageSize: this.getNodeParameter('pageSize', i),
							};

							if (additionalFields.search) queryParams.search = additionalFields.search;
							if (additionalFields.sortBy) queryParams.sortBy = additionalFields.sortBy;
							if (additionalFields.sortOrder) queryParams.sortOrder = additionalFields.sortOrder;
							if (additionalFields.favorite !== undefined)
								queryParams.favorite = additionalFields.favorite;

							const response = await this.helpers.httpRequestWithAuthentication.call(
								this,
								'onetap',
								{
									method: 'GET',
									url: 'https://api-beta.onetapcheckin.com/api/profiles',
									qs: queryParams,
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
					} else if (operation === 'update') {
						const profileId = this.getNodeParameter('profileId', i) as string;
						const updateFields = this.getNodeParameter('updateFields', i) as Record<string, any>;

						// Build the request body, excluding empty values
						const body: Record<string, any> = {};

						// Add basic fields if they have values
						if (updateFields.name) body.name = updateFields.name;
						if (updateFields.email) body.email = updateFields.email;
						if (updateFields.phone) body.phone = updateFields.phone;
						if (updateFields.address) body.address = updateFields.address;
						if (updateFields.notes) body.notes = updateFields.notes;
						if (updateFields.checkInCode) body.checkInCode = updateFields.checkInCode;
						if (updateFields.favorite !== undefined) body.favorite = updateFields.favorite;

						// Process custom fields
						if (updateFields.customFields && updateFields.customFields.customField) {
							const customFieldsObj: Record<string, any> = {};
							const customFieldArray = updateFields.customFields.customField;

							for (const field of customFieldArray) {
								if (field.name && field.value !== undefined && field.value !== '') {
									let value = field.value;

									// Convert value based on type
									switch (field.type) {
										case 'number':
											value = parseFloat(field.value);
											break;
										case 'boolean':
											value =
												field.value === 'true' ||
												field.value === true ||
												field.value === '1' ||
												field.value === 1;
											break;
										case 'array':
											try {
												value = JSON.parse(field.value);
											} catch {
												value = field.value.split(',').map((item: string) => item.trim());
											}
											break;
										case 'date':
											value = Math.floor(new Date(field.value).getTime() / 1000);
											break;
										default:
											value = field.value; // string
									}

									customFieldsObj[field.name] = value;
								}
							}

							if (Object.keys(customFieldsObj).length > 0) {
								body.customFields = customFieldsObj;
							}
						}

						const response = await this.helpers.httpRequestWithAuthentication.call(this, 'onetap', {
							method: 'PUT',
							url: `https://api-beta.onetapcheckin.com/api/profiles/${profileId}`,
							body,
						});

						if (response.data) {
							returnData.push({
								json: response.data,
								pairedItem: i,
							});
						} else {
							returnData.push({
								json: response,
								pairedItem: i,
							});
						}
					} else if (operation === 'getSingle') {
						const profileId = this.getNodeParameter('profileId', i) as string;

						const response = await this.helpers.httpRequestWithAuthentication.call(this, 'onetap', {
							method: 'GET',
							url: `https://api-beta.onetapcheckin.com/api/profiles/${profileId}`,
						});

						returnData.push({
							json: response.data || response,
							pairedItem: i,
						});
					} else if (operation === 'create') {
						const profileName = this.getNodeParameter('profileName', i) as string;
						const createFields = this.getNodeParameter('createFields', i) as Record<string, any>;

						// Build the request body
						const body: Record<string, any> = {
							name: profileName,
						};

						// Add optional fields if they have values
						Object.entries(createFields).forEach(([key, value]) => {
							if (value !== undefined && value !== '' && value !== null) {
								if (key === 'customFields' && value.customField) {
									const customFieldsObj: Record<string, any> = {};
									const customFieldArray = value.customField;

									for (const field of customFieldArray) {
										if (field.name && field.value !== undefined && field.value !== '') {
											let fieldValue = field.value;

											// Convert value based on type
											switch (field.type) {
												case 'number':
													fieldValue = parseFloat(field.value);
													break;
												case 'boolean':
													fieldValue =
														field.value === 'true' ||
														field.value === true ||
														field.value === '1' ||
														field.value === 1;
													break;
												case 'array':
													try {
														fieldValue = JSON.parse(field.value);
													} catch {
														fieldValue = field.value.split(',').map((item: string) => item.trim());
													}
													break;
												case 'date':
													fieldValue = Math.floor(new Date(field.value).getTime() / 1000);
													break;
												default:
													fieldValue = field.value; // string
											}

											customFieldsObj[field.name] = fieldValue;
										}
									}

									if (Object.keys(customFieldsObj).length > 0) {
										body.customFields = customFieldsObj;
									}
								} else {
									body[key] = value;
								}
							}
						});

						const response = await this.helpers.httpRequestWithAuthentication.call(this, 'onetap', {
							method: 'POST',
							url: 'https://api-beta.onetapcheckin.com/api/profiles',
							body,
						});

						returnData.push({
							json: response.data || response,
							pairedItem: i,
						});
					} else if (operation === 'delete') {
						const profileId = this.getNodeParameter('profileId', i) as string;

						const response = await this.helpers.httpRequestWithAuthentication.call(this, 'onetap', {
							method: 'DELETE',
							url: `https://api-beta.onetapcheckin.com/api/profiles/${profileId}`,
						});

						returnData.push({
							json: response,
							pairedItem: i,
						});
					} else if (operation === 'deleteMultiple') {
						const profileIds = this.getNodeParameter('profileIds', i) as string;

						const body = {
							profileIds: profileIds.split(',').map((id) => id.trim()),
						};

						const response = await this.helpers.httpRequestWithAuthentication.call(this, 'onetap', {
							method: 'DELETE',
							url: 'https://api-beta.onetapcheckin.com/api/profiles',
							body,
						});

						returnData.push({
							json: response,
							pairedItem: i,
						});
					} else if (operation === 'updateAvatar') {
						const profileId = this.getNodeParameter('profileId', i) as string;
						const avatarFile = this.getNodeParameter('avatarFile', i) as string;

						// Note: This is a simplified implementation. In practice, you'd need to handle
						// multipart/form-data file uploads properly with the actual file content
						const response = await this.helpers.httpRequestWithAuthentication.call(this, 'onetap', {
							method: 'PUT',
							url: `https://api-beta.onetapcheckin.com/api/profiles/${profileId}/avatar`,
							headers: {
								'Content-Type': 'multipart/form-data',
							},
							body: {
								avatar: avatarFile,
							},
						});

						returnData.push({
							json: response.data || response,
							pairedItem: i,
						});
					} else if (operation === 'getCustomFields') {
						const response = await this.helpers.httpRequestWithAuthentication.call(this, 'onetap', {
							method: 'GET',
							url: 'https://api-beta.onetapcheckin.com/api/profiles/customFields',
						});

						returnData.push({
							json: response.data || response,
							pairedItem: i,
						});
					} else if (operation === 'findByCheckInCode') {
						const checkInCode = this.getNodeParameter('checkInCode', i) as string;

						const response = await this.helpers.httpRequestWithAuthentication.call(this, 'onetap', {
							method: 'GET',
							url: 'https://api-beta.onetapcheckin.com/api/profiles/checkInCode',
							qs: {
								checkInCode: checkInCode,
							},
						});

						returnData.push({
							json: response.data || response,
							pairedItem: i,
						});
					}
				} else if (resource === 'passports') {
					if (operation === 'getAll') {
						const profileId = this.getNodeParameter('profileId', i) as string;
						const participantId = this.getNodeParameter('participantId', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as {
							passportType?: string;
							page?: number;
							pageSize?: number;
						};

						// Build query parameters, excluding empty values
						const queryParams: Record<string, any> = {};

						if (profileId) queryParams.profileId = profileId;
						if (participantId) queryParams.participantId = participantId;
						if (additionalFields.passportType)
							queryParams.passportType = additionalFields.passportType;
						if (additionalFields.page !== undefined) queryParams.page = additionalFields.page;
						if (additionalFields.pageSize !== undefined)
							queryParams.pageSize = additionalFields.pageSize;

						const response = await this.helpers.httpRequestWithAuthentication.call(this, 'onetap', {
							method: 'GET',
							url: 'https://api-beta.onetapcheckin.com/api/passports',
							qs: queryParams,
						});

						if (response.data && Array.isArray(response.data)) {
							for (const passport of response.data) {
								returnData.push({
									json: passport,
									pairedItem: i,
								});
							}
						} else {
							returnData.push({
								json: response,
								pairedItem: i,
							});
						}
					} else if (operation === 'getByParticipant') {
						const participantId = this.getNodeParameter('participantId', i) as string;

						const response = await this.helpers.httpRequestWithAuthentication.call(this, 'onetap', {
							method: 'GET',
							url: `https://api-beta.onetapcheckin.com/api/passports/participants/${participantId}`,
						});

						returnData.push({
							json: response,
							pairedItem: i,
						});
					} else if (operation === 'getByProfile') {
						const profileId = this.getNodeParameter('profileId', i) as string;
						const customBarcode = this.getNodeParameter('customBarcode', i) as boolean;

						const queryParams: Record<string, any> = {};
						if (customBarcode) queryParams.customBarcode = '1';

						const response = await this.helpers.httpRequestWithAuthentication.call(this, 'onetap', {
							method: 'GET',
							url: `https://api-beta.onetapcheckin.com/api/passports/profiles/${profileId}`,
							qs: queryParams,
						});

						returnData.push({
							json: response,
							pairedItem: i,
						});
					} else if (operation === 'getGroups') {
						const limit = this.getNodeParameter('limit', i) as number;

						const queryParams: Record<string, any> = {};
						if (limit) queryParams.limit = limit;

						const response = await this.helpers.httpRequestWithAuthentication.call(this, 'onetap', {
							method: 'GET',
							url: 'https://api-beta.onetapcheckin.com/api/passports/groups',
							qs: queryParams,
						});

						if (response.data && Array.isArray(response.data)) {
							for (const passport of response.data) {
								returnData.push({
									json: passport,
									pairedItem: i,
								});
							}
						} else {
							returnData.push({
								json: response,
								pairedItem: i,
							});
						}
					} else if (operation === 'delete') {
						const passportId = this.getNodeParameter('passportId', i) as string;

						const response = await this.helpers.httpRequestWithAuthentication.call(this, 'onetap', {
							method: 'DELETE',
							url: `https://api-beta.onetapcheckin.com/api/passports/${passportId}`,
						});

						returnData.push({
							json: response,
							pairedItem: i,
						});
					} else if (operation === 'send') {
						const passportId = this.getNodeParameter('passportId', i) as string;
						const channel = this.getNodeParameter('channel', i) as string;
						const destination = this.getNodeParameter('destination', i) as string;

						const body = {
							channel,
							destination,
						};

						const response = await this.helpers.httpRequestWithAuthentication.call(this, 'onetap', {
							method: 'POST',
							url: `https://api-beta.onetapcheckin.com/api/passports/${passportId}/send`,
							body,
						});

						returnData.push({
							json: response,
							pairedItem: i,
						});
					}
				} else if (resource === 'punchPasses') {
					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;

						if (returnAll) {
							// Fetch all punch passes by paginating through all pages
							let allPunchPasses: any[] = [];
							let currentPage = 0;
							let hasMoreData = true;
							const pageSize = 50; // Use reasonable default for pagination

							while (hasMoreData) {
								const additionalFields = this.getNodeParameter('additionalFields', i) as {
									sortField?: string;
									sortDirection?: string;
									searchText?: string;
									searchType?: string;
									filterField?: string;
									equalTo?: string;
									notEqualTo?: string;
									greaterThan?: string;
									lessThan?: string;
									contains?: string;
									greaterThanDate?: string;
									lessThanDate?: string;
								};

								// Build query parameters, excluding empty values
								const queryParams: Record<string, any> = {
									page: currentPage,
									pageSize: pageSize,
								};

								if (additionalFields.sortField) queryParams.sortField = additionalFields.sortField;
								if (additionalFields.sortDirection)
									queryParams.sortDirection = additionalFields.sortDirection;
								if (additionalFields.searchText)
									queryParams.searchText = additionalFields.searchText;
								if (additionalFields.searchType)
									queryParams.searchType = additionalFields.searchType;
								if (additionalFields.filterField)
									queryParams.filterField = additionalFields.filterField;
								if (additionalFields.equalTo) queryParams.equalTo = additionalFields.equalTo;
								if (additionalFields.notEqualTo)
									queryParams.notEqualTo = additionalFields.notEqualTo;
								if (additionalFields.greaterThan)
									queryParams.greaterThan = additionalFields.greaterThan;
								if (additionalFields.lessThan) queryParams.lessThan = additionalFields.lessThan;
								if (additionalFields.contains) queryParams.contains = additionalFields.contains;
								// Convert dates to Unix timestamps
								if (additionalFields.greaterThanDate) {
									queryParams.greaterThanDate = Math.floor(
										new Date(additionalFields.greaterThanDate).getTime() / 1000,
									);
								}
								if (additionalFields.lessThanDate) {
									queryParams.lessThanDate = Math.floor(
										new Date(additionalFields.lessThanDate).getTime() / 1000,
									);
								}

								queryParams.profileId = this.getNodeParameter('profileId', i);

								const response = await this.helpers.httpRequestWithAuthentication.call(
									this,
									'onetap',
									{
										method: 'GET',
										url: 'https://api-beta.onetapcheckin.com/api/passports/punch-passports',
										qs: queryParams,
									},
								);

								if (
									response.data &&
									response.data.passports &&
									Array.isArray(response.data.passports)
								) {
									allPunchPasses = allPunchPasses.concat(response.data.passports);
									// Check if we got fewer results than requested, indicating last page
									hasMoreData = response.data.passports.length === pageSize;
									currentPage++;
								} else {
									hasMoreData = false;
								}
							}

							// Return all punch passes as separate items
							for (const punchPass of allPunchPasses) {
								returnData.push({
									json: punchPass,
									pairedItem: i,
								});
							}
						} else {
							// Single page request
							const additionalFields = this.getNodeParameter('additionalFields', i) as {
								sortField?: string;
								sortDirection?: string;
								searchText?: string;
								searchType?: string;
								filterField?: string;
								equalTo?: string;
								notEqualTo?: string;
								greaterThan?: string;
								lessThan?: string;
								contains?: string;
								greaterThanDate?: string;
								lessThanDate?: string;
							};

							// Build query parameters, excluding empty values
							const queryParams: Record<string, any> = {
								page: this.getNodeParameter('page', i),
								pageSize: this.getNodeParameter('pageSize', i),
							};

							if (additionalFields.sortField) queryParams.sortField = additionalFields.sortField;
							if (additionalFields.sortDirection)
								queryParams.sortDirection = additionalFields.sortDirection;
							if (additionalFields.searchText) queryParams.searchText = additionalFields.searchText;
							if (additionalFields.searchType) queryParams.searchType = additionalFields.searchType;
							if (additionalFields.filterField)
								queryParams.filterField = additionalFields.filterField;
							if (additionalFields.equalTo) queryParams.equalTo = additionalFields.equalTo;
							if (additionalFields.notEqualTo) queryParams.notEqualTo = additionalFields.notEqualTo;
							if (additionalFields.greaterThan)
								queryParams.greaterThan = additionalFields.greaterThan;
							if (additionalFields.lessThan) queryParams.lessThan = additionalFields.lessThan;
							if (additionalFields.contains) queryParams.contains = additionalFields.contains;
							// Convert dates to Unix timestamps
							if (additionalFields.greaterThanDate) {
								queryParams.greaterThanDate = Math.floor(
									new Date(additionalFields.greaterThanDate).getTime() / 1000,
								);
							}
							if (additionalFields.lessThanDate) {
								queryParams.lessThanDate = Math.floor(
									new Date(additionalFields.lessThanDate).getTime() / 1000,
								);
							}

							queryParams.profileId = this.getNodeParameter('profileId', i);

							const response = await this.helpers.httpRequestWithAuthentication.call(
								this,
								'onetap',
								{
									method: 'GET',
									url: 'https://api-beta.onetapcheckin.com/api/passports/punch-passports',
									qs: queryParams,
								},
							);

							if (
								response.data &&
								response.data.passports &&
								Array.isArray(response.data.passports)
							) {
								for (const punchPass of response.data.passports) {
									returnData.push({
										json: punchPass,
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
					} else if (operation === 'getSingle') {
						const passportId = this.getNodeParameter('passportId', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as {
							sortField?: string;
							sortDirection?: string;
							searchText?: string;
							searchType?: string;
							filterField?: string;
							equalTo?: string;
							notEqualTo?: string;
							greaterThan?: string;
							lessThan?: string;
							contains?: string;
							greaterThanDate?: string;
							lessThanDate?: string;
						};

						// Build query parameters for check-ins filtering
						const queryParams: Record<string, any> = {};

						if (!this.getNodeParameter('returnAll', i, false)) {
							queryParams.page = this.getNodeParameter('page', i, 0);
							queryParams.pageSize = this.getNodeParameter('pageSize', i, 50);
						}

						if (additionalFields.sortField) queryParams.sortField = additionalFields.sortField;
						if (additionalFields.sortDirection)
							queryParams.sortDirection = additionalFields.sortDirection;
						if (additionalFields.searchText) queryParams.searchText = additionalFields.searchText;
						if (additionalFields.searchType) queryParams.searchType = additionalFields.searchType;
						if (additionalFields.filterField)
							queryParams.filterField = additionalFields.filterField;
						if (additionalFields.equalTo) queryParams.equalTo = additionalFields.equalTo;
						if (additionalFields.notEqualTo) queryParams.notEqualTo = additionalFields.notEqualTo;
						if (additionalFields.greaterThan)
							queryParams.greaterThan = additionalFields.greaterThan;
						if (additionalFields.lessThan) queryParams.lessThan = additionalFields.lessThan;
						if (additionalFields.contains) queryParams.contains = additionalFields.contains;

						// Convert dates to Unix timestamps
						if (additionalFields.greaterThanDate) {
							queryParams.greaterThanDate = Math.floor(
								new Date(additionalFields.greaterThanDate).getTime() / 1000,
							);
						}
						if (additionalFields.lessThanDate) {
							queryParams.lessThanDate = Math.floor(
								new Date(additionalFields.lessThanDate).getTime() / 1000,
							);
						}

						const response = await this.helpers.httpRequestWithAuthentication.call(this, 'onetap', {
							method: 'GET',
							url: `https://api-beta.onetapcheckin.com/api/passports/punch-passports/${passportId}`,
							qs: queryParams,
						});

						if (response.data) {
							returnData.push({
								json: response.data,
								pairedItem: i,
							});
						} else {
							returnData.push({
								json: response,
								pairedItem: i,
							});
						}
					} else if (operation === 'create') {
						const profileId = this.getNodeParameter('profileId', i) as string;
						const startsAt = this.getNodeParameter('startsAt', i) as string;
						const createFields = this.getNodeParameter('createFields', i) as Record<string, any>;

						// Build the request body
						const body: Record<string, any> = {
							profileId,
							startsAt: Math.floor(new Date(startsAt).getTime() / 1000),
						};

						// Add optional fields if they have values
						Object.entries(createFields).forEach(([key, value]) => {
							if (value !== undefined && value !== '' && value !== null) {
								if (key === 'expiresAt') {
									body[key] = Math.floor(new Date(value as string).getTime() / 1000);
								} else {
									body[key] = value;
								}
							}
						});

						const response = await this.helpers.httpRequestWithAuthentication.call(this, 'onetap', {
							method: 'POST',
							url: 'https://api-beta.onetapcheckin.com/api/passports/punch-passports',
							body,
						});

						returnData.push({
							json: response.data || response,
							pairedItem: i,
						});
					} else if (operation === 'update') {
						const passportId = this.getNodeParameter('passportId', i) as string;
						const updateFields = this.getNodeParameter('updateFields', i) as Record<string, any>;

						// Build the request body
						const body: Record<string, any> = {};

						Object.entries(updateFields).forEach(([key, value]) => {
							if (value !== undefined && value !== '' && value !== null) {
								if (key === 'checkInIds') {
									body[key] = (value as string).split(',').map((id) => id.trim());
								} else {
									body[key] = value;
								}
							}
						});

						const response = await this.helpers.httpRequestWithAuthentication.call(this, 'onetap', {
							method: 'PUT',
							url: `https://api-beta.onetapcheckin.com/api/passports/punch-passports/${passportId}`,
							body,
						});

						returnData.push({
							json: response.data || response,
							pairedItem: i,
						});
					} else if (operation === 'redeem') {
						const passportId = this.getNodeParameter('passportId', i) as string;
						const checkInId = this.getNodeParameter('checkInId', i) as string;

						const body = {
							checkInId,
						};

						const response = await this.helpers.httpRequestWithAuthentication.call(this, 'onetap', {
							method: 'POST',
							url: `https://api-beta.onetapcheckin.com/api/passports/punch-passports/${passportId}/redeem`,
							body,
						});

						returnData.push({
							json: response.data || response,
							pairedItem: i,
						});
					}
				} else if (resource === 'participants') {
					if (operation === 'create') {
						const listId = this.getNodeParameter('listId', i) as string;
						const listIds = this.getNodeParameter('listIds', i) as string;
						const profileId = this.getNodeParameter('profileId', i) as string;
						const profileIds = this.getNodeParameter('profileIds', i) as string;
						const addAllProfile = this.getNodeParameter('addAllProfile', i) as boolean;
						const additionalFields = this.getNodeParameter('additionalFields', i) as Record<
							string,
							any
						>;

						// Build the request body
						const body: Record<string, any> = {};

						// Required fields - at least one must be provided
						if (listId) body.listId = listId;
						if (listIds) body.listIds = listIds.split(',').map((id) => id.trim());
						if (profileId) body.profileId = profileId;
						if (profileIds) body.profileIds = profileIds.split(',').map((id) => id.trim());
						if (addAllProfile) body.addAllProfile = addAllProfile;

						// Add optional fields if they have values
						Object.entries(additionalFields).forEach(([key, value]) => {
							if (value !== undefined && value !== '' && value !== null) {
								if (key === 'checkInDate' || key === 'checkOutDate') {
									body[key] = Math.floor(new Date(value as string).getTime() / 1000);
								} else if (key === 'checkInLocation' || key === 'checkOutLocation') {
									if (value.coordinates) {
										body[key] = value.coordinates;
									}
								} else {
									body[key] = value;
								}
							}
						});

						const response = await this.helpers.httpRequestWithAuthentication.call(this, 'onetap', {
							method: 'POST',
							url: 'https://api-beta.onetapcheckin.com/api/participants',
							body,
						});

						returnData.push({
							json: response,
							pairedItem: i,
						});
					} else if (operation === 'getSingle') {
						const participantId = this.getNodeParameter('participantId', i) as string;

						const response = await this.helpers.httpRequestWithAuthentication.call(this, 'onetap', {
							method: 'GET',
							url: `https://api-beta.onetapcheckin.com/api/participants/${participantId}`,
						});

						returnData.push({
							json: response,
							pairedItem: i,
						});
					} else if (operation === 'update') {
						const participantId = this.getNodeParameter('participantId', i) as string;
						const updateFields = this.getNodeParameter('updateFields', i) as Record<string, any>;

						// Build the request body
						const body: Record<string, any> = {};

						Object.entries(updateFields).forEach(([key, value]) => {
							if (value !== undefined && value !== '' && value !== null) {
								if (key === 'checkInDate' || key === 'checkOutDate') {
									body[key] = Math.floor(new Date(value as string).getTime() / 1000);
								} else if (key === 'location') {
									if (value.coordinates) {
										body[key] = value.coordinates;
									}
								} else {
									body[key] = value;
								}
							}
						});

						const response = await this.helpers.httpRequestWithAuthentication.call(this, 'onetap', {
							method: 'PUT',
							url: `https://api-beta.onetapcheckin.com/api/participants/${participantId}`,
							body,
						});

						returnData.push({
							json: response,
							pairedItem: i,
						});
					} else if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;

						if (returnAll) {
							// Fetch all participants by paginating through all pages
							let allParticipants: any[] = [];
							let currentSkip = 0;
							let hasMoreData = true;
							const limit = 100; // Use reasonable default for pagination

							while (hasMoreData) {
								const additionalFields = this.getNodeParameter('additionalFields', i) as Record<
									string,
									any
								>;

								// Build query parameters
								const queryParams: Record<string, any> = {
									limit: limit,
									skip: currentSkip,
								};

								// Add additional fields as query parameters
								Object.entries(additionalFields).forEach(([key, value]) => {
									if (value !== undefined && value !== '' && value !== null) {
										if (key.includes('Date')) {
											queryParams[key] = Math.floor(new Date(value as string).getTime() / 1000);
										} else {
											queryParams[key] = value;
										}
									}
								});

								const response = await this.helpers.httpRequestWithAuthentication.call(
									this,
									'onetap',
									{
										method: 'GET',
										url: 'https://api-beta.onetapcheckin.com/api/participants',
										qs: queryParams,
									},
								);

								const participants = Array.isArray(response) ? response : [response];
								allParticipants = allParticipants.concat(participants);

								// Check if we got fewer results than requested, indicating last page
								hasMoreData = participants.length === limit;
								currentSkip += limit;
							}

							// Return all participants as separate items
							for (const participant of allParticipants) {
								returnData.push({
									json: participant,
									pairedItem: i,
								});
							}
						} else {
							// Single page request
							const additionalFields = this.getNodeParameter('additionalFields', i) as Record<
								string,
								any
							>;

							// Build query parameters
							const queryParams: Record<string, any> = {
								limit: this.getNodeParameter('limit', i),
								skip: this.getNodeParameter('skip', i),
							};

							// Add additional fields as query parameters
							Object.entries(additionalFields).forEach(([key, value]) => {
								if (value !== undefined && value !== '' && value !== null) {
									if (key.includes('Date')) {
										queryParams[key] = Math.floor(new Date(value as string).getTime() / 1000);
									} else {
										queryParams[key] = value;
									}
								}
							});

							const response = await this.helpers.httpRequestWithAuthentication.call(
								this,
								'onetap',
								{
									method: 'GET',
									url: 'https://api-beta.onetapcheckin.com/api/participants',
									qs: queryParams,
								},
							);

							const participants = Array.isArray(response) ? response : [response];
							for (const participant of participants) {
								returnData.push({
									json: participant,
									pairedItem: i,
								});
							}
						}
					} else if (operation === 'delete') {
						const participantId = this.getNodeParameter('participantId', i) as string;
						const listId = this.getNodeParameter('listId', i) as string;

						const queryParams: Record<string, any> = {};
						if (listId) queryParams.listId = listId;

						const response = await this.helpers.httpRequestWithAuthentication.call(this, 'onetap', {
							method: 'DELETE',
							url: `https://api-beta.onetapcheckin.com/api/participants/${participantId}`,
							qs: queryParams,
						});

						returnData.push({
							json: response,
							pairedItem: i,
						});
					} else if (operation === 'checkIn') {
						const participantId = this.getNodeParameter('participantId', i) as string;
						const checkFields = this.getNodeParameter('checkFields', i) as Record<string, any>;

						// Build the request body
						const body: Record<string, any> = {};

						Object.entries(checkFields).forEach(([key, value]) => {
							if (value !== undefined && value !== '' && value !== null) {
								if (key === 'location') {
									if (value.coordinates) {
										body[key] = value.coordinates;
									}
								} else {
									body[key] = value;
								}
							}
						});

						const response = await this.helpers.httpRequestWithAuthentication.call(this, 'onetap', {
							method: 'POST',
							url: `https://api-beta.onetapcheckin.com/api/participants/${participantId}/checkin`,
							body,
						});

						returnData.push({
							json: response,
							pairedItem: i,
						});
					} else if (operation === 'checkOut') {
						const participantId = this.getNodeParameter('participantId', i) as string;
						const checkFields = this.getNodeParameter('checkFields', i) as Record<string, any>;

						// Build the request body
						const body: Record<string, any> = {};

						Object.entries(checkFields).forEach(([key, value]) => {
							if (value !== undefined && value !== '' && value !== null) {
								if (key === 'location') {
									if (value.coordinates) {
										body[key] = value.coordinates;
									}
								} else {
									body[key] = value;
								}
							}
						});

						const response = await this.helpers.httpRequestWithAuthentication.call(this, 'onetap', {
							method: 'POST',
							url: `https://api-beta.onetapcheckin.com/api/participants/${participantId}/checkout`,
							body,
						});

						returnData.push({
							json: response,
							pairedItem: i,
						});
					} else if (operation === 'undoCheckIn') {
						const participantId = this.getNodeParameter('participantId', i) as string;

						const response = await this.helpers.httpRequestWithAuthentication.call(this, 'onetap', {
							method: 'POST',
							url: `https://api-beta.onetapcheckin.com/api/participants/${participantId}/undoCheckin`,
						});

						returnData.push({
							json: response,
							pairedItem: i,
						});
					} else if (operation === 'undoCheckOut') {
						const participantId = this.getNodeParameter('participantId', i) as string;

						const response = await this.helpers.httpRequestWithAuthentication.call(this, 'onetap', {
							method: 'POST',
							url: `https://api-beta.onetapcheckin.com/api/participants/${participantId}/undoCheckout`,
						});

						returnData.push({
							json: response,
							pairedItem: i,
						});
					}
				} else if (resource === 'lists') {
					if (operation === 'create') {
						const listName = this.getNodeParameter('listName', i) as string;
						const listDate = this.getNodeParameter('listDate', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as Record<
							string,
							any
						>;

						// Build the request body
						const body: Record<string, any> = {
							name: listName,
							date: Math.floor(new Date(listDate).getTime() / 1000),
						};

						// Add optional fields if they have values
						Object.entries(additionalFields).forEach(([key, value]) => {
							if (value !== undefined && value !== '' && value !== null) {
								if (key === 'endDate') {
									body[key] = Math.floor(new Date(value as string).getTime() / 1000);
								} else if (key === 'schedule' && value.days) {
									body[key] = value.days;
								} else {
									body[key] = value;
								}
							}
						});

						const response = await this.helpers.httpRequestWithAuthentication.call(this, 'onetap', {
							method: 'POST',
							url: 'https://api-beta.onetapcheckin.com/api/lists',
							body,
						});

						returnData.push({
							json: response,
							pairedItem: i,
						});
					} else if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;

						if (returnAll) {
							// Fetch all lists by paginating through all pages
							let allLists: any[] = [];
							let currentPage = 0;
							let hasMoreData = true;
							const pageSize = 50; // Use reasonable default for pagination

							while (hasMoreData) {
								const additionalFields = this.getNodeParameter('additionalFields', i) as Record<
									string,
									any
								>;

								// Build query parameters
								const queryParams: Record<string, any> = {
									limit: pageSize,
									skip: currentPage * pageSize,
								};

								// Add additional fields as query parameters
								Object.entries(additionalFields).forEach(([key, value]) => {
									if (value !== undefined && value !== '' && value !== null) {
										if (key.includes('Date')) {
											queryParams[key] = Math.floor(new Date(value as string).getTime() / 1000);
										} else {
											queryParams[key] = value;
										}
									}
								});

								const response = await this.helpers.httpRequestWithAuthentication.call(
									this,
									'onetap',
									{
										method: 'GET',
										url: 'https://api-beta.onetapcheckin.com/api/lists',
										qs: queryParams,
									},
								);

								const lists = Array.isArray(response) ? response : [response];
								allLists = allLists.concat(lists);

								// Check if we got fewer results than requested, indicating last page
								hasMoreData = lists.length === pageSize;
								currentPage++;
							}

							// Return all lists as separate items
							for (const list of allLists) {
								returnData.push({
									json: list,
									pairedItem: i,
								});
							}
						} else {
							// Single page request
							const additionalFields = this.getNodeParameter('additionalFields', i) as Record<
								string,
								any
							>;

							// Build query parameters
							const queryParams: Record<string, any> = {
								limit: this.getNodeParameter('limit', i),
								skip: this.getNodeParameter('skip', i),
							};

							// Add additional fields as query parameters
							Object.entries(additionalFields).forEach(([key, value]) => {
								if (value !== undefined && value !== '' && value !== null) {
									if (key.includes('Date')) {
										queryParams[key] = Math.floor(new Date(value as string).getTime() / 1000);
									} else {
										queryParams[key] = value;
									}
								}
							});

							const response = await this.helpers.httpRequestWithAuthentication.call(
								this,
								'onetap',
								{
									method: 'GET',
									url: 'https://api-beta.onetapcheckin.com/api/lists',
									qs: queryParams,
								},
							);

							const lists = Array.isArray(response) ? response : [response];
							for (const list of lists) {
								returnData.push({
									json: list,
									pairedItem: i,
								});
							}
						}
					} else if (operation === 'getSingle') {
						const listId = this.getNodeParameter('listId', i) as string;

						const response = await this.helpers.httpRequestWithAuthentication.call(this, 'onetap', {
							method: 'GET',
							url: `https://api-beta.onetapcheckin.com/api/lists/${listId}`,
						});

						returnData.push({
							json: response,
							pairedItem: i,
						});
					} else if (operation === 'update') {
						const listId = this.getNodeParameter('listId', i) as string;
						const updateFields = this.getNodeParameter('updateFields', i) as Record<string, any>;

						// Build the request body
						const body: Record<string, any> = {};

						Object.entries(updateFields).forEach(([key, value]) => {
							if (value !== undefined && value !== '' && value !== null) {
								if (key === 'date' || key === 'endDate') {
									body[key] = Math.floor(new Date(value as string).getTime() / 1000);
								} else if (key === 'schedule' && value.days) {
									body[key] = value.days;
								} else {
									body[key] = value;
								}
							}
						});

						const response = await this.helpers.httpRequestWithAuthentication.call(this, 'onetap', {
							method: 'PUT',
							url: `https://api-beta.onetapcheckin.com/api/lists/${listId}`,
							body,
						});

						returnData.push({
							json: response,
							pairedItem: i,
						});
					} else if (operation === 'deleteSingle') {
						const listId = this.getNodeParameter('listId', i) as string;

						const response = await this.helpers.httpRequestWithAuthentication.call(this, 'onetap', {
							method: 'DELETE',
							url: `https://api-beta.onetapcheckin.com/api/lists/${listId}`,
						});

						returnData.push({
							json: response,
							pairedItem: i,
						});
					} else if (operation === 'deleteMultiple') {
						const listIds = this.getNodeParameter('listIds', i) as string;
						const deleteAll = this.getNodeParameter('deleteAll', i) as boolean;

						// Build the request body
						const body: Record<string, any> = {};

						if (deleteAll) {
							body.deleteAll = true;
						} else if (listIds) {
							body.listIds = listIds.split(',').map((id) => id.trim());
						}

						const response = await this.helpers.httpRequestWithAuthentication.call(this, 'onetap', {
							method: 'DELETE',
							url: 'https://api-beta.onetapcheckin.com/api/lists',
							body,
						});

						returnData.push({
							json: response,
							pairedItem: i,
						});
					} else if (operation === 'getListSurveyData') {
						const listId = this.getNodeParameter('listId', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as Record<
							string,
							any
						>;

						// Build query parameters
						const queryParams: Record<string, any> = {};

						// Add additional fields as query parameters
						Object.entries(additionalFields).forEach(([key, value]) => {
							if (value !== undefined && value !== '' && value !== null) {
								queryParams[key] = value;
							}
						});

						const response = await this.helpers.httpRequestWithAuthentication.call(this, 'onetap', {
							method: 'GET',
							url: `https://api-beta.onetapcheckin.com/api/lists/${listId}/survey`,
							qs: queryParams,
						});

						returnData.push({
							json: response,
							pairedItem: i,
						});
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
						description: `Failed to execute ${resource} operation from OneTap API: ${error.message}`,
					});
				}
			}
		}

		return [returnData];
	}
}
