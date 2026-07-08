import { useState, useCallback } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft, X, Loader2, Play } from 'lucide-react';
import AppShell from '../components/AppShell';
import { fetchNodeAnalysis } from '../config/api';
import { startMigration } from '../services/migrationService';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Position,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const createNodes = (reportData: any) => [
  {
    id: 'report',
    type: 'default',
    data: { label: `${reportData?.name || 'Report'} (Visuals)` },
    position: { x: 50, y: 150 },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    style: {
      background: 'var(--purple)',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      padding: '12px 20px',
      fontWeight: 700,
      boxShadow: '0 6px 16px rgba(111,43,139,0.25)',
    }
  },
  {
    id: 'dataset',
    type: 'default',
    data: { label: `Dataset (${reportData?.dataSource || 'SQL/DB'})` },
    position: { x: 350, y: 50 },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    style: {
      background: 'var(--card-bg)',
      color: 'var(--text)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      padding: '12px 20px',
      fontWeight: 600,
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    }
  },
  {
    id: 'powerquery',
    type: 'default',
    data: { label: 'Power Query (Transformations)' },
    position: { x: 350, y: 250 },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    style: {
      background: 'rgba(111,43,139,0.05)',
      color: 'var(--text)',
      border: '1px solid var(--purple)',
      borderRadius: '8px',
      padding: '12px 20px',
      fontWeight: 600,
      boxShadow: '0 4px 12px rgba(111,43,139,0.1)',
    }
  },
  {
    id: 'modelview',
    type: 'default',
    data: { label: 'Model View (Relationships)' },
    position: { x: 650, y: 150 },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    style: {
      background: 'var(--card-bg)',
      color: 'var(--text)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      padding: '12px 20px',
      fontWeight: 600,
    }
  },
  {
    id: 'measures',
    type: 'default',
    data: { label: `Measures (${reportData?.fields || 'DAX'})` },
    position: { x: 950, y: 150 },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    style: {
      background: 'var(--card-bg)',
      color: 'var(--text)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      padding: '12px 20px',
      fontWeight: 600,
    }
  },
  {
    id: 'cards',
    type: 'default',
    data: { label: 'Cards' },
    position: { x: 1250, y: 150 },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    style: {
      background: 'var(--card-bg)',
      color: 'var(--text)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      padding: '12px 20px',
      fontWeight: 600,
    }
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e-report-dataset',
    source: 'report',
    target: 'dataset',
    animated: true,
    style: { stroke: 'var(--cyan)', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--cyan)' }
  },
  {
    id: 'e-report-pq',
    source: 'report',
    target: 'powerquery',
    animated: true,
    style: { stroke: 'var(--cyan)', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--cyan)' }
  },
  {
    id: 'e-dataset-model',
    source: 'dataset',
    target: 'modelview',
    animated: true,
    style: { stroke: 'var(--purple)', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--purple)' }
  },
  {
    id: 'e-pq-model',
    source: 'powerquery',
    target: 'modelview',
    animated: true,
    style: { stroke: 'var(--purple)', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--purple)' }
  },
  {
    id: 'e-model-measures',
    source: 'modelview',
    target: 'measures',
    animated: true,
    style: { stroke: 'var(--purple)', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--purple)' }
  },
  {
    id: 'e-measures-cards',
    source: 'measures',
    target: 'cards',
    animated: true,
    style: { stroke: 'var(--purple)', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--purple)' }
  },
];



export default function ReportLineage() {
  const { id } = useParams();
  const location = useLocation();
  const reportData = location.state?.report;

  const [nodes, setNodes, onNodesChange] = useNodesState(createNodes(reportData));
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const [selectedNodeData, setSelectedNodeData] = useState<any>(null);
  const [selectedNodeName, setSelectedNodeName] = useState<string>('');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const navigate = useNavigate();

  const handleStartMigration = useCallback(async () => {
    if (!id) return;
    
    try {
      const saved = localStorage.getItem('powerbi_migration_statuses');
      const statuses = saved ? JSON.parse(saved) : {};
      statuses[id] = 'in-progress';
      localStorage.setItem('powerbi_migration_statuses', JSON.stringify(statuses));
    } catch (e) {
      console.error(e);
    }

    try {
      // Non-blocking trigger start
      startMigration({
        reportId: id,
        reportName: reportData?.name || 'Report',
        datasetId: reportData?.datasetId,
        workspaceId: reportData?.datasetWorkspaceId || reportData?.workspaceId || '',
        isDashboard: false
      });
    } catch (err: any) {
      console.error('Migration start API call failed:', err);
    }

    navigate('/app/migration');
  }, [id, reportData, navigate]);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges],
  );

  const onNodeClick = useCallback(async (event: any, node: any) => {
    setSelectedNodeName(node.data.label);
    setIsPanelOpen(true);
    setIsFetching(true);
    setSelectedNodeData(null);

    // Fetch real data from backend using DAX query mappings or Scanner API
    const workspaceIdToUse = reportData?.datasetWorkspaceId || reportData?.workspaceId;
    const data = await fetchNodeAnalysis(node.id, reportData?.datasetId, workspaceIdToUse, id, reportData?.name);

    setSelectedNodeData(data);
    setIsFetching(false);
  }, [reportData, id]);

  const Breadcrumb = (
    <div className="flex items-center gap-1.5" style={{ fontSize: 11 }}>
      <Link to="/app/dashboards" className="flex items-center gap-1 hover:opacity-80 transition-opacity" style={{ color: 'var(--muted)' }}>
        <ArrowLeft size={12} />
        <span style={{ fontWeight: 600 }}>Dashboards</span>
      </Link>
      <ChevronRight size={11} style={{ color: 'var(--muted)' }} />
      <span style={{ color: 'var(--text)', fontWeight: 600 }}>{reportData?.name || `Report: ${id}`}</span>
      <ChevronRight size={11} style={{ color: 'var(--muted)' }} />
      <span style={{ color: 'var(--purple)', fontWeight: 600 }}>Lineage View</span>
    </div>
  );

  return (
    <AppShell topbarLeft={Breadcrumb}>
      <div className="p-5 h-[calc(100vh-60px)] flex flex-col gap-4 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>Report Architecture</h2>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>Interactive lineage showing Dataset, Power Query, Measures, Model View, and Report dependencies.</p>
          </div>
          <button
            onClick={handleStartMigration}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #00f0ff, #7000ff)',
              color: 'white',
              border: 'none',
            }}
          >
            <Play size={14} className="fill-current" />
            Migrate to Domo
          </button>
        </div>

        <div style={{ flex: 1, border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', background: 'var(--card-bg)', boxShadow: '0 2px 12px rgba(15,23,60,0.04)' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            fitView
            attributionPosition="bottom-left"
          >
            <MiniMap
              nodeStrokeColor={(n) => {
                if (n.id === 'report') return '#7030B1';
                if (n.id === 'powerquery') return '#B56DD3';
                return '#e5e7eb';
              }}
              nodeColor={(n) => {
                if (n.id === 'report') return '#7030B1';
                if (n.id === 'powerquery') return '#faf5ff';
                return '#ffffff';
              }}
            />
            <Controls />
            <Background gap={16} size={1} />
          </ReactFlow>
        </div>

        {/* Side Panel Overlay */}
        <div
          className={`absolute top-0 right-0 h-full w-[400px] border-l shadow-2xl transition-transform duration-300 ease-in-out z-50 flex flex-col`}
          style={{
            transform: isPanelOpen ? 'translateX(0)' : 'translateX(100%)',
            background: 'var(--card-bg)',
            borderColor: 'var(--border)'
          }}
        >
          <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border)' }}>
            <h3 className="font-bold text-lg" style={{ color: 'var(--text)' }}>
              {selectedNodeName.includes('Model View')
                ? `${reportData?.name || reportData?.reportName || reportData?.displayName || 'Report'} - Model View (Magic ETL)`
                : selectedNodeName}
            </h3>
            <button onClick={() => setIsPanelOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X size={20} style={{ color: 'var(--muted)' }} />
            </button>
          </div>

          <div className="p-5 overflow-y-auto flex-1">
            {isFetching ? (
              <div className="flex flex-col items-center justify-center h-full gap-3" style={{ color: 'var(--purple)' }}>
                <Loader2 size={32} className="animate-spin" />
                <span className="font-semibold text-sm">Analyzing metadata...</span>
              </div>
            ) : selectedNodeData ? (
              <div className="flex flex-col gap-6">
                <div className="text-sm font-medium mb-2" style={{ color: 'var(--purple)' }}>Extracted Details</div>

                {selectedNodeName.includes('Cards') && Array.isArray(selectedNodeData) ? (
                  <div className="flex flex-col gap-2.5">
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
                      The following visual tiles and cards have been detected in this report and are available to migrate to Domo:
                    </p>
                    {selectedNodeData.map((card: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3.5 border rounded-xl flex items-center justify-between shadow-sm"
                        style={{
                          background: 'rgba(0, 240, 255, 0.03)',
                          borderColor: 'rgba(0, 240, 255, 0.15)',
                        }}
                      >
                        <div>
                          <div className="font-bold text-xs" style={{ color: 'var(--text)' }}>
                            {card.title}
                          </div>
                          <div className="text-[9px] mt-1 font-semibold text-cyan-400 uppercase tracking-wider">
                            {card.type} {card.page ? `· ${card.page}` : ''}
                          </div>
                        </div>
                        <span
                          className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                          style={{
                            background: 'rgba(52, 211, 153, 0.15)',
                            color: '#34d399',
                            border: '1px solid rgba(52, 211, 153, 0.25)',
                          }}
                        >
                          {card.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (selectedNodeName.includes('Measures') || selectedNodeName.includes('Dataset') || selectedNodeName.includes('Power Query') || selectedNodeName.includes('Model View')) && Array.isArray(selectedNodeData) ? (
                  selectedNodeData.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {selectedNodeData.map((m: any, idx: number) => {
                        const name =
                          m.MEASURE_NAME || m['[MEASURE_NAME]'] ||
                          m.Name || m['[Name]'] ||
                          m.TABLE_NAME || m['[TABLE_NAME]'] ||
                          m.PARTITION_NAME || m['[PARTITION_NAME]'] ||
                          m.Relationship || m['[Relationship]'] ||
                          m.tableName ||
                          m.NAME || m['[NAME]'] ||
                          'Unknown Item';

                        // Exclude internal hidden tables commonly found in PowerBI
                        if (name.startsWith('LocalDateTable') || name.startsWith('DateTableTemplate')) return null;

                        // Exclude dummy Measure tables from Power Query view
                        if (selectedNodeName.includes('Power Query') && name.toLowerCase().includes('measure')) return null;

                        return (
                          <div key={idx} className="p-3 border rounded shadow-sm text-sm flex flex-col gap-2" style={{ background: 'var(--bg-color)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                            <div className="font-bold">{name}</div>

                            {selectedNodeName.includes('Model View') && (
                              <div className="text-xs flex flex-col gap-1 mt-1" style={{ color: 'var(--muted)' }}>
                                <div>
                                  <span className="font-semibold text-gray-500 mr-1">Active:</span> {(m.IsActive || m['[IsActive]']) ? 'Yes' : 'No'}
                                  <span className="mx-2 text-gray-300">|</span>
                                  <span className="font-semibold text-gray-500 mr-1">Cross Filtering:</span> {m.CrossFilteringBehavior || m['[CrossFilteringBehavior]'] || 'Default'}
                                </div>
                                <div>
                                  <span className="font-semibold text-gray-500 mr-1">Cardinality:</span>
                                  {m.FromCardinality || m['[FromCardinality]'] || '?'} <span className="text-gray-400 mx-1">to</span> {m.ToCardinality || m['[ToCardinality]'] || '?'}
                                </div>
                              </div>
                            )}

                            {selectedNodeName.includes('Power Query') && m.mExpression && (
                              <pre className="p-2 rounded text-xs overflow-x-auto border font-mono" style={{ background: 'var(--card-bg)', color: 'var(--purple)', borderColor: 'var(--border)' }}>
                                {m.mExpression}
                              </pre>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center mt-6 p-4 rounded border text-sm" style={{ background: 'var(--bg-color)', borderColor: 'var(--border)', color: 'var(--muted)' }}>
                      No metadata found. This dataset may use a Live Connection, DirectQuery, or the tables are automatically generated by Power BI.
                    </div>
                  )
                ) : (
                  <pre className="p-4 rounded-lg text-xs overflow-x-auto border shadow-inner" style={{ background: 'var(--bg-color)', color: 'var(--text)', borderColor: 'var(--border)' }}>
                    {JSON.stringify(selectedNodeData, null, 2)}
                  </pre>
                )}
              </div>
            ) : (
              <div className="text-center mt-10" style={{ color: 'var(--muted)' }}>No data available</div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
