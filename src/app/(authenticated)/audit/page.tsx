'use client';

import React, { useState, useEffect } from 'react';
import { getAuditLogs, getPrograms, MOCK_USERS, AuditLog } from '@/lib/services/dbService';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLogs(await getAuditLogs());
        setUsers(MOCK_USERS);
      } catch (e) {
        console.error('Error loading audit trail', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleToggleExpand = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  if (loading) {
    return <p>Loading audit trail...</p>;
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <header>
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', marginBottom: '0.25rem' }}>Security & Audit Trail</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Trace all database status changes, role overrides, configuration updates, and mapping adjustments.</p>
      </header>

      <div className="card">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>Historical Log Transactions</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          This record is immutable and traces all human decisions to enforce accountability.
        </p>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Performed Action</th>
                <th>User / Actor</th>
                <th>Target Object</th>
                <th>Target Reference UUID</th>
                <th style={{ textAlign: 'center' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const actorUser = users.find(u => u.id === log.user_id);
                const isExpanded = expandedLogId === log.id;
                
                return (
                  <React.Fragment key={log.id}>
                    <tr>
                      <td style={{ fontSize: '0.85rem' }}>
                        {new Date(log.created_at).toLocaleDateString()} {new Date(log.created_at).toLocaleTimeString()}
                      </td>
                      <td>
                        <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {actorUser ? `${actorUser.first_name} ${actorUser.last_name}` : `Public Portal (${log.actor_type})`}
                      </td>
                      <td style={{ textTransform: 'capitalize' }}>{log.entity_type}</td>
                      <td style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{log.entity_id}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => handleToggleExpand(log.id)}
                          className="btn btn-secondary"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        >
                          {isExpanded ? 'Hide Data' : 'Inspect Details'}
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={6} style={{ backgroundColor: 'var(--bg-base)', padding: '1rem' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                              <strong style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>OLD VALUE</strong>
                              <pre style={{
                                background: 'var(--bg-surface-elevated)',
                                padding: '0.75rem',
                                borderRadius: '4px',
                                border: '1px solid var(--border-color)',
                                fontSize: '0.8rem',
                                fontFamily: 'monospace',
                                color: 'var(--text-secondary)',
                                overflowX: 'auto'
                              }}>
                                {log.old_value ? JSON.stringify(log.old_value, null, 2) : 'NULL'}
                              </pre>
                            </div>
                            <div>
                              <strong style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>NEW VALUE</strong>
                              <pre style={{
                                background: 'var(--bg-surface-elevated)',
                                padding: '0.75rem',
                                borderRadius: '4px',
                                border: '1px solid var(--border-color)',
                                fontSize: '0.8rem',
                                fontFamily: 'monospace',
                                color: 'var(--text-secondary)',
                                overflowX: 'auto'
                              }}>
                                {log.new_value ? JSON.stringify(log.new_value, null, 2) : 'NULL'}
                              </pre>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
