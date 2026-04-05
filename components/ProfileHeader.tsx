import React from 'react';

interface Stat {
  value: string;
  label: string;
}

interface ProfileHeaderProps {
  name: string;
  career: string;
  stats: Stat[];
  avatarUrl?: string;
}

export function ProfileHeader({
  name,
  career,
  stats,
  avatarUrl,
}: ProfileHeaderProps) {
  return (
    <div
      style={{
        background: 'linear-gradient(160deg, #1e3a8a 0%, #2563eb 100%)',
        padding: '28px 20px 24px',
        textAlign: 'center',
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: '#d1d5db',
          margin: '0 auto 14px',
          border: '3px solid rgba(255,255,255,0.3)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="18" r="10" fill="#9ca3af" />
            <ellipse cx="24" cy="42" rx="18" ry="12" fill="#9ca3af" />
          </svg>
        )}
      </div>

      <h2
        style={{
          color: '#fff',
          fontSize: 20,
          fontWeight: 800,
          margin: '0 0 4px',
          letterSpacing: 0.2,
        }}
      >
        {name}
      </h2>
      <p
        style={{
          color: 'rgba(255,255,255,0.75)',
          fontSize: 12.5,
          margin: '0 0 20px',
        }}
      >
        {career}
      </p>

      {/* Stats */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
        {stats.map(({ value, label }) => (
          <div
            key={label}
            style={{
              background: 'rgba(255,255,255,0.15)',
              borderRadius: 10,
              padding: '8px 18px',
              textAlign: 'center',
              backdropFilter: 'blur(4px)',
            }}
          >
            <div
              style={{
                color: '#fff',
                fontSize: 18,
                fontWeight: 800,
                lineHeight: 1,
              }}
            >
              {value}
            </div>
            <div
              style={{
                color: 'rgba(255,255,255,0.65)',
                fontSize: 10,
                marginTop: 2,
                letterSpacing: 0.8,
              }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
