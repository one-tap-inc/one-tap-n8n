# OneTap Webhook Setup Guide

This guide shows you how to set up real-time webhooks with OneTap using the OneTap Webhook Manager and OneTap Trigger nodes.

## Overview

OneTap supports webhooks through their **Organization Integrations** system. This allows you to receive real-time notifications when events happen in your OneTap organization.

## Step-by-Step Setup

### Step 1: Create Your Webhook Trigger Workflow

1. **Create a new workflow** in n8n
2. **Add the "OneTap Trigger" node**
3. **Configure the trigger**:
   - **Trigger On**: Select the event you want (e.g., "Check-in")
   - **Trigger Method**: Select "Webhook"
   - Add any filters you need (List ID, Profile ID, etc.)
4. **Save and activate** the workflow
5. **Copy the webhook URL** from the trigger node

### Step 2: Register the Webhook with OneTap

1. **Create a setup workflow** (separate from your main workflow)
2. **Add the "OneTap Webhook Manager" node**
3. **Configure the webhook registration**:
   - **Operation**: "Register Webhook"
   - **Webhook URL**: Paste the URL from Step 1
   - **Events**: Select the events that match your trigger
   - **Additional Settings**: Configure name, description, etc.
4. **Execute the node** to register the webhook
5. **Note the Integration ID** from the response (you'll need this later)

### Step 3: Test Your Webhook

1. **Trigger a test event** in OneTap (e.g., check someone in)
2. **Check your main workflow** - it should execute automatically
3. **Review the webhook data** in the execution log

## Event Mapping

When setting up webhooks, you need to match the trigger events with webhook events:

| Trigger "Trigger On" | Webhook "Events" | Description |
|---------------------|------------------|-------------|
| Check-in | `participant.checkin` | Participant checked in |
| Check-out | `participant.checkout` | Participant checked out |
| New Participant | `participant.created` | New participant added |
| Profile Created | `profile.created` | New profile created |

## Example Webhook Registration

```json
{
  "name": "n8n Check-in Notifications",
  "description": "Send notifications when participants check in",
  "webhookSettings": {
    "url": "https://your-n8n.com/webhook/abc123def456",
    "events": ["participant.checkin"],
    "isActive": true,
    "headers": {
      "X-Webhook-Secret": "your-secret-key"
    }
  }
}
```

## Webhook Data Format

When a webhook is triggered, OneTap sends data like this:

```json
{
  "event": "participant.checkin",
  "data": {
    "participantId": "participant_123",
    "profileId": "profile_456",
    "listId": "list_789",
    "checkInDate": 1640995200,
    "checkInMethod": "QR",
    "profile": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890"
    },
    "list": {
      "name": "Weekly Meeting",
      "date": 1640995200
    }
  },
  "timestamp": 1640995200,
  "organizationId": "org_123"
}
```

## Managing Webhooks

### List All Webhooks
```
Operation: List Webhooks
```
This shows all integrations with their webhook settings.

### Update a Webhook
```
Operation: Update Webhook
Integration ID: int_123
Webhook URL: https://new-url.com/webhook
Events: ["participant.checkin", "participant.checkout"]
```

### Unregister a Webhook
```
Operation: Unregister Webhook  
Integration ID: int_123
```

**Important**: Always unregister webhooks when you're done to avoid unnecessary API calls.

## Complete Example Workflows

### Example 1: Check-in Notifications

**Main Workflow (Webhook Receiver)**:
```
1. OneTap Trigger (Check-in, Webhook mode)
2. Set Variables (extract participant data)
3. Slack (send notification)
4. Google Sheets (log attendance)
```

**Setup Workflow (One-time)**:
```
1. Manual Trigger
2. OneTap Webhook Manager (Register)
   - URL: [from main workflow]
   - Events: ["participant.checkin"]
   - Name: "Check-in Notifications"
```

### Example 2: Profile Management

**Main Workflow**:
```
1. OneTap Trigger (Profile Created, Webhook mode) 
2. CRM Node (create contact)
3. Email (welcome message)
```

**Setup Workflow**:
```
1. Manual Trigger
2. OneTap Webhook Manager (Register)
   - Events: ["profile.created"]
   - Name: "New Profile Integration"
```

## Best Practices

### Security
- **Use webhook secrets** for signature verification
- **Validate webhook data** before processing
- **Use HTTPS URLs** only (required by OneTap)

### Reliability
- **Handle webhook failures gracefully** (OneTap will retry)
- **Process webhooks quickly** (respond within 30 seconds)
- **Use idempotency** to handle duplicate events

### Management
- **Name your integrations clearly** for easy identification
- **Document your webhook endpoints** and their purposes
- **Clean up unused webhooks** to avoid clutter

## Troubleshooting

### Webhook Not Receiving Events
1. **Check integration status**: Use "List Webhooks" to verify it's active
2. **Verify webhook URL**: Ensure the URL is correct and accessible
3. **Check event types**: Make sure webhook events match your trigger
4. **Test connectivity**: OneTap must be able to reach your n8n instance

### Duplicate Events
1. **Check for multiple integrations**: Only one webhook per event type
2. **Implement idempotency**: Handle the same event ID multiple times
3. **Use webhook secrets**: Verify authenticity of incoming requests

### Webhook Registration Fails
1. **Check credentials**: Verify OneTap API credentials
2. **Validate URL**: Must be a valid HTTPS URL
3. **Check permissions**: Ensure user has integration permissions

### Missing Events
1. **Check filters**: Webhook filters may be too restrictive
2. **Verify event names**: Ensure correct event name format
3. **Check OneTap logs**: Look for webhook delivery failures in OneTap

## API Endpoints Reference

| Operation | Method | Endpoint |
|-----------|--------|----------|
| Register | POST | `/api/organization/integrations` |
| List | GET | `/api/organization/integrations` |
| Get Details | GET | `/api/organization/integrations/:id` |
| Update | PUT | `/api/organization/integrations/:id` |
| Delete | DELETE | `/api/organization/integrations/:id` |

## Rate Limits

- No specific webhook rate limits documented
- OneTap will retry failed webhooks with exponential backoff
- Recommend responding to webhooks within 5-30 seconds

## Advanced Configuration

### Custom Headers
```json
{
  "webhookSettings": {
    "headers": {
      "Authorization": "Bearer your-token",
      "X-Webhook-Secret": "your-secret",
      "Content-Type": "application/json"
    }
  }
}
```

### Event Filtering
- Use `*` for all events (wildcard)
- Combine multiple specific events: `["participant.checkin", "participant.checkout"]`
- Profile events: `["profile.created", "profile.updated", "profile.deleted"]`
- List events: `["list.created", "list.updated", "list.deleted"]`

### Webhook Verification
```javascript
// Example webhook signature verification
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
``` 