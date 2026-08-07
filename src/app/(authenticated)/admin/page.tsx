'use client';

import React, { useState, useEffect } from 'react';
import { 
  getOrganizationSettings, 
  getCurrentUser, 
  loginAsUser, 
  MOCK_USERS,
  getSubmissions,
  getCompetencies,
  getCurriculumActions,
  logAuditEvent,
  User 
} from '@/lib/services/dbService';

export default function AdminPage() {
  const [settings, setSettings] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [retention, setRetention] = useState('permanent');
  const [freshnessMonths, setFreshnessMonths] = useState(24);
  const [warningMonths, setWarningMonths] = useState(36);
  const [publicEnabled, setPublicEnabled] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const u = await getCurrentUser();
        setCurrentUser(u);
        const setts = await getOrganizationSettings();
        setSettings(setts);
        if (setts) {
          setRetention(setts.default_retention_policy);
          setFreshnessMonths(setts.evidence_freshness_months);
          setWarningMonths(setts.review_warning_months);
          setPublicEnabled(setts.public_submission_enabled);
        }
      } catch (e) {
        console.error('Error loading admin settings', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleRoleSwitch = async (userId: string) => {
    setLoading(true);
    try {
      const newUser = await loginAsUser(userId);
      setCurrentUser(newUser);
      await logAuditEvent('admin_switched_role', 'users', userId, null, { role: newUser.role });
      
      // Force page refresh to update sidebar & layouts
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    } catch (e) {
      alert('Error switching simulator role');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const oldVal = { ...settings };
      const newVal = {
        ...settings,
        default_retention_policy: retention,
        evidence_freshness_months: freshnessMonths,
        review_warning_months: warningMonths,
        public_submission_enabled: publicEnabled,
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('ih_organization_settings', JSON.stringify(newVal));
        setSettings(newVal);
      }

      await logAuditEvent('organization_settings_updated', 'organizations', settings?.organization_id || 'org-demo-dtc', oldVal, newVal);
      alert('Settings updated successfully!');
    } catch (e) {
      alert('Error updating configuration');
    } finally {
      setLoading(false);
    }
  };

  // CSV/JSON Export Handlers
  const convertToCSV = (objArray: any[], headers: string[]) => {
    const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
    let str = headers.join(',') + '\r\n';

    for (let i = 0; i < array.length; i++) {
      let line = '';
      for (let j = 0; j < headers.length; j++) {
        if (line !== '') line += ',';
        const key = headers[j];
        let val = array[i][key];
        if (val === undefined || val === null) {
          val = '';
        } else if (typeof val === 'object') {
          val = JSON.stringify(val).replace(/"/g, '""');
        } else {
          val = String(val).replace(/"/g, '""');
        }
        line += `"${val}"`;
      }
      str += line + '\r\n';
    }
    return str;
  };

  const triggerDownload = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = async () => {
    if (typeof window === 'undefined') return;
    const backup: { [key: string]: any } = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('ih_')) {
        try {
          backup[key] = JSON.parse(localStorage.getItem(key) || '');
        } catch {
          backup[key] = localStorage.getItem(key);
        }
      }
    }
    triggerDownload(JSON.stringify(backup, null, 2), 'evidence_hub_backup.json', 'application/json');
    await logAuditEvent('database_backup_exported_json', 'organizations', settings?.organization_id || 'org-demo-dtc');
  };

  const handleExportSubmissionsCSV = async () => {
    const list = await getSubmissions();
    const headers = ['id', 'reference_id', 'title', 'evidence_type', 'job_role', 'task_description', 'frequency', 'status', 'created_at'];
    const csvContent = convertToCSV(list, headers);
    triggerDownload(csvContent, 'submissions_export.csv', 'text/csv;charset=utf-8;');
    await logAuditEvent('submissions_exported_csv', 'organizations', settings?.organization_id || 'org-demo-dtc');
  };

  const handleExportCompetenciesCSV = async () => {
    const list = await getCompetencies();
    const headers = ['id', 'code', 'title', 'description', 'sequence', 'active'];
    const csvContent = convertToCSV(list, headers);
    triggerDownload(csvContent, 'competencies_export.csv', 'text/csv;charset=utf-8;');
  };

  const handleExportActionsCSV = async () => {
    const list = await getCurriculumActions();
    const headers = ['id', 'program_id', 'course_id', 'competency_id', 'action_type', 'title', 'description', 'rationale', 'effective_term', 'status'];
    const csvContent = convertToCSV(list, headers);
    triggerDownload(csvContent, 'curriculum_actions_export.csv', 'text/csv;charset=utf-8;');
  };

  if (loading && !settings) {
    return <p>Loading admin panel...</p>;
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header>
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', marginBottom: '0.25rem' }}>Administration Workspace</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage organizational metrics, switch simulator identities, and backup historical repositories.</p>
      </header>

      <div className="split-layout">
        
        {/* Left Side: Settings Panel */}
        <form onSubmit={handleSaveSettings} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Organization Configuration
          </h2>

          <div className="form-group">
            <label className="label" htmlFor="retention-select">Default Evidence Retention Policy</label>
            <select
              id="retention-select"
              className="select"
              value={retention}
              onChange={(e) => setRetention(e.target.value)}
            >
              <option value="permanent">Permanent Audit Preservation</option>
              <option value="5_years">5 Years Archive</option>
              <option value="3_years">3 Years Archive</option>
              <option value="until_revoked">Revocable (Until Contributor Revocation)</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="label" htmlFor="freshness-input">Freshness Threshold (Months)</label>
              <input
                id="freshness-input"
                type="number"
                className="input"
                value={freshnessMonths}
                onChange={(e) => setFreshnessMonths(parseInt(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="warning-input">Warning Threshold (Months)</label>
              <input
                id="warning-input"
                type="number"
                className="input"
                value={warningMonths}
                onChange={(e) => setWarningMonths(parseInt(e.target.value))}
              />
            </div>
          </div>

          <label className="checkbox-label" style={{ marginBottom: '1rem' }}>
            <input
              type="checkbox"
              className="checkbox-input"
              checked={publicEnabled}
              onChange={(e) => setPublicEnabled(e.target.checked)}
            />
            <span>Enable secure public link submissions from QR codes</span>
          </label>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Save Configuration Settings
          </button>
        </form>

        {/* Right Side: Identity Swapper & Backups */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Identity Switcher */}
          <div className="card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Simulator Role Access Center
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Simulate switching session identities to review specific role permissions.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {MOCK_USERS.map(u => {
                const isActive = currentUser?.id === u.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => handleRoleSwitch(u.id)}
                    className="btn"
                    style={{
                      justifyContent: 'flex-start',
                      padding: '0.75rem',
                      fontSize: '0.85rem',
                      height: 'auto',
                      backgroundColor: isActive ? 'var(--primary)' : 'var(--bg-surface-elevated)',
                      border: isActive ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                      color: isActive ? 'white' : 'var(--text-primary)',
                      textAlign: 'left',
                      flexDirection: 'column',
                      alignItems: 'flex-start'
                    }}
                  >
                    <strong style={{ display: 'block' }}>{u.first_name} {u.last_name}</strong>
                    <span style={{ fontSize: '0.7rem', color: isActive ? 'white' : 'var(--text-secondary)' }}>{u.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Backup Data Export Center */}
          <div className="card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Data Export Center
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              We enforce zero lock-in policies. Export repository elements or complete local backup bundles on-the-fly.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button onClick={handleExportSubmissionsCSV} className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                📥 Export Submissions (CSV)
              </button>
              <button onClick={handleExportCompetenciesCSV} className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                📥 Export Competencies (CSV)
              </button>
              <button onClick={handleExportActionsCSV} className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                📥 Export Curriculum Actions (CSV)
              </button>
              <button onClick={handleExportJSON} className="btn btn-accent" style={{ justifyContent: 'flex-start' }}>
                💾 Export Full Database Backup (JSON)
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
