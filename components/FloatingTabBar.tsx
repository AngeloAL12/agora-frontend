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

import { colors } from '@/constants/theme';

const mapIcon = require('@/assets/icons/navbar/map.svg') as ImageSource;
const complaintsIcon =
  require('@/assets/icons/navbar/reports.svg') as ImageSource;
const iaIcon = require('@/assets/icons/navbar/mailbox.svg') as ImageSource;
const clubsIcon = require('@/assets/icons/navbar/clubs.svg') as ImageSource;
const profileIcon = require('@/assets/icons/navbar/profile.svg') as ImageSource;

const TAB_ICONS = {
  map: mapIcon,
  complaints: complaintsIcon,
  messages: iaIcon,
  clubs: clubsIcon,
  profile: profileIcon,
};

const FALLBACK_ICON = complaintsIcon;
const ICON_WRAPPER_SIZE = 46;
export const FLOATING_TAB_BAR_HEIGHT = 70;
export const FLOATING_TAB_BAR_BOTTOM_OFFSET = 8;

export function FloatingTabBar({
  state,
  navigation,
  descriptors,
  insets,
}: BottomTabBarProps) {
  const tabCenters = useRef<number[]>([]);
  const indicatorTranslateX = useRef(new Animated.Value(0)).current;
  const [indicatorReady, setIndicatorReady] = useState(false);

  const currentRouteKey = state.routes[state.index]?.key;
  const focusedOptions = currentRouteKey
    ? descriptors[currentRouteKey]?.options
    : null;
  const tabStyle = focusedOptions?.tabBarStyle as any;
  const isHidden = tabStyle?.display === 'none';

  useEffect(() => {
    if (!indicatorReady || isHidden) return;
    const center = tabCenters.current[state.index];
    if (center == null) return;

    Animated.spring(indicatorTranslateX, {
      toValue: center - ICON_WRAPPER_SIZE / 2,
      useNativeDriver: true,
      damping: 20,
      stiffness: 200,
      mass: 0.8,
    }).start();
  }, [state.index, indicatorReady, isHidden]);

  const handleTabLayout = (index: number) => (e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    tabCenters.current[index] = x + width / 2;
    const allMeasured = state.routes.every((_, i) =>
      Number.isFinite(tabCenters.current[i]),
    );
    if (allMeasured) {
      const initialCenter = tabCenters.current[state.index];
      if (initialCenter != null) {
        indicatorTranslateX.setValue(initialCenter - ICON_WRAPPER_SIZE / 2);
        setIndicatorReady(true);
      }
    }
  };

  if (isHidden) return null;

  return (
    <View
      style={[
        styles.wrapper,
        { bottom: insets.bottom + FLOATING_TAB_BAR_BOTTOM_OFFSET },
      ]}
      pointerEvents="box-none"
    >
      <BlurView intensity={80} tint="light" style={styles.pill}>
        {indicatorReady && (
          <Animated.View
            style={[
              styles.indicator,
              { transform: [{ translateX: indicatorTranslateX }] },
            ]}
          />
        )}

        {state.routes.map((route, index) => {
          const isActive = state.index === index;
          const mappedIcon = TAB_ICONS[route.name as keyof typeof TAB_ICONS];
          const icon = mappedIcon ?? FALLBACK_ICON;

          const descriptor = descriptors[route.key];
          const optionLabel = descriptor?.options.tabBarLabel;
          const label =
            typeof optionLabel === 'string'
              ? optionLabel
              : (descriptor?.options.title ?? route.name);

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!event.defaultPrevented) navigation.navigate(route.name);
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={styles.tabItem}
              onLayout={handleTabLayout(index)}
              accessibilityRole="tab"
              accessibilityLabel={label}
              accessibilityState={{ selected: isActive }}
            >
              <View style={styles.iconWrapper}>
                <ExpoImage
                  source={icon}
                  style={[
                    { width: 24, height: 24 },
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
    height: FLOATING_TAB_BAR_HEIGHT,
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
    left: 0,
    width: ICON_WRAPPER_SIZE,
    height: ICON_WRAPPER_SIZE,
    borderRadius: 9999,
    backgroundColor: colors.bluePrimary,
    top: (FLOATING_TAB_BAR_HEIGHT - ICON_WRAPPER_SIZE) / 2,
    shadowColor: colors.bluePrimary,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    zIndex: 0,
  },
});
