import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { Image as ExpoImage, type ImageSource } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/constants/theme';

const mapIcon = require('@/assets/icons/navbar/map.svg') as ImageSource;
const mailboxIcon = require('@/assets/icons/navbar/mailbox.svg') as ImageSource;
const reportsIcon = require('@/assets/icons/navbar/reports.svg') as ImageSource;
const clubsIcon = require('@/assets/icons/navbar/clubs.svg') as ImageSource;
const profileIcon = require('@/assets/icons/navbar/profile.svg') as ImageSource;

const TAB_ICONS: Record<string, ImageSource> = {
  map: mapIcon,
  home: reportsIcon,
  ia: mailboxIcon,
  clubs: clubsIcon,
  complaints: profileIcon,
};

const ICON_WRAPPER_SIZE = 46;

export function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const tabCenters = useRef<number[]>([]);
  const pillWidth = useRef(0);

  const indicatorLeft = useRef(new Animated.Value(0)).current;
  const [indicatorReady, setIndicatorReady] = useState(false);

  useEffect(() => {
    if (!indicatorReady) return;
    const center = tabCenters.current[state.index];
    if (center == null) return;

    const targetLeft = center - ICON_WRAPPER_SIZE / 2;

    Animated.spring(indicatorLeft, {
      toValue: targetLeft,
      useNativeDriver: false,
      damping: 20,
      stiffness: 200,
      mass: 0.8,
    }).start();
  }, [state.index, indicatorReady, indicatorLeft]);

  const handlePillLayout = (e: LayoutChangeEvent) => {
    pillWidth.current = e.nativeEvent.layout.width;
  };

  const handleTabLayout = (index: number) => (e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    tabCenters.current[index] = x + width / 2;

    if (tabCenters.current.filter(Boolean).length === state.routes.length) {
      const initialCenter = tabCenters.current[state.index];
      if (initialCenter != null) {
        indicatorLeft.setValue(initialCenter - ICON_WRAPPER_SIZE / 2);
        setIndicatorReady(true);
      }
    }
  };

  return (
    <View
      style={[styles.wrapper, { bottom: insets.bottom + 16 }]}
      pointerEvents="box-none"
    >
      <BlurView
        intensity={80}
        tint="light"
        style={styles.pill}
        onLayout={handlePillLayout}
      >
        {indicatorReady && (
          <Animated.View style={[styles.indicator, { left: indicatorLeft }]} />
        )}

        {state.routes.map((route, index) => {
          const isActive = state.index === index;
          const icon = TAB_ICONS[route.name];

          const customSize =
            route.name === 'home' || route.name === 'clubs' ? 28 : 24;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={styles.tabItem}
              onLayout={handleTabLayout(index)}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={route.name}
            >
              <View style={styles.iconWrapper}>
                <ExpoImage
                  source={icon}
                  style={[
                    { width: customSize, height: customSize },
                    { tintColor: isActive ? colors.white : colors.gray700 },
                  ]}
                  contentFit="contain"
                />
              </View>
            </Pressable>
          );
        })}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
    borderRadius: 9999,
    shadowColor: colors.blueSecondary,
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    height: 70,
    borderRadius: 9999,
    overflow: 'hidden',
    backgroundColor: colors.whiteTransparent90,
    paddingHorizontal: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    zIndex: 1,
  },
  iconWrapper: {
    width: ICON_WRAPPER_SIZE,
    height: ICON_WRAPPER_SIZE,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  indicator: {
    position: 'absolute',
    width: ICON_WRAPPER_SIZE,
    height: ICON_WRAPPER_SIZE,
    borderRadius: 9999,
    backgroundColor: colors.bluePrimary,
    top: (70 - ICON_WRAPPER_SIZE) / 2,
    shadowColor: colors.bluePrimary,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    zIndex: 0,
  },
});
