# n8n-nodes-onetap

![OneTap Logo](https://onetapcheckin.com/assets/logo.png)

An n8n community node for integrating with [OneTap](https://onetapcheckin.com) - a powerful visitor management and check-in system.

## Features

- **Profile Management**: Get and update visitor profiles
- **Advanced Search**: Search profiles by name, email, or phone number
- **Flexible Filtering**: Filter by favorite status and custom criteria
- **Pagination Support**: Handle large datasets efficiently
- **Custom Fields**: Support for dynamic custom field values
- **Check-in Codes**: Manage unique alphanumeric check-in codes

## Installation

To install this community node in n8n:

1. Go to **Settings** → **Community Nodes**
2. Click **Install a community node**
3. Enter `n8n-nodes-onetap`
4. Click **Install**

Alternatively, you can install it via npm in your n8n installation:

```bash
npm install n8n-nodes-onetap
```

## Configuration

### Credentials

To use this node, you need to configure your OneTap API credentials:

1. In n8n, go to **Credentials** → **Add Credential**
2. Search for **OneTap API**
3. Enter your **API Key** (obtainable from your OneTap dashboard)
4. Test the connection

### API Documentation

For detailed API information, visit: [https://apidocs.onetapcheckin.io](https://apidocs.onetapcheckin.io)

## Operations

### Profile Resource

#### Get All Profiles
- **Description**: Retrieve all visitor profiles with filtering and search capabilities
- **Parameters**:
  - **Return All**: Whether to return all results or use pagination
  - **Page**: Page number for pagination (when Return All is false)
  - **Page Size**: Number of profiles per page (1-100)
  - **Search**: Search by name, email, or phone number
  - **Sort By**: Sort by name, email, or creation date
  - **Sort Order**: Ascending or descending order
  - **Favorite**: Filter by favorite status

#### Update Profile
- **Description**: Update an existing visitor profile
- **Parameters**:
  - **Profile ID**: The unique identifier of the profile to update
  - **Update Fields**:
    - Name
    - Email
    - Phone
    - Address
    - Notes
    - Favorite status
    - Check-in Code
    - Custom Fields (with support for various data types)

## Usage Examples

### Search for Profiles
```json
{
  "resource": "profile",
  "operation": "getAll",
  "additionalFields": {
    "search": "john@example.com",
    "sortBy": "name",
    "sortOrder": "asc"
  }
}
```

### Update Profile Information
```json
{
  "resource": "profile",
  "operation": "update",
  "profileId": "123456",
  "updateFields": {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "1234567890",
    "favorite": true,
    "customFields": {
      "customField": [
        {
          "name": "employeeId",
          "type": "string",
          "value": "EMP001"
        }
      ]
    }
  }
}
```

## Authentication

This node uses API Key authentication. The API key is sent via the `X-API-Key` header to the OneTap API.

## API Endpoint

The node connects to: `https://api-beta.onetapcheckin.com`

## Version

Current version: **0.1.0**

## License

MIT

## Support

For support and questions:
- **OneTap Support**: hello@onetapcheckin.com
- **Node Issues**: Please report issues on the GitHub repository
- **n8n Community**: Join the [n8n community](https://community.n8n.io/) for general n8n support

## Contributing

Contributions are welcome! Please feel free to submit pull requests or report issues.
