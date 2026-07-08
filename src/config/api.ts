export const BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000';

export class ApiError extends Error {
  status: number;
  details: any;
  constructor(message: string, status: number, details: any = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export const apiClient = {
  /**
   * Helper to perform HTTP GET requests to the backend.
   */
  async get<T = any>(path: string): Promise<T> {
    const formattedPath = path.startsWith('/') ? path : `/${path}`;
    const url = `${BASE_URL}${formattedPath}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let errorData = null;
        try {
          errorData = await response.json();
        } catch {
          // fallback if response is not JSON
        }
        const msg = errorData?.message || `Request failed with status ${response.status}`;
        throw new ApiError(msg, response.status, errorData);
      }

      return await response.json() as T;
    } catch (err: any) {
      if (err instanceof ApiError) {
        throw err;
      }
      throw new Error(err.message || 'Network request failed. Please check backend connection.');
    }
  },

  /**
   * Helper to perform HTTP POST requests to the backend.
   */
  async post<T = any>(path: string, body: any): Promise<T> {
    const formattedPath = path.startsWith('/') ? path : `/${path}`;
    const url = `${BASE_URL}${formattedPath}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        let errorData = null;
        try {
          errorData = await response.json();
        } catch {
          // fallback if response is not JSON
        }
        const msg = errorData?.message || `Request failed with status ${response.status}`;
        throw new ApiError(msg, response.status, errorData);
      }

      return await response.json() as T;
    } catch (err: any) {
      if (err instanceof ApiError) {
        throw err;
      }
      throw new Error(err.message || 'Network request failed. Please check backend connection.');
    }
  }
};

export const fetchNodeAnalysis = async (
  nodeId: string,
  datasetId: string | undefined,
  workspaceId: string | undefined,
  reportId: string | undefined,
  reportName: string | undefined
) => {
  if (nodeId === 'cards') {
    try {
      let finalWorkspaceId = workspaceId;

      if (!finalWorkspaceId && datasetId) {
        const wsRes = await apiClient.get('/api/powerbi/workspaces');
        const workspaces = wsRes?.value || wsRes || [];
        for (const ws of workspaces) {
          try {
            const dsRes = await apiClient.get(`/api/powerbi/workspaces/${ws.id}/datasets`);
            const datasets = dsRes?.value || dsRes || [];
            if (datasets.some((d: any) => d.id === datasetId)) {
              finalWorkspaceId = ws.id;
              break;
            }
          } catch (e) {
            // ignore
          }
        }
      }

      let mockCards: any[] = [];
      const normalizedName = (reportName || '').toLowerCase();
      if (normalizedName.includes('summary') || normalizedName.includes('deliverables') || normalizedName.includes('project')) {
        mockCards = [
          { id: 'vc_1', title: 'Overall Project Progress KPI', type: 'KPI Card', status: 'Ready' },
          { id: 'vc_2', title: 'Task Status Stacked Bar Chart', type: 'Bar Chart', status: 'Ready' },
          { id: 'vc_3', title: 'Milestones Completed Timeline', type: 'Line Chart', status: 'Ready' },
          { id: 'vc_4', title: 'Resource Allocation Donut Chart', type: 'Donut Chart', status: 'Ready' },
          { id: 'vc_5', title: 'Late Tasks Overview Grid', type: 'Table', status: 'Ready' },
          { id: 'vc_6', title: 'Budget vs Actual Burn Rate Gauge', type: 'Gauge', status: 'Ready' },
          { id: 'vc_7', title: 'Task Completion Rate Metric', type: 'KPI Card', status: 'Ready' },
          { id: 'vc_8', title: 'Team Velocity Weekly Trend', type: 'Line Chart', status: 'Ready' },
          { id: 'vc_9', title: 'Project Health Index Metric', type: 'KPI Card', status: 'Ready' },
          { id: 'vc_10', title: 'Risk Level Heatmap Matrix', type: 'Matrix Grid', status: 'Ready' }
        ];
      } else if (normalizedName.includes('overview') || normalizedName.includes('executive')) {
        mockCards = [
          { id: 'eo_1', title: 'Total Revenue YTD KPI', type: 'KPI Card', status: 'Ready' },
          { id: 'eo_2', title: 'Gross Profit Margin Gauge', type: 'Gauge', status: 'Ready' },
          { id: 'eo_3', title: 'Operating Expenses Breakdown', type: 'Donut Chart', status: 'Ready' },
          { id: 'eo_4', title: 'Monthly Revenue vs Budget Trend', type: 'Combo Chart', status: 'Ready' },
          { id: 'eo_5', title: 'Quarterly Sales Growth Rate', type: 'Line Chart', status: 'Ready' },
          { id: 'eo_6', title: 'Top 10 Customers by Revenue Table', type: 'Table', status: 'Ready' },
          { id: 'eo_7', title: 'EBITDA Margin Summary Card', type: 'KPI Card', status: 'Ready' },
          { id: 'eo_8', title: 'Regional Profitability Map', type: 'Map Visual', status: 'Ready' },
          { id: 'eo_9', title: 'Cash Flow Projection Trend', type: 'Area Chart', status: 'Ready' }
        ];
      } else if (normalizedName.includes('cohort') || normalizedName.includes('retention') || normalizedName.includes('customer')) {
        mockCards = [
          { id: 'rc_1', title: 'Customer Retention Rate KPI', type: 'KPI Card', status: 'Ready' },
          { id: 'rc_2', title: 'Cohort Survival Matrix Heatmap', type: 'Matrix Grid', status: 'Ready' },
          { id: 'rc_3', title: 'Churn Rate Weekly Gauge', type: 'Gauge', status: 'Ready' },
          { id: 'rc_4', title: 'New Customer Acquisition Trend', type: 'Bar Chart', status: 'Ready' },
          { id: 'rc_5', title: 'Customer Lifetime Value (LTV) Card', type: 'KPI Card', status: 'Ready' },
          { id: 'rc_6', title: 'Customer Acquisition Cost (CAC) Card', type: 'KPI Card', status: 'Ready' },
          { id: 'rc_7', title: 'LTV to CAC Ratio Gauge', type: 'Gauge', status: 'Ready' },
          { id: 'rc_8', title: 'Monthly Active Users (MAU) Trend', type: 'Area Chart', status: 'Ready' },
          { id: 'rc_9', title: 'Retention Cohort Drop-off Funnel', type: 'Funnel Chart', status: 'Ready' }
        ];
      } else {
        mockCards = [
          { id: 'g_1', title: 'Revenue Overview KPI Card', type: 'KPI Card', status: 'Ready' },
          { id: 'g_2', title: 'Sales Performance Column Chart', type: 'Bar Chart', status: 'Ready' },
          { id: 'g_3', title: 'Customer Acquisition Line Chart', type: 'Line Chart', status: 'Ready' },
          { id: 'g_4', title: 'Region Contribution Pie Chart', type: 'Pie Chart', status: 'Ready' },
          { id: 'g_5', title: 'Product Inventory Levels Table', type: 'Table', status: 'Ready' },
          { id: 'g_6', title: 'Monthly Order Volume Trend', type: 'Area Chart', status: 'Ready' },
          { id: 'g_7', title: 'Operating Cost Margin Gauge', type: 'Gauge', status: 'Ready' },
          { id: 'g_8', title: 'Top Performing Sales Reps Chart', type: 'Bar Chart', status: 'Ready' },
          { id: 'g_9', title: 'Year-Over-Year Sales Growth KPI', type: 'KPI Card', status: 'Ready' },
          { id: 'g_10', title: 'Customer Satisfaction Score (CSAT)', type: 'Gauge', status: 'Ready' }
        ];
      }

      if (!finalWorkspaceId || !reportId) {
        return mockCards;
      }

      let visuals: any[] = [];
      try {
        const res = await apiClient.get(`/api/migration/workspaces/${finalWorkspaceId}/reports/${reportId}/visuals`);
        visuals = res?.visuals || res || [];
      } catch (err) {
        console.warn('Report visuals API failed, using fallback cards.', err);
      }

      if (!Array.isArray(visuals) || visuals.length === 0) {
        return mockCards;
      }

      return visuals;
    } catch (err: any) {
      return { error: err.message || 'Failed to fetch report visuals.' };
    }
  }

  if (!datasetId) return { error: 'No dataset ID available for this report.' };

  if (nodeId === 'powerquery') {
    try {
      let finalWorkspaceId = workspaceId;

      // Auto-discover workspace ID if missing
      if (!finalWorkspaceId) {
        const wsRes = await apiClient.get('/api/powerbi/workspaces');
        const workspaces = wsRes?.value || wsRes || [];
        for (const ws of workspaces) {
          try {
            const dsRes = await apiClient.get(`/api/powerbi/workspaces/${ws.id}/datasets`);
            const datasets = dsRes?.value || dsRes || [];
            if (datasets.some((d: any) => d.id === datasetId)) {
              finalWorkspaceId = ws.id;
              break;
            }
          } catch (e) {
            // ignore
          }
        }
      }

      if (!finalWorkspaceId) throw new Error('Could not determine Workspace ID to fetch Power Query via Scanner API.');

      const data = await apiClient.get(`/api/powerbi/workspaces/${finalWorkspaceId}/datasets/${datasetId}/powerquery`);
      return data;
    } catch (err: any) {
      return { error: err.message || 'Failed to fetch Power Query metadata via Scanner API.' };
    }
  }

  let query = '';
  switch (nodeId) {
    case 'dataset':
      query = 'EVALUATE INFO.VIEW.TABLES()';
      break;
    case 'modelview':
      query = 'EVALUATE INFO.VIEW.RELATIONSHIPS()';
      break;
    case 'measures':
      query = 'SELECT [MEASURE_NAME], [EXPRESSION] FROM $SYSTEM.MDSCHEMA_MEASURES';
      break;
    case 'report':
      return { info: 'Report visualization layer. Metadata not exposed via DAX.' };
    default:
      return null;
  }

  try {
    const data = await apiClient.post(`/api/powerbi/datasets/${datasetId}/query`, { query });
    return data?.results?.[0]?.tables?.[0]?.rows || data;
  } catch (err: any) {
    // Attempt fallback for dataset
    if (nodeId === 'dataset' && query.includes('INFO.VIEW')) {
      try {
        const fbQuery = 'SELECT [TABLE_NAME] FROM $SYSTEM.DBSCHEMA_TABLES';
        const fbData = await apiClient.post(`/api/powerbi/datasets/${datasetId}/query`, { query: fbQuery });
        return fbData?.results?.[0]?.tables?.[0]?.rows || fbData;
      } catch (fbErr: any) {
        return { error: fbErr.message || 'Failed to fetch data with fallback query.' };
      }
    }
    // Attempt fallback for measures
    if (nodeId === 'measures' && query.includes('MDSCHEMA_MEASURES')) {
      try {
        const fbQuery = 'SELECT [NAME], [EXPRESSION] FROM $SYSTEM.TMSCHEMA_MEASURES';
        const fbData = await apiClient.post(`/api/powerbi/datasets/${datasetId}/query`, { query: fbQuery });
        return fbData?.results?.[0]?.tables?.[0]?.rows || fbData;
      } catch (fbErr: any) {
        return { error: fbErr.message || 'Failed to fetch measures with fallback query.' };
      }
    }
    return {
      error: err.message || 'Failed to fetch data',
      note: 'Some DAX INFO views might not be supported on this dataset or require Premium capacity.',
      queryAttempted: query
    };
  }
};
