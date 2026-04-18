import { COLORS } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

const HIDDEN_ROUTES = ['my-clubs'];

const getAccessibilityLabel = (routeName: string) => {
  switch (routeName) {
    case 'map':
      return 'Mapa';
    case 'complaints':
      return 'Quejas';
    case 'ia':
      return 'IA';
    case 'clubs':
      return 'Clubs';
    case 'profile':
      return 'Perfil';
    default:
      return routeName;
  }
};

export const FloatingTabBar: React.FC<BottomTabBarProps> = ({
  state,
  navigation,
}) => {
  const visibleRoutes = state.routes.filter(
    (route) => !HIDDEN_ROUTES.includes(route.name),
  );

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {visibleRoutes.map((route) => {
          const routeIndex = state.routes.findIndex((r) => r.key === route.key);
          const isFocused = state.index === routeIndex;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const getIconName = () => {
            switch (route.name) {
              case 'map':
                return isFocused ? 'map' : 'map-outline';
              case 'complaints':
                return isFocused ? 'mail' : 'mail-outline';
              case 'ia':
                return isFocused
                  ? 'chatbubble-ellipses'
                  : 'chatbubble-ellipses-outline';
              case 'clubs':
                return isFocused ? 'people' : 'people-outline';
              case 'profile':
                return isFocused ? 'person' : 'person-outline';
              default:
                return 'ellipse-outline';
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              onLongPress={onLongPress}
              accessibilityRole="tab"
              accessibilityLabel={getAccessibilityLabel(route.name)}
              accessibilityState={{ selected: isFocused }}
              style={[styles.tabButton, isFocused && styles.activeTabButton]}
            >
              <Ionicons
                name={getIconName() as any}
                size={24}
                color={isFocused ? COLORS.white : '#6B7280'}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 10,
    alignItems: 'center',
  },
  container: {
    width: 351,
    height: 72,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 9999,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#003172',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    elevation: 8,
  },
  tabButton: {
    width: 46,
    height: 46,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabButton: {
    backgroundColor: COLORS.primary,
  },
});
