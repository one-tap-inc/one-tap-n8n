# Complete Guide: Using OneTap Trigger & Webhook Manager in n8n

## Overview

You have **two powerful OneTap nodes** that work together to create real-time automation workflows:

- **OneTap Trigger**: Starts workflows when events happen (check-ins, new participants, etc.)
- **OneTap Webhook Manager**: Automatically registers webhooks with OneTap for real-time notifications

## Installation & Setup

### 1. Install the OneTap Community Node Package
```bash
# In your n8n instance
npm install n8n-nodes-onetap

# Or if using n8n cloud/desktop, install via the community nodes section
```

### 2. Configure OneTap Credentials
1. **Get your OneTap API Key**:
   - Log into your OneTap dashboard
   - Go to Settings → API
   - Copy your API key

2. **Add credentials in n8n**:
   - Go to Settings → Credentials
   - Click "Add Credential"
   - Search for "OneTap API"
   - Enter your API key
   - Test and save

## Using OneTap Trigger Node

### Basic Configuration

1. **Add the node**: Search for "OneTap Trigger" and add to your workflow
2. **Select credentials**: Choose your OneTap API credentials
3. **Configure trigger settings**:

#### Core Settings:
- **Environment**: Production or Staging
- **Trigger On**: What event to listen for
  - `Check-in` - When someone checks in
  - `Check-out` - When someone checks out  
  - `New Participant` - When a participant is created
  - `Profile Created` - When a new profile is created
- **Trigger Method**: How to listen
  - `Polling` - Check API regularly (recommended for beginners)
  - `Webhook` - Real-time notifications (requires webhook setup)

#### Optional Filters:
- **List ID**: Only trigger for specific lists
- **Profile ID**: Only trigger for specific profiles
- **Additional Filters**:
  - **Method**: Filter by check-in method (TAP, QR, Manual, etc.)
  - **Source**: Filter by source identifier

### Polling Mode Example

```
┌─────────────────────────────┐
│ OneTap Trigger              │
│ • Trigger On: Check-in      │
│ • Method: Polling           │
│ • Poll Interval: 5 minutes  │
│ • List ID: list_123         │
└─────────────────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ Email Node                  │
│ Send welcome email to       │
│ {{ $json.profile.email }}   │
└─────────────────────────────┘
```

### Webhook Mode Example

**Step 1: Create Main Workflow**
```
┌─────────────────────────────┐
│ OneTap Trigger              │
│ • Trigger On: Check-in      │
│ • Method: Webhook           │
│ • List ID: (optional)       │
└─────────────────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ Slack Node                  │
│ "{{$json.profile.name}}     │
│ just checked in!"           │
└─────────────────────────────┘
```

**Step 2: Copy webhook URL** from the trigger node (appears when you save)

**Step 3: Register webhook** (see Webhook Manager section below)

## Using OneTap Webhook Manager Node

### Operations Available

1. **Register Webhook** - Set up new webhook
2. **List Webhooks** - See all registered webhooks
3. **Update Webhook** - Modify existing webhook
4. **Unregister Webhook** - Remove webhook

### Registering a Webhook

#### Configuration:
- **Operation**: Register Webhook
- **Webhook URL**: The URL from your OneTap Trigger node
- **Events**: Select which events to listen for
  - `participant.checkin` - Check-ins
  - `participant.checkout` - Check-outs
  - `participant.created` - New participants
  - `profile.created` - New profiles
  - `*` - All events (wildcard)

#### Additional Settings:
- **Webhook Name**: Descriptive name (e.g., "n8n-checkin-notifications")
- **Description**: Purpose description
- **Active**: Enable/disable webhook
- **Secret**: Optional security secret for verification

### Example Webhook Registration Workflow

```
┌─────────────────────────────┐
│ Manual Trigger              │
│ (Execute once to register)  │
└─────────────────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ OneTap Webhook Manager      │
│ • Operation: Register       │
│ • URL: [from trigger node]  │
│ • Events: participant.checkin│
│ • Name: "Check-in Webhook"  │
└─────────────────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ Set Node                    │
│ Store Integration ID for    │
│ later cleanup               │
└─────────────────────────────┘
```

## Complete Real-World Examples

### Example 1: Real-time Check-in Notifications

**Main Workflow** (Always Active):
```
┌─────────────────────────────┐
│ OneTap Trigger              │
│ • Check-in + Webhook mode   │
└─────────────────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ IF Node                     │
│ {{ $json.checkInMethod }}   │
│ equals "QR"                 │
└─────────────────────────────┘
           │
        ┌──┴──┐
       YES    NO
        │      │
        ▼      ▼
┌──────────┐ ┌──────────┐
│Slack:    │ │Email:    │
│"QR scan  │ │"Manual   │
│check-in" │ │check-in" │
└──────────┘ └──────────┘
```

**Setup Workflow** (Run Once):
```
┌─────────────────────────────┐
│ Manual Trigger              │
└─────────────────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ OneTap Webhook Manager      │
│ • Register Webhook          │
│ • URL: [main workflow URL]  │
│ • Events: participant.checkin│
└─────────────────────────────┘
```

### Example 2: Attendance Tracking System

**Main Workflow**:
```
┌─────────────────────────────┐
│ OneTap Trigger              │
│ • Check-in + Polling mode   │
│ • Poll every 2 minutes      │
└─────────────────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ Google Sheets               │
│ Add row with:               │
│ • Name: {{$json.profile.name}}
│ • Time: {{$json.checkInDate}}
│ • Method: {{$json.checkInMethod}}
└─────────────────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ Email                       │
│ Send confirmation to        │
│ {{$json.profile.email}}     │
└─────────────────────────────┘
```

### Example 3: New Member Onboarding

```
┌─────────────────────────────┐
│ OneTap Trigger              │
│ • New Participant + Webhook │
└─────────────────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ Airtable                    │
│ Create new member record    │
└─────────────────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ Mailchimp                   │
│ Add to welcome email series │
└─────────────────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ Slack                       │
│ Notify admin team           │
└─────────────────────────────┘
```

## Data Structure Reference

### Trigger Output Data

When the OneTap Trigger fires, it provides this data structure:

```json
{
  "participantId": "participant_123",
  "profileId": "profile_456",
  "listId": "list_789",
  "checkInDate": 1640995200,
  "checkInMethod": "QR",
  "checkOutDate": null,
  "profile": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "avatarUrl": "https://...",
    "customFields": {
      "company": "Acme Corp",
      "role": "Developer"
    }
  },
  "list": {
    "name": "Weekly Team Meeting",
    "date": 1640995200,
    "location": "Conference Room A"
  },
  "triggerType": "checkin",
  "environment": "production",
  "triggeredAt": 1640995200
}
```

### Webhook Manager Output Data

```json
{
  "success": true,
  "operation": "register",
  "environment": "production",
  "integrationId": "int_abc123",
  "apiKey": "key_xyz789",
  "webhookUrl": "https://your-n8n.com/webhook/...",
  "events": ["participant.checkin"],
  "name": "n8n Integration",
  "description": "Webhook integration created from n8n"
}
```

## Event Type Mapping

| Trigger "Trigger On" | Webhook Manager "Events" | Description |
|---------------------|--------------------------|-------------|
| Check-in | `participant.checkin` | Someone checked in |
| Check-out | `participant.checkout` | Someone checked out |
| New Participant | `participant.created` | New participant added |
| Profile Created | `profile.created` | New profile created |

## Best Practices

### 1. Webhook vs Polling Decision Tree

**Use Webhooks when**:
- ✅ You need real-time processing (< 30 seconds)
- ✅ You have high-volume events
- ✅ You want to minimize API calls
- ✅ Your n8n instance is publicly accessible

**Use Polling when**:
- ✅ You're just getting started (easier setup)
- ✅ Your n8n instance is behind a firewall
- ✅ Events are infrequent (< 10 per hour)
- ✅ You want simpler troubleshooting

### 2. Webhook Management

```
Setup Workflow Pattern:
1. Manual Trigger
2. OneTap Webhook Manager (Register)
3. Set Node (store Integration ID)
4. Optional: Store ID in database/file

Cleanup Workflow Pattern:
1. Manual Trigger  
2. OneTap Webhook Manager (List) [find your webhook]
3. OneTap Webhook Manager (Unregister) [clean up]
```

### 3. Error Handling

Add error handling to your workflows:

```
OneTap Trigger → [Your Logic] → [Error Trigger]
                       ↓
               ┌───────────────┐
               │ Error Handler │
               │ • Log error   │ 
               │ • Send alert  │
               │ • Retry logic │
               └───────────────┘
```

### 4. Testing Strategy

1. **Start with Polling**: Test your workflow logic first
2. **Use Staging Environment**: Test with staging OneTap data
3. **Test Filters**: Verify your filters work correctly
4. **Monitor Logs**: Check n8n execution logs regularly
5. **Gradual Rollout**: Start with one event type, expand slowly

### 5. Security

- **Use Webhook Secrets**: Always set secrets for webhook verification
- **Environment Separation**: Use different credentials for staging/production
- **API Key Security**: Store OneTap API keys securely in n8n credentials
- **Rate Limiting**: Be mindful of OneTap API rate limits

## Troubleshooting

### Trigger Not Firing

**Polling Mode**:
1. Check OneTap credentials
2. Verify API permissions
3. Check if events exist in the time window
4. Review poll interval settings

**Webhook Mode**:
1. Verify webhook registration with "List Webhooks"
2. Check if webhook URL is accessible
3. Review event type mapping
4. Check OneTap webhook delivery logs

### Common Issues

| Problem | Solution |
|---------|----------|
| No webhook URL showing | Save and activate the workflow first |
| "Failed to register webhook" | Check API credentials and permissions |
| Duplicate events | Ensure only one webhook per event type |
| Missing events | Check filters and event type mapping |
| Webhook registration fails | Verify n8n instance is publicly accessible |

### Debugging Tips

1. **Use "List Webhooks"** to see all registered webhooks
2. **Check n8n execution logs** for detailed error messages
3. **Test with manual check-ins** in OneTap dashboard
4. **Use simple workflows first** before adding complex logic
5. **Enable "Continue on Fail"** for production workflows

## Quick Start Checklist

- [ ] Install OneTap community node package
- [ ] Configure OneTap API credentials in n8n
- [ ] Create test workflow with OneTap Trigger (polling mode)
- [ ] Test with real check-in event
- [ ] If needed, set up webhook with Webhook Manager
- [ ] Add your business logic (email, slack, database, etc.)
- [ ] Test thoroughly before going live
- [ ] Set up monitoring and error handling

This should give you everything you need to start using both OneTap nodes effectively in n8n! The key is starting simple with polling mode, then advancing to webhooks as your needs grow.
