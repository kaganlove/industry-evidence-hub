'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getPrograms, loginAsUser, MOCK_USERS, User } from '@/lib/services/dbService';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [usersList, setUsersList] = useState<User[]>([]);

  useEffect(() => {
    setUsersList(MOCK_USERS);
  }, []);

  const handleMockLogin = async (userId: string) => {
    setLoading(true);
    try {
      await loginAsUser(userId);
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Login failed');
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    // In mock mode, find a matching user by email
    const match = usersList.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (match) {
      handleMockLogin(match.id);
    } else {
      setError('Invalid email or password in demo database mode. Please choose one of the quick roles below.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '1rem',
      backgroundColor: 'var(--bg-base)'
    }}>
      <div className="card animate-fade-in" style={{ maxWidth: '480px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="logo-glow" style={{ fontSize: '2rem', marginBottom: '0.25rem', fontFamily: 'var(--font-display)' }}>
            Industry Evidence Hub
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
            Build curriculum from the work itself.
          </p>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ fontSize: '0.9rem' }}>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label" htmlFor="email-input">Email Address</label>
            <input
              id="email-input"
              type="email"
              className="input"
              placeholder="e.g., id@demo-tech.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="label" htmlFor="password-input">Password</label>
            <input
              id="password-input"
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', marginBottom: '1.5rem' }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Quick Role Access</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          {usersList.map((user) => (
            <button
              key={user.id}
              onClick={() => handleMockLogin(user.id)}
              className="btn btn-secondary"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '0.75rem',
                textAlign: 'left',
                height: 'auto'
              }}
              disabled={loading}
            >
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {user.first_name} {user.last_name}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                {user.title.split(' ').slice(-1)[0] || user.role}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
