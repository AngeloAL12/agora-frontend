import React, { ReactNode } from 'react';

interface NavItem {
  id: string;
  icon: ReactNode;
  label: string;
  isActive?: boolean;
  onPress?: () => void;
}

interface BottomNavigationProps {
  items: NavItem[];
  activeId?: string;
  onItemPress?: (itemId: string) => void;
}

export function BottomNavigation({
  items,
  activeId,
  onItemPress,
}: BottomNavigationProps) {
  return (
    <div
      style={{
        background: '#fff',
        borderTop: '1px solid #e5e7eb',
        padding: '10px 0 16px',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
      }}
    >
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onItemPress?.(item.id)}
          style={{
            background:
              item.isActive || activeId === item.id ? '#2563eb' : 'transparent',
            border: 'none',
            borderRadius: '50%',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: 0,
            transition: 'background 0.2s',
          }}
          title={item.label}
        >
          {item.icon}
        </button>
      ))}
    </div>
  );
}
