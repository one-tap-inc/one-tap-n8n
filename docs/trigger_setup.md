# OneTap Trigger Node Setup

The OneTap Trigger node allows you to automatically start workflows when specific events occur in your OneTap system, such as check-ins, check-outs, new participants, or new profiles.

## Features

- **Multiple Trigger Types**: Listen for check-ins, check-outs, new participants, or new profiles
- **Two Methods**: Polling (recommended) or Webhooks
- **Filtering**: Filter events by list ID, profile ID, method, or source
- **Real-time Processing**: Process events as they happen

## Setup Instructions

### 1. Add the Trigger Node
1. In your n8n workflow, add the "OneTap Trigger" node
2. Configure your OneTap credentials (same as the regular OneTap node)

### 2. Configure Trigger Settings

#### Trigger On
Choose what event should trigger your workflow:
- **Check-in**: When a participant checks in
- **Check-out**: When a participant checks out  
- **New Participant**: When a new participant is created
- **Profile Created**: When a new profile is created

#### Trigger Method
- **Polling** (Recommended): The node will regularly check the OneTap API for new events
  - Set the poll interval (1-60 minutes)
  - More reliable but uses API calls regularly
- **Webhook**: Listen for webhook calls from OneTap
  - Instant notifications
  - Requires webhook registration with OneTap (use OneTap Webhook Manager node)

### 3. Add Filters (Optional)

#### Basic Filters
- **List ID**: Only trigger for events from a specific list
- **Profile ID**: Only trigger for events from a specific profile (check-ins/check-outs only)

#### Additional Filters
- **Method**: Filter by check-in/check-out method (TAP, QR, Manual, etc.)
- **Source**: Filter by event source

### 4. Setting Up Webhooks (Optional)

If you want to use webhook mode for instant notifications:

1. **Create a Webhook Trigger**:
   - Add "OneTap Trigger" node set to "Webhook" mode
   - Save and activate the workflow to get the webhook URL

2. **Register the Webhook**:
   - Add "OneTap Webhook Manager" node 
   - Set operation to "Register Webhook"
   - Enter the webhook URL from step 1
   - Select events (e.g., "Check-in")
   - Configure any filters (list ID, etc.)
   - Execute to register with OneTap

3. **Your webhook is now active** and will receive real-time events!

### 5. Example Workflow Setup

#### For Check-in Notifications (Polling):
1. OneTap Trigger (Check-in, Polling mode)
2. Email/Slack node to send notification
3. Optional: Filter or process the check-in data

#### For Check-in Notifications (Webhook):
1. OneTap Trigger (Check-in, Webhook mode)
2. Email/Slack node to send notification
3. Optional: OneTap Webhook Manager to register/unregister

#### For Attendance Tracking:
1. OneTap Trigger (Check-in)
2. Google Sheets node to log attendance
3. Optional: Send confirmation email

## Trigger Data Structure

The trigger node outputs the following data:

```json
{
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
  },
  "triggerType": "checkin",
  "triggeredAt": 1640995200
}
```

## Best Practices

1. **Choose the Right Method**: 
   - Use **Polling** for reliability and simplicity
   - Use **Webhooks** for real-time processing and reduced API calls
2. **Set Appropriate Intervals**: For polling, 5-10 minutes is usually sufficient for check-ins
3. **Manage Webhooks Properly**: Use the Webhook Manager to register/unregister webhooks cleanly
4. **Add Error Handling**: Use error nodes to handle API failures gracefully
5. **Filter Early**: Use the built-in filters to reduce unnecessary workflow executions
6. **Test Thoroughly**: Test your trigger with actual check-ins before going live
7. **Clean Up**: Always unregister webhooks when workflows are no longer needed

## Troubleshooting

### Trigger Not Firing
- Check your OneTap credentials
- Verify the API permissions
- Ensure the poll interval isn't too long
- Check if there are actually new events in the time window

### Missing Events
- Reduce the poll interval
- Check if filters are too restrictive
- Verify the timestamp filtering is working correctly

### Too Many Triggers
- Increase the poll interval
- Add more specific filters
- Consider processing events in batches

### Webhook Issues
- **Webhook not receiving events**: Check if webhook is properly registered using Webhook Manager "List" operation
- **Duplicate events**: Ensure only one webhook is registered for the same events
- **Webhook registration fails**: Verify OneTap credentials and API permissions
- **Old webhooks**: Use Webhook Manager to list and clean up unused webhooks

## API Rate Limits

Be mindful of OneTap's API rate limits when setting poll intervals. If you have multiple trigger nodes or high-frequency events, consider:
- Using longer poll intervals
- Consolidating multiple triggers into one
- Implementing exponential backoff for errors 