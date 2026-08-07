'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, logoutUser, User } from '@/lib/services/dbService';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const u = await getCurrentUser();
      if (!u) {
        router.push('/login');
      } else {
        setUser(u);
      }
      setLoading(false);
    }
    checkAuth();
  }, [router, pathname]);

  const handleSignOut = async () => {
    await logoutUser();
    router.push('/login');
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-base)'
      }}>
        <p>Loading session...</p>
      </div>
    );
  }

  if (!user) return null;

  const navItems = [
    { label: 'Dashboard', path: '/', icon: '📊' },
    { label: 'Evidence Inbox', path: '/inbox', icon: '📥' },
    { label: 'Evidence Requests', path: '/requests', icon: '📢' },
    { label: 'Task Profiles', path: '/task-profiles', icon: '⚙️' },
    { label: 'Programs', path: '/programs', icon: '🎓' },
    { label: 'Courses', path: '/courses', icon: '📖' },
    { label: 'Competencies', path: '/competencies', icon: '🎯' },
    { label: 'Curriculum Actions', path: '/curriculum-actions', icon: '🔄' },
    { label: 'Industry Partners', path: '/partners', icon: '🏢' },
    { label: 'Reports', path: '/reports', icon: '📈' },
    { label: 'Administration', path: '/admin', icon: '🛠️' },
    { label: 'Audit Logs', path: '/audit', icon: '📋' },
  ];

  return (
    <div className="sidebar-layout">
      {/* Sidebar Navigation */}
      <aside style={{
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        {/* Sidebar Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <span className="logo-glow" style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: '1.25rem',
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em'
          }}>
            Evidence Hub
          </span>
          <span style={{
            fontSize: '0.75rem',
            color: 'var(--secondary)',
            fontWeight: 600,
            textTransform: 'uppercase',
            marginTop: '0.2rem'
          }}>
            Demo Tech College
          </span>
        </div>

        {/* Sidebar Nav Items */}
        <nav style={{
          flex: 1,
          padding: '1rem 0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
          overflowY: 'auto'
        }}>
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.7rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.95rem',
                  color: isActive ? 'white' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <span>{item.icon}</span>
                <span style={{ fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer (User session details) */}
        <div style={{
          padding: '1rem',
          borderTop: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-surface-elevated)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {user.first_name} {user.last_name}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {user.title}
            </span>
            <span className="badge" style={{
              fontSize: '0.65rem',
              alignSelf: 'flex-start',
              marginTop: '0.35rem',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              borderColor: 'rgba(99, 102, 241, 0.3)',
              color: 'var(--primary)',
              padding: '0.1rem 0.5rem'
            }}>
              {user.role.replace('_', ' ')}
            </span>
          </div>
          <button
            onClick={handleSignOut}
            className="btn btn-secondary"
            style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem' }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{
        padding: '2rem',
        overflowY: 'auto',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
      }}>
        {children}
      </main>
    </div>
  );
}
