# SimplixGymRewards Firebase Cloud Functions

This directory contains the Firebase Cloud Functions for the SimplixGymRewards application.

## Available Functions

### 1. getDisplayToken (HTTP Trigger)

Authentication function that generates a custom token for display authentication.

- **Trigger**: HTTP Request
- **Path**: `/getDisplayToken`
- **Method**: POST
- **Parameters**:
  - `displayId`: ID of the display
  - `securityKey`: Security key for validation

### 2. cleanupOrphanedDisplays (Scheduled)

Automatically cleans up orphaned display connections in the Firebase Realtime Database.

- **Trigger**: Scheduled, runs every 5 minutes
- **Functionality**:
  - Fetches all entries from the `displays` node in the Realtime Database
  - Checks each entry's `lastUpdated` timestamp
  - Removes entries that haven't been updated in the last 60 seconds
  - Logs the number of orphaned connections cleaned up

## Deployment

To deploy these functions, run:

```bash
firebase deploy --only functions
```

## Monitoring

You can monitor the execution of these functions in the Firebase Console under "Functions" and check the logs for details about the cleanup operations. 