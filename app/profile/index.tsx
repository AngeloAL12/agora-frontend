import { useState } from 'react';
import { ActivityList, type ActivityItem } from '../../components/ActivityList';
import { BottomNavigation } from '../../components/BottomNavigation';
import { InfoRow } from '../../components/InfoRow';
import { ProfileHeader } from '../../components/ProfileHeader';
import { TabSwitcher } from '../../components/TabSwitcher';
import { useAuth } from '../../context/AuthContext';

const actividadReciente: ActivityItem[] = [
  {
    id: 1,
    color: '#F5A623',
    titulo: 'Asistencia al Club de Ajedrez',
    detalle: 'Hace 2 horas • Edificio G',
  },
  {
    id: 2,
    color: '#4A90E2',
    titulo: 'Comentaste en una publicación',
    detalle: 'Ayer • 14:30 PM',
  },
  {
    id: 3,
    color: '#7B7B7B',
    titulo: 'Diste like a una publicación',
    detalle: '05 Mar 2026',
  },
];

export default function PerfilApp() {
  const [tab, setTab] = useState('informacion');
  const [activeNav, setActiveNav] = useState('profile');

  const { user } = useAuth();
  const userName = user?.name ?? 'Usuario';
  const userEmail = user?.email ?? '';

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#1a1a2e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Nunito', 'Segoe UI', sans-serif",
        padding: '20px',
      }}
    >
      {/* Phone frame */}
      <div
        style={{
          width: 375,
          minHeight: 700,
          background: '#f4f6fb',
          borderRadius: 40,
          overflow: 'hidden',
          boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
          position: 'relative',
        }}
      >
        {/* Status bar */}
        <div
          style={{
            background: '#1e3a8a',
            padding: '12px 20px 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>
            9:30
          </span>
          <div
            style={{
              width: 12,
              height: 12,
              background: '#111',
              borderRadius: '50%',
            }}
          />
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <div
              style={{
                width: 16,
                height: 10,
                border: '1.5px solid #fff',
                borderRadius: 2,
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 1,
                  left: 1,
                  right: 4,
                  bottom: 1,
                  background: '#fff',
                  borderRadius: 1,
                }}
              />
            </div>
          </div>
        </div>

        {/* Header — name y email dinámicos desde AuthUser */}
        <ProfileHeader
          name={userName}
          career={userEmail}
          stats={[
            { value: '0', label: 'CLUBS' },
            { value: '0', label: 'REPORTES' },
            { value: '0', label: 'LIKES' },
          ]}
        />

        {/* Tab switcher */}
        <TabSwitcher
          tabs={[
            { id: 'informacion', label: 'Información' },
            { id: 'actividad', label: 'Actividad' },
          ]}
          activeTab={tab}
          onTabChange={setTab}
        />

        {/* Tab content */}
        <div style={{ background: '#f4f6fb', minHeight: 320, padding: '16px' }}>
          {tab === 'informacion' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[
                {
                  icon: (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  ),
                  label: 'Editar información',
                  action: 'chevron' as const,
                },
                {
                  icon: (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                  ),
                  label: 'Notificaciones',
                  action: 'toggle' as const,
                },
                {
                  icon: (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4M12 8h.01" />
                    </svg>
                  ),
                  label: 'Ayuda y soporte',
                  action: 'chevron' as const,
                },
              ].map(({ icon, label, action }) => (
                <InfoRow
                  key={label}
                  icon={icon}
                  label={label}
                  action={action}
                />
              ))}

              {/* Cerrar sesión */}
              <button
                style={{
                  marginTop: 24,
                  width: '100%',
                  padding: '14px',
                  borderRadius: 14,
                  border: 'none',
                  background: '#fef2f2',
                  color: '#ef4444',
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  fontFamily: 'inherit',
                  transition: 'background 0.2s',
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Cerrar sesión
              </button>
            </div>
          )}

          {tab === 'actividad' && (
            <div>
              <ActivityList
                items={actividadReciente}
                title="Actividad Reciente"
              />
            </div>
          )}
        </div>

        {/* Bottom nav */}
        <BottomNavigation
          items={[
            {
              id: 'home',
              label: 'Inicio',
              icon: (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#9ca3af"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <path d="M9 22V12h6v10" />
                </svg>
              ),
            },
            {
              id: 'mail',
              label: 'Correo',
              icon: (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#9ca3af"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <path d="M22 6l-10 7L2 6" />
                </svg>
              ),
            },
            {
              id: 'chat',
              label: 'Chat',
              icon: (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#9ca3af"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              ),
            },
            {
              id: 'community',
              label: 'Comunidad',
              icon: (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#9ca3af"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              ),
            },
            {
              id: 'profile',
              label: 'Perfil',
              isActive: true,
              icon: (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              ),
            },
          ]}
          activeId={activeNav}
          onItemPress={setActiveNav}
        />
      </div>
    </div>
  );
}
