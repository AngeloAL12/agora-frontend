import React from 'react';

interface Tab {
  id: string;
  label: string;
}

interface TabSwitcherProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function TabSwitcher({
  tabs,
  activeTab,
  onTabChange,
}: TabSwitcherProps) {
  return (
    <div
      style={{
        background: '#fff',
        margin: '0',
        padding: '6px',
        display: 'flex',
        borderBottom: '1px solid #e5e7eb',
      }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          style={{
            flex: 1,
            padding: '10px 0',
            borderRadius: 8,
            border: 'none',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: 14,
            transition: 'all 0.2s',
            background: activeTab === tab.id ? '#2563eb' : 'transparent',
            color: activeTab === tab.id ? '#fff' : '#6b7280',
            fontFamily: 'inherit',
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
