import React from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.palette.primary,
        tabBarInactiveTintColor: theme.palette.textSecondary,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="mapa"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" size={size ?? 28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="buzon"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="mail-outline" size={size ?? 28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={size ?? 28}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="clubes"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size ?? 28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profiles"
        options={{
          tabBarIcon: ({ color }) => (
            <View
              style={[
                styles.profileIconContainer,
                color === theme.palette.primary && styles.activeProfile,
              ]}
            >
              <Ionicons
                name="person-outline"
                size={24}
                color={
                  color === theme.palette.primary
                    ? theme.palette.onPrimary
                    : color
                }
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    height: 65,
    backgroundColor: theme.palette.surface,
    borderRadius: 35,
    paddingBottom: 0,
    shadowColor: theme.palette.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    borderTopWidth: 0,
  },
  profileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeProfile: {
    backgroundColor: theme.palette.primary,
  },
});
