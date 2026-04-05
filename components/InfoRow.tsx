import { useState, ReactNode } from 'react';

interface InfoRowProps {
  icon: ReactNode;
  label: string;
  action: 'chevron' | 'toggle' | 'none';
  onToggle?: (value: boolean) => void;
  onPress?: () => void;
  defaultToggleValue?: boolean;
}

export function InfoRow({
  icon,
  label,
  action,
  onToggle,
  onPress,
  defaultToggleValue = true,
}: InfoRowProps) {
  const [toggled, setToggled] = useState(defaultToggleValue);

  const handleToggle = () => {
    const newValue = !toggled;
    setToggled(newValue);
    onToggle?.(newValue);
  };

  return (
    <div
      onClick={action === 'chevron' ? onPress : undefined}
      style={{
        background: '#fff',
        borderRadius: 14,
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        marginBottom: 8,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        cursor: action === 'chevron' ? 'pointer' : 'default',
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: '#eff6ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </div>
      <span
        style={{ flex: 1, fontSize: 15, fontWeight: 600, color: '#1f2937' }}
      >
        {label}
      </span>
      {action === 'chevron' && (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9ca3af"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      )}
      {action === 'toggle' && (
        <div
          onClick={handleToggle}
          style={{
            width: 46,
            height: 26,
            borderRadius: 13,
            background: toggled ? '#2563eb' : '#d1d5db',
            position: 'relative',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 3,
              left: toggled ? 23 : 3,
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: '#fff',
              transition: 'left 0.2s',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          />
        </div>
      )}
    </div>
  );
}
