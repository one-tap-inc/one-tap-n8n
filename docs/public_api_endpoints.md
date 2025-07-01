# OneTap API Endpoints Documentation

Base URL: `https://api-beta.onetapcheckin.com`

Authentication: Required via OneTap credentials

## Summary

The OneTap API provides comprehensive visitor and attendance management functionality across 5 main resources:

- **Profiles**: Manage visitor profiles with custom fields support (9 operations)
- **Passports**: Standard passport management with sending and deletion capabilities (6 operations)  
- **Punch Passes**: Create, track, and manage punch pass data with advanced filtering (5 operations)
- **Participants**: Handle event participants, check-ins/check-outs, and attendance tracking (9 operations)
- **Lists**: Create and manage event lists with scheduling and survey management (7 operations)

Total endpoints: 36 operations across 5 resources with full CRUD capabilities and specialized check-in/check-out functionality.

## Node Implementation Status

This n8n community node implements **all 36 operations** across the 5 resources, providing complete access to the OneTap API functionality including:

✅ **Profile Management**: Complete CRUD operations with custom fields, avatar uploads, and search capabilities
✅ **Passport Operations**: Full passport lifecycle management including sending via SMS/email  
✅ **Punch Pass System**: Creation, tracking, redemption, and advanced filtering
✅ **Participant Handling**: Registration, check-in/check-out workflows, and attendance tracking
✅ **List Management**: Event list creation, management, and survey data retrieval

## Current Node Operations

The following table shows all operations currently implemented in the n8n OneTap community node:

| Resource | Operation | n8n Action | Method | Endpoint |
|----------|-----------|------------|--------|----------|
| **Profile** | Get All | Get all profiles | GET | `/api/profiles` |
| **Profile** | Get Single | Get a specific profile | GET | `/api/profiles/{profileId}` |
| **Profile** | Create | Create a profile | POST | `/api/profiles` |
| **Profile** | Update | Update a profile | PUT | `/api/profiles/{profileId}` |
| **Profile** | Delete | Delete a profile | DELETE | `/api/profiles/{profileId}` |
| **Profile** | Delete Multiple | Delete multiple profiles | DELETE | `/api/profiles` |
| **Profile** | Update Avatar | Update profile avatar | PUT | `/api/profiles/{profileId}/avatar` |
| **Profile** | Get Custom Fields | Get custom fields schema | GET | `/api/profiles/customFields` |
| **Profile** | Find by Check-in Code | Find profile by check-in code | GET | `/api/profiles/checkInCode` |
| **Passports** | Get All | Get all passes for a profile or participant | GET | `/api/passports` |
| **Passports** | Get by Participant | Get passport for a specific participant | GET | `/api/passports/participants/{participantId}` |
| **Passports** | Get by Profile | Get passes for a specific profile | GET | `/api/passports/profiles/{profileId}` |
| **Passports** | Get Groups | Get all group passes | GET | `/api/passports/groups` |
| **Passports** | Delete | Delete a group pass | DELETE | `/api/passports/{passportId}` |
| **Passports** | Send | Send a passport via SMS or email | POST | `/api/passports/{passportId}/send` |
| **Punch Passes** | Create | Create a new punch passport | POST | `/api/passports/punch-passports` |
| **Punch Passes** | Get All | Get all punch passes for a profile | GET | `/api/passports/punch-passports` |
| **Punch Passes** | Get Single | Get a single punch pass with check-ins | GET | `/api/passports/punch-passports/{passportId}` |
| **Punch Passes** | Update | Update a punch passport | PUT | `/api/passports/punch-passports/{passportId}` |
| **Punch Passes** | Redeem | Redeem a punch passport by associating a check-in | POST | `/api/passports/punch-passports/{passportId}/redeem` |
| **Participants** | Create | Create participant(s) | POST | `/api/participants` |
| **Participants** | Get Single | Get a single participant | GET | `/api/participants/{participantId}` |
| **Participants** | Update | Update a participant | PUT | `/api/participants/{participantId}` |
| **Participants** | Get All | Get all participants | GET | `/api/participants` |
| **Participants** | Delete | Delete a participant | DELETE | `/api/participants/{participantId}` |
| **Participants** | Check In | Check in a participant | POST | `/api/participants/{participantId}/checkin` |
| **Participants** | Check Out | Check out a participant | POST | `/api/participants/{participantId}/checkout` |
| **Participants** | Undo Check In | Undo check-in for a participant | POST | `/api/participants/{participantId}/undoCheckin` |
| **Participants** | Undo Check Out | Undo check-out for a participant | POST | `/api/participants/{participantId}/undoCheckout` |
| **Lists** | Create | Create a new list | POST | `/api/lists` |
| **Lists** | Get All | Get all lists | GET | `/api/lists` |
| **Lists** | Get Single | Get a single list | GET | `/api/lists/{listId}` |
| **Lists** | Update | Update a list | PUT | `/api/lists/{listId}` |
| **Lists** | Delete Single | Delete a single list | DELETE | `/api/lists/{listId}` |
| **Lists** | Delete Multiple | Delete multiple lists | DELETE | `/api/lists` |
| **Lists** | Get Survey Data | Get survey data for a list | GET | `/api/lists/{listId}/survey` |

## API Endpoints Overview

### Profile Endpoints

| Operation | Method | Endpoint | Key Parameters | Description |
|-----------|--------|----------|----------------|-------------|
| Get All | GET | `/api/profiles` | `page`, `pageSize`, `search`, `sortBy`, `favorite` | Fetch all profiles with filtering and pagination |
| Get Single | GET | `/api/profiles/{profileId}` | `profileId` (path) | Get a specific profile by ID |
| Create | POST | `/api/profiles` | Profile data in body | Create a new profile |
| Update | PUT | `/api/profiles/{profileId}` | `profileId` (path), profile fields in body | Update profile with custom fields support |
| Delete | DELETE | `/api/profiles/{profileId}` | `profileId` (path) | Delete a specific profile |
| Delete Multiple | DELETE | `/api/profiles` | `profileIds` array in body | Delete multiple profiles |
| Update Avatar | PUT | `/api/profiles/{profileId}/avatar` | `profileId` (path), avatar file in body | Update profile avatar image |
| Get Custom Fields | GET | `/api/profiles/customFields` | None | Get custom fields schema |
| Find by Check-in Code | GET | `/api/profiles/checkInCode` | `checkInCode` (query) | Find profile by check-in code |

### Passports Endpoints

| Operation | Method | Endpoint | Key Parameters | Description |
|-----------|--------|----------|----------------|-------------|
| Get All | GET | `/api/passports` | `profileId`, `participantId`, `passportType`, pagination | Fetch all passes for a profile or participant |
| Get by Participant | GET | `/api/passports/participants/{participantId}` | `participantId` (path) | Fetch passport for a specific participant (DEPRECATED) |
| Get by Profile | GET | `/api/passports/profiles/{profileId}` | `profileId` (path), `customBarcode` | Fetch passes for a specific profile (DEPRECATED) |
| Get Groups | GET | `/api/passports/groups` | `limit` | Fetch all group passes |
| Delete | DELETE | `/api/passports/{passportId}` | `passportId` (path) | Delete a group pass |
| Send | POST | `/api/passports/{passportId}/send` | `passportId` (path), `channel`, `destination` | Send a passport via SMS or email |

### Punch Passes Endpoints

| Operation | Method | Endpoint | Key Parameters | Description |
|-----------|--------|----------|----------------|-------------|
| Create | POST | `/api/passports/punch-passports` | `profileId`, `startsAt`, optional fields | Create a new punch passport |
| Get All | GET | `/api/passports/punch-passports` | `profileId` (required), pagination, filtering | Get all punch passes for a profile |
| Get Single | GET | `/api/passports/punch-passports/{passportId}` | `passportId` (path), filtering options | Get single punch pass with check-ins |
| Update | PUT | `/api/passports/punch-passports/{passportId}` | `passportId` (path), update fields | Update a punch passport |
| Redeem | POST | `/api/passports/punch-passports/{passportId}/redeem` | `passportId` (path), `checkInId` | Redeem a punch passport by associating a check-in |

### Participants Endpoints

| Operation | Method | Endpoint | Key Parameters | Description |
|-----------|--------|----------|----------------|-------------|
| Create | POST | `/api/participants` | `listId`/`listIds`, `profileId`/`profileIds`/`addAllProfile` | Create participants for lists |
| Get Single | GET | `/api/participants/{participantId}` | `participantId` (path) | Get a single participant |
| Update | PUT | `/api/participants/{participantId}` | `participantId` (path), update fields in body | Update participant details |
| Get All | GET | `/api/participants` | `limit`, `skip`, filtering options | Get all participants with filtering |
| Delete | DELETE | `/api/participants/{participantId}` | `participantId` (path), optional `listId` | Delete a participant |
| Check In | POST | `/api/participants/{participantId}/checkin` | `participantId` (path), check-in details in body | Check in a participant |
| Check Out | POST | `/api/participants/{participantId}/checkout` | `participantId` (path), check-out details in body | Check out a participant |
| Undo Check In | POST | `/api/participants/{participantId}/undoCheckin` | `participantId` (path) | Undo check-in for participant |
| Undo Check Out | POST | `/api/participants/{participantId}/undoCheckout` | `participantId` (path) | Undo check-out for participant |

### Lists Endpoints

| Operation | Method | Endpoint | Key Parameters | Description |
|-----------|--------|----------|----------------|-------------|
| Create | POST | `/api/lists` | `name`, `date` (required), optional config fields | Create a new list |
| Get All | GET | `/api/lists` | `limit`, `skip`, filtering and sorting options | Get all lists with filtering |
| Get Single | GET | `/api/lists/{listId}` | `listId` (path) | Get a single list |
| Update | PUT | `/api/lists/{listId}` | `listId` (path), update fields in body | Update a list |
| Delete Single | DELETE | `/api/lists/{listId}` | `listId` (path) | Delete a single list |
| Delete Multiple | DELETE | `/api/lists` | `listIds` array or `deleteAll` boolean | Delete multiple lists or all lists |
| Get Survey Data | GET | `/api/lists/{listId}/survey` | `listId` (path), optional `profileId` | Get survey data for a list |

## Parameter Reference

### Common Query Parameters

| Parameter | Type | Description | Used In |
|-----------|------|-------------|---------|
| `page` / `skip` | number | Pagination offset | Most GET endpoints |
| `pageSize` / `limit` | number | Items per page (1-1000) | Most GET endpoints |
| `sortField` / `sortBy` | string | Field to sort by | Most GET endpoints |
| `sortOrder` / `sortDirection` | string | Sort direction (asc/desc, ascending/descending) | Most GET endpoints |
| `search` / `searchQuery` / `searchText` | string | Text search filter | Most GET endpoints |
| `profileId` | string | Profile identifier | Passports, punch passes, participants, lists |
| `participantId` | string | Participant identifier | Passports, participants |
| `passportId` | string | Passport identifier | Passports, punch passes |
| `listId` | string | List identifier | Participants, lists |
| `passportType` | string | Filter by passport type | Passports |
| `customBarcode` | boolean | Include custom barcode | Passports (deprecated endpoints) |

### Common Body Parameters

| Parameter | Type | Description | Used In |
|-----------|------|-------------|---------|
| `checkInDate` / `checkOutDate` | number | Unix timestamp | Participants create/update |
| `checkInMethod` / `checkOutMethod` | string | Check-in/out method (TAP, QR, MANUAL, etc.) | Participants operations |
| `location` | object | GPS coordinates `{lat: number, lng: number}` | Participants check-in/out |
| `timeZone` | string | IANA timezone (e.g., "America/Chicago") | Lists, participants |
| `source` | string | Source of the operation | Most POST/PUT endpoints |
| `notes` | string | General notes | Profiles, participants, lists |
| `startsAt` | number | Unix timestamp | Punch passes create |
| `expiresAt` | number | Unix timestamp | Punch passes create |
| `checkInsLimit` | number | Maximum check-ins allowed | Punch passes create/update |
| `channel` | string | Delivery channel (sms, email) | Passports send |
| `destination` | string | Phone number or email address | Passports send |
| `checkInId` | string | Check-in ID for association | Punch passes redeem |

### Special Parameters

| Parameter | Type | Description | Used In |
|-----------|------|-------------|---------|
| `addAllProfile` | boolean | Add all profiles to lists | Participants create |
| `deleteAll` | boolean | Delete all items | Lists delete multiple |
| `returnAll` | boolean | Fetch all pages automatically | Node-specific (not API) |
| `customFields` | object | Dynamic key-value pairs | Profile update |
| `schedule` | object | Weekly schedule object | Lists create/update |

## Detailed Endpoint Documentation

## Profile Endpoints

### Get All Profiles
- **Method**: GET
- **Endpoint**: `/api/profiles`
- **Description**: Fetch all profiles with optional filtering and pagination

**Query Parameters:**
- `page` (number): Page number to retrieve (default: 0)
- `pageSize` (number): Number of profiles per page (1-100, default: 50)
- `search` (string): Search by name, email, or phone number
- `sortBy` (string): Field to sort by (name, email, createdAt)
- `sortOrder` (string): Sort direction (asc, desc)
- `favorite` (boolean): Filter by favorite status

**Response**: Array of profile objects

### Get Single Profile
- **Method**: GET
- **Endpoint**: `/api/profiles/{profileId}`
- **Description**: Get a specific profile by ID

**Path Parameters:**
- `profileId` (string, required): The ID of the profile to retrieve

**Response**: Single profile object

### Create Profile
- **Method**: POST
- **Endpoint**: `/api/profiles`
- **Description**: Create a new profile

**Request Body:**
```json
{
  "name": "string (required)",
  "email": "string (valid email format)",
  "phone": "string (digits only)",
  "address": "string",
  "notes": "string",
  "favorite": "boolean",
  "checkInCode": "string (alphanumeric)",
  "allowDuplicate": "boolean",
  "duplicatePhoneAllowed": "boolean",
  "enableSendConfirmationEmail": "boolean",
  "timeZone": "string (IANA format)",
  "source": "string",
  "customFields": {
    "fieldName": "value (string|number|boolean|array|date)"
  }
}
```

**Custom Field Types:**
- `string`: Text value
- `number`: Numeric value
- `boolean`: True/false value
- `array`: JSON array or comma-separated string
- `date`: Unix timestamp (converted from ISO date string)

**Response**: Created profile object

### Update Profile
- **Method**: PUT
- **Endpoint**: `/api/profiles/{profileId}`
- **Description**: Update an existing profile

**Path Parameters:**
- `profileId` (string, required): The ID of the profile to update

**Request Body:**
```json
{
  "name": "string",
  "email": "string (valid email format)",
  "phone": "string (digits only)",
  "address": "string",
  "notes": "string",
  "favorite": "boolean",
  "checkInCode": "string (alphanumeric)",
  "customFields": {
    "fieldName": "value (string|number|boolean|array|date)"
  }
}
```

**Response**: Updated profile object

### Delete Profile
- **Method**: DELETE
- **Endpoint**: `/api/profiles/{profileId}`
- **Description**: Delete a specific profile

**Path Parameters:**
- `profileId` (string, required): The ID of the profile to delete

**Response**: Deletion confirmation

### Delete Multiple Profiles
- **Method**: DELETE
- **Endpoint**: `/api/profiles`
- **Description**: Delete multiple profiles

**Request Body:**
```json
{
  "profileIds": ["string"] (array of profile IDs to delete)
}
```

**Response**: Deletion confirmation with count

### Update Profile Avatar
- **Method**: PUT
- **Endpoint**: `/api/profiles/{profileId}/avatar`
- **Description**: Update profile avatar image

**Path Parameters:**
- `profileId` (string, required): The ID of the profile

**Request Body:**
- Multipart form data with avatar file

**Response**: Updated profile object with avatar URL

### Get Custom Fields Schema
- **Method**: GET
- **Endpoint**: `/api/profiles/customFields`
- **Description**: Get the custom fields schema configuration

**Response**: Custom fields schema object

### Find Profile by Check-in Code
- **Method**: GET
- **Endpoint**: `/api/profiles/checkInCode`
- **Description**: Find a profile using their check-in code

**Query Parameters:**
- `checkInCode` (string, required): The check-in code to search for

**Response**: Profile object or null if not found

## Passports Endpoints

### Get All Passes
- **Method**: GET
- **Endpoint**: `/api/passports`
- **Description**: Fetch all passes for a profile or participant

**Query Parameters:**
- `profileId` (string, optional): The profile ID to fetch passes for
- `participantId` (string, optional): The participant ID to fetch passes for
- `passportType` (string, optional): Filter by passport type
- `page` (number): Page number (default: 0)
- `pageSize` (number): Items per page (1-100, default: 50)

**Response**: 
```json
{
  "data": {
    "passports": [/* array of passport objects */]
  }
}
```

### Get by Participant
- **Method**: GET
- **Endpoint**: `/api/passports/participants/{participantId}`
- **Description**: Fetch passport for a specific participant (DEPRECATED)

**Path Parameters:**
- `participantId` (string, required): The participant ID

### Get by Profile
- **Method**: GET
- **Endpoint**: `/api/passports/profiles/{profileId}`
- **Description**: Fetch passes for a specific profile (DEPRECATED)

**Path Parameters:**
- `profileId` (string, required): The profile ID

**Query Parameters:**
- `customBarcode` (boolean, optional): Include custom barcode ("1" or true)

### Get Groups
- **Method**: GET
- **Endpoint**: `/api/passports/groups`
- **Description**: Fetch all group passes

**Query Parameters:**
- `limit` (number): Results per page (1-1000, default: 100)

**Response**: 
```json
{
  "data": {
    "groups": [/* array of group objects */]
  }
}
```

### Delete Passport
- **Method**: DELETE
- **Endpoint**: `/api/passports/{passportId}`
- **Description**: Delete a group pass

**Path Parameters:**
- `passportId` (string, required): The passport ID

### Send Passport
- **Method**: POST
- **Endpoint**: `/api/passports/{passportId}/send`
- **Description**: Send a passport via SMS or email

**Path Parameters:**
- `passportId` (string, required): The passport ID

**Request Body:**
```json
{
  "channel": "string (sms|email)",
  "destination": "string (phone number or email address)"
}
```

## Punch Passes Endpoints

### Create Punch Passport
- **Method**: POST
- **Endpoint**: `/api/passports/punch-passports`
- **Description**: Create a new punch passport

**Request Body:**
```json
{
  "profileId": "string (required)",
  "startsAt": "number (Unix timestamp, required)",
  "name": "string (optional, name for the punch pass)",
  "expiresAt": "number (Unix timestamp, optional)",
  "checkInsLimit": "number (optional, maximum check-ins allowed, positive integer)"
}
```

### Get All Punch Passes
- **Method**: GET
- **Endpoint**: `/api/passports/punch-passports`
- **Description**: Get all punch passes for a profile

**Query Parameters:**
- `profileId` (string, required): The profile ID to fetch punch passes for
- `page` (number): Page number (default: 0)
- `pageSize` (number): Items per page (1-100, default: 50)
- `sortField` (string): Field to sort by
- `sortDirection` (string): Sort direction (ascending, descending)
- `searchText` (string): Text to search for
- `searchType` (string): Search type (exact, exactIgnoreCase, partial)
- `filterField` (string): Field to filter by
- `equalTo` (string): Filter value (equals)
- `notEqualTo` (string): Filter value (not equals)
- `greaterThan` (string): Filter value (greater than)
- `lessThan` (string): Filter value (less than)
- `contains` (string): Filter value (contains)
- `greaterThanDate` (number): Unix timestamp for date filtering (greater than)
- `lessThanDate` (number): Unix timestamp for date filtering (less than)

**Response**: 
```json
{
  "data": {
    "passports": [/* array of punch pass objects */]
  }
}
```

### Get Single Punch Pass
- **Method**: GET
- **Endpoint**: `/api/passports/punch-passports/{passportId}`
- **Description**: Get a single punch pass with check-ins

**Path Parameters:**
- `passportId` (string, required): The punch pass ID to retrieve

**Query Parameters:** (same filtering options as Get All)

### Update Punch Passport
- **Method**: PUT
- **Endpoint**: `/api/passports/punch-passports/{passportId}`
- **Description**: Update a punch passport

**Path Parameters:**
- `passportId` (string, required): The punch pass ID

**Request Body:**
```json
{
  "status": "boolean (active status of the passport)",
  "checkInsLimit": "number (new check-ins limit)",
  "checkInIds": ["string"] (array of check-in IDs to associate)
}
```

### Redeem Punch Passport
- **Method**: POST
- **Endpoint**: `/api/passports/punch-passports/{passportId}/redeem`
- **Description**: Redeem a punch passport by associating a check-in

**Path Parameters:**
- `passportId` (string, required): The punch pass ID

**Request Body:**
```json
{
  "checkInId": "string (required)"
}
```

## Participants Endpoints

### Create Participants
- **Method**: POST
- **Endpoint**: `/api/participants`
- **Description**: Create participant(s) for lists

**Request Body:**
```json
{
  "listId": "string (single list ID)",
  "listIds": ["string"] (array of list IDs),
  "profileId": "string (single profile ID)",
  "profileIds": ["string"] (array of profile IDs),
  "addAllProfile": "boolean (add all profiles)",
  "notAllowDuplicate": "boolean",
  "overrideParentAutoAdd": "boolean",
  "searchText": "string",
  "checkedIn": "boolean",
  "checkedOut": "boolean",
  "checkInDate": "number (Unix timestamp)",
  "checkOutDate": "number (Unix timestamp)",
  "checkInMethod": "string (TAP|QR|MANUAL|KIOSK|SMS|EMAIL|VOICE|BROWSER|MOBILE_APP)",
  "checkOutMethod": "string (TAP|QR|MANUAL|KIOSK|SMS|EMAIL|VOICE|BROWSER|MOBILE_APP)",
  "checkInTimeZone": "string (e.g., America/Chicago)",
  "checkOutTimeZone": "string",
  "checkInInstallationId": "string",
  "checkInLocation": {
    "lat": "number",
    "lng": "number"
  },
  "checkOutLocation": {
    "lat": "number",
    "lng": "number"
  },
  "checkInIpAddress": "string",
  "checkInNotes": "string",
  "checkOutNotes": "string",
  "source": "string"
}
```

**Required Fields:** At least one of:
- `listId` OR `listIds`
- `profileId` OR `profileIds` OR `addAllProfile: true`

### Get Single Participant
- **Method**: GET
- **Endpoint**: `/api/participants/{participantId}`
- **Description**: Get a single participant

**Path Parameters:**
- `participantId` (string, required): The participant ID

### Update Participant
- **Method**: PUT
- **Endpoint**: `/api/participants/{participantId}`
- **Description**: Update a participant

**Path Parameters:**
- `participantId` (string, required): The participant ID

**Request Body:**
```json
{
  "checkInDate": "number (Unix timestamp)",
  "checkOutDate": "number (Unix timestamp)",
  "notes": "string",
  "checkInNotes": "string",
  "checkOutNotes": "string",
  "checkInMethod": "string",
  "checkOutMethod": "string",
  "location": {
    "lat": "number",
    "lng": "number"
  },
  "timeZone": "string",
  "installationId": "string",
  "source": "string"
}
```

### Get All Participants
- **Method**: GET
- **Endpoint**: `/api/participants`
- **Description**: Get all participants with filtering

**Query Parameters:**
- `limit` (number): Results per page (1-1000, default: 100)
- `skip` (number): Number to skip for pagination (default: 0)
- `listId` (string): Single list ID filter
- `listIds` (string): Comma-separated list IDs
- `profileId` (string): Single profile ID filter
- `profileIds` (string): Comma-separated profile IDs
- `checkedIn` (boolean): Filter by check-in status
- `checkedOut` (boolean): Filter by check-out status
- `gtCheckInDate` (number): Check-ins after date (Unix timestamp)
- `ltCheckInDate` (number): Check-ins before date (Unix timestamp)
- `gtCheckOutDate` (number): Check-outs after date (Unix timestamp)
- `ltCheckOutDate` (number): Check-outs before date (Unix timestamp)
- `ipAddress` (string): Filter by IP address
- `searchListQuery` (string): Search by list name
- `sortField` (string): Field to sort by (checkInDate, checkOutDate, createdAt, updatedAt, name, email, phone, checkInCode, lastName, favorite)
- `sortOrder` (string): Sort direction (asc, desc)

### Delete Participant
- **Method**: DELETE
- **Endpoint**: `/api/participants/{participantId}`
- **Description**: Delete a participant

**Path Parameters:**
- `participantId` (string, required): The participant ID

**Query Parameters:**
- `listId` (string, optional): Optional list ID for targeted removal

### Check In Participant
- **Method**: POST
- **Endpoint**: `/api/participants/{participantId}/checkin`
- **Description**: Check in a participant

**Path Parameters:**
- `participantId` (string, required): The participant ID

**Request Body:**
```json
{
  "listId": "string",
  "profileId": "string",
  "method": "string (TAP|QR|MANUAL|KIOSK|SMS|EMAIL|VOICE|BROWSER|MOBILE_APP)",
  "source": "string",
  "location": {
    "lat": "number",
    "lng": "number"
  },
  "timeZone": "string",
  "installationId": "string",
  "sendVisitorAlert": "boolean"
}
```

### Check Out Participant
- **Method**: POST
- **Endpoint**: `/api/participants/{participantId}/checkout`
- **Description**: Check out a participant

**Path Parameters:**
- `participantId` (string, required): The participant ID

**Request Body:** (same as check-in)

### Undo Check In
- **Method**: POST
- **Endpoint**: `/api/participants/{participantId}/undoCheckin`
- **Description**: Undo check-in for a participant

**Path Parameters:**
- `participantId` (string, required): The participant ID

### Undo Check Out
- **Method**: POST
- **Endpoint**: `/api/participants/{participantId}/undoCheckout`
- **Description**: Undo check-out for a participant

**Path Parameters:**
- `participantId` (string, required): The participant ID

## Lists Endpoints

### Create List
- **Method**: POST
- **Endpoint**: `/api/lists`
- **Description**: Create a new list

**Request Body:**
```json
{
  "name": "string (required)",
  "date": "number (Unix timestamp, required)",
  "description": "string",
  "notes": "string",
  "endDate": "number (Unix timestamp)",
  "timeZone": "string (e.g., America/Chicago)",
  "autoCreateChildList": "boolean",
  "checkOutEnabled": "boolean",
  "checkInOption": "string (tap|qr|manual|kiosk|sms|email|voice|browser|mobile_app)",
  "checkOutOption": "string (tap|qr|manual|kiosk|sms|email|voice|browser|mobile_app)",
  "isOpenRegistration": "boolean",
  "openRegistrationSetting": "string (open|closed|profiles)",
  "source": "string",
  "parentId": "string (for child lists)",
  "schedule": {
    "monday": "boolean",
    "tuesday": "boolean",
    "wednesday": "boolean",
    "thursday": "boolean",
    "friday": "boolean",
    "saturday": "boolean",
    "sunday": "boolean"
  }
}
```

### Get All Lists
- **Method**: GET
- **Endpoint**: `/api/lists`
- **Description**: Get all lists with filtering

**Query Parameters:**
- `limit` (number): Results per page (1-1000, default: 100)
- `skip` (number): Number to skip for pagination (default: 0)
- `sortField` (string): Field to sort by (date, name, createdAt, updatedAt, size)
- `sortDirection` (string): Sort direction (ascending, descending)
- `searchQuery` (string): Search by list name
- `listType` (string): Filter by type (all, recurring, children, individual, root)
- `archived` (boolean): Filter by archived status
- `parentListId` (string): Filter by parent list ID
- `isOpenRegistrationEnabled` (boolean): Filter by open registration status
- `startDate` (number): Filter lists after date (Unix timestamp)
- `endDate` (number): Filter lists before date (Unix timestamp)

### Get Single List
- **Method**: GET
- **Endpoint**: `/api/lists/{listId}`
- **Description**: Get a single list

**Path Parameters:**
- `listId` (string, required): The list ID

### Update List
- **Method**: PUT
- **Endpoint**: `/api/lists/{listId}`
- **Description**: Update a list

**Path Parameters:**
- `listId` (string, required): The list ID

**Request Body:** (same fields as create, all optional)

### Delete Single List
- **Method**: DELETE
- **Endpoint**: `/api/lists/{listId}`
- **Description**: Delete a single list

**Path Parameters:**
- `listId` (string, required): The list ID

### Delete Multiple Lists
- **Method**: DELETE
- **Endpoint**: `/api/lists`
- **Description**: Delete multiple lists or all lists

**Request Body:**
```json
{
  "listIds": ["string"] (array of list IDs to delete),
  "deleteAll": "boolean (delete all lists for organization)"
}
```

### Get List Survey Data
- **Method**: GET
- **Endpoint**: `/api/lists/{listId}/survey`
- **Description**: Get survey data for a list

**Path Parameters:**
- `listId` (string, required): The list ID

**Query Parameters:**
- `profileId` (string, optional): Template survey data for specific profile

## Common Data Types

### Check-in/Check-out Methods
- `TAP`: NFC tap
- `QR`: QR code scan
- `MANUAL`: Manual entry
- `KIOSK`: Kiosk check-in
- `SMS`: SMS-based
- `EMAIL`: Email-based
- `VOICE`: Voice call
- `BROWSER`: Web browser
- `MOBILE_APP`: Mobile application

### Date/Time Format
- All dates are converted to Unix timestamps (seconds since epoch)
- Input dates should be in ISO format and will be converted automatically
- Time zones should be in IANA format (e.g., "America/Chicago")

### GPS Coordinates
```json
{
  "lat": "number (latitude)",
  "lng": "number (longitude)"
}
```

### Pagination
- Most endpoints support pagination with `limit`/`skip` or `page`/`pageSize` parameters
- Default limits vary by endpoint (typically 50-100 items)
- Use `returnAll: true` in the node to automatically paginate through all results

### Error Handling
- API returns standard HTTP status codes
- Error responses include descriptive messages
- The node supports `continueOnFail` for error tolerance
