import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ClubTabKey } from '@/types/club';

interface ClubTabsProps {
  activeTab: ClubTabKey;
  onChangeTab: (tab: ClubTabKey) => void;
}

interface TabButtonProps {
  title: string;
  active: boolean;
  onPress: () => void;
}

const TabButton = ({ title, active, onPress }: TabButtonProps) => {
  return (
    <TouchableOpacity
      style={[styles.tabButton, active && styles.tabButtonActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text
        style={[styles.tabButtonText, active && styles.tabButtonTextActive]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const ClubTabs = ({ activeTab, onChangeTab }: ClubTabsProps) => {
  return (
    <View style={styles.tabsContainer}>
      <TabButton
        title="Publicaciones"
        active={activeTab === 'publicaciones'}
        onPress={() => onChangeTab('publicaciones')}
      />

      <TabButton
        title="Eventos"
        active={activeTab === 'eventos'}
        onPress={() => onChangeTab('eventos')}
      />
    </View>
  );
};

export default ClubTabs;

const styles = StyleSheet.create({
  tabsContainer: {
    marginHorizontal: 16,

    backgroundColor: '#F2F4F7',
    borderRadius: 16,

    padding: 4,
    paddingVertical: 7,
    paddingHorizontal: 6,
    flexDirection: 'row',
    marginBottom: 14,
  },
  tabButton: {
    flex: 1,
    height: 43,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',

    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#434751',
  },
  tabButtonTextActive: {
    color: '#0D47A1',
    fontWeight: '600',
  },
});
