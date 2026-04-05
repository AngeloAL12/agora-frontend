import React from 'react';

export interface ActivityItem {
  id: number;
  color: string;
  titulo: string;
  detalle: string;
}

interface ActivityListProps {
  items: ActivityItem[];
  title?: string;
}

export function ActivityList({
  items,
  title = 'Actividad Reciente',
}: ActivityListProps) {
  return (
    <div>
      <h3
        style={{
          color: '#2563eb',
          fontWeight: 800,
          fontSize: 16,
          margin: '0 0 16px',
        }}
      >
        {title}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {items.map((item, i) => (
          <div
            key={item.id}
            style={{ display: 'flex', gap: 14, position: 'relative' }}
          >
            {/* Timeline line */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: item.color,
                  marginTop: 4,
                  flexShrink: 0,
                  boxShadow: `0 0 0 3px ${item.color}33`,
                }}
              />
              {i < items.length - 1 && (
                <div
                  style={{
                    width: 2,
                    flex: 1,
                    background: '#e5e7eb',
                    minHeight: 28,
                  }}
                />
              )}
            </div>
            <div style={{ paddingBottom: 20 }}>
              <p
                style={{
                  margin: 0,
                  fontWeight: 700,
                  fontSize: 14,
                  color: '#1f2937',
                }}
              >
                {item.titulo}
              </p>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9ca3af' }}>
                {item.detalle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
