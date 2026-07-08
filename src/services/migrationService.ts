import { BASE_URL, apiClient } from '../config/api';

export interface MigrationReportPayload {
  reportId: string;
  reportName: string;
  datasetId?: string;
  workspaceId: string;
  isDashboard?: boolean;
}

export interface MigrationSuccessResult {
  success: boolean;
  reportName: string;
  domoCardId: string;
  domoCardUrl: string;
  message: string;
}

/**
 * Initiates the PowerBI to Domo migration process for the given report.
 */
export async function startMigration(report: MigrationReportPayload): Promise<MigrationSuccessResult> {
  return apiClient.post<MigrationSuccessResult>('/api/migration/start', report);
}

/**
 * Subscribes to the Server-Sent Events status stream for a given report migration process.
 */
export function subscribeToMigrationStatus(
  reportId: string,
  onUpdate: (state: { status: string; progress?: number }) => void,
  onComplete: (result: MigrationSuccessResult) => void,
  onError: (errorMsg: string) => void
) {
  const eventSource = new EventSource(`${BASE_URL}/api/migration/status/${reportId}`);

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.status === 'complete') {
        onComplete(data as MigrationSuccessResult);
        eventSource.close();
      } else if (data.status === 'error') {
        onError(data.message || 'Migration encountered an error.');
        eventSource.close();
      } else {
        onUpdate(data);
      }
    } catch (err) {
      onError('Failed to parse progress stream payload.');
      eventSource.close();
    }
  };

  eventSource.onerror = (err) => {
    console.error(`[SSE ERROR] EventSource failed for report ${reportId}:`, err);
    onError('Status stream disconnected or failed to connect.');
    eventSource.close();
  };

  return {
    close: () => {
      console.log(`[SSE CLOSE] Closing status listener for report ${reportId}`);
      eventSource.close();
    }
  };
}

export async function stopMigration(reportId: string): Promise<any> {
  return apiClient.post('/api/migration/stop', { reportId });
}
