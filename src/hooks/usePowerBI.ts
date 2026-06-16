import { useState, useEffect } from 'react';
import { apiClient } from '../config/api';

/**
 * Hook to fetch all Power BI workspaces.
 */
export function usePowerBIWorkspaces() {
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function fetchWorkspaces() {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.get('/api/powerbi/workspaces');
        if (active) {
          setWorkspaces(data.value || []);
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || 'Failed to load workspaces.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchWorkspaces();
    return () => {
      active = false;
    };
  }, []);

  return { workspaces, loading, error };
}

/**
 * Hook to fetch all reports within a specific workspace.
 */
export function usePowerBIReports(workspaceId?: string | null) {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!workspaceId) {
      setReports([]);
      setLoading(false);
      setError(null);
      return;
    }

    let active = true;
    async function fetchReports() {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.get(`/api/powerbi/workspaces/${workspaceId}/reports`);
        if (active) {
          setReports(data.value || []);
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || 'Failed to load reports.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchReports();
    return () => {
      active = false;
    };
  }, [workspaceId]);

  return { reports, loading, error };
}

/**
 * Hook to fetch all datasets within a specific workspace.
 */
export function usePowerBIDatasets(workspaceId?: string | null) {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!workspaceId) {
      setDatasets([]);
      setLoading(false);
      setError(null);
      return;
    }

    let active = true;
    async function fetchDatasets() {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.get(`/api/powerbi/workspaces/${workspaceId}/datasets`);
        if (active) {
          setDatasets(data.value || []);
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || 'Failed to load datasets.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchDatasets();
    return () => {
      active = false;
    };
  }, [workspaceId]);

  return { datasets, loading, error };
}

/**
 * Hook to fetch all dashboards within a specific workspace.
 */
export function usePowerBIDashboards(workspaceId?: string | null) {
  const [dashboards, setDashboards] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!workspaceId) {
      setDashboards([]);
      setLoading(false);
      setError(null);
      return;
    }

    let active = true;
    async function fetchDashboards() {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.get(`/api/powerbi/workspaces/${workspaceId}/dashboards`);
        if (active) {
          setDashboards(data.value || []);
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || 'Failed to load dashboards.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchDashboards();
    return () => {
      active = false;
    };
  }, [workspaceId]);

  return { dashboards, loading, error };
}
