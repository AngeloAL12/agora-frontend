import React from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2B4CC8',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false, // En la imagen 1 no se ven etiquetas de texto
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
                color !== '#9CA3AF' && styles.activeProfile,
              ]}
            >
              <Ionicons
                name="person-outline"
                size={24}
                color={color !== '#9CA3AF' ? '#FFF' : color}
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
    backgroundColor: '#FFFFFF',
    borderRadius: 35, // Hace la barra redondeada como en la imagen
    paddingBottom: 0,
    // Sombra
    shadowColor: '#000',
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
    backgroundColor: '#2B4CC8', // El fondo azul cuando el perfil está activo
  },
});
