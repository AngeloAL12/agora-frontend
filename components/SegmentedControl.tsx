import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { theme } from '../constants/theme';

const TRACK_PADDING = 6;

interface SegmentedControlProps {
  options: [string, string];
  selectedIndex: 0 | 1;
  onChange: (index: 0 | 1) => void;
  hint?: string;
}

export default function SegmentedControl({
  options,
  selectedIndex,
  onChange,
  hint,
}: SegmentedControlProps) {
  const [pillWidth, setPillWidth] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (pillWidth === 0) return;
    Animated.timing(translateX, {
      toValue: selectedIndex * pillWidth,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [selectedIndex, pillWidth]);

  const handleLayout = (e: LayoutChangeEvent) => {
    setPillWidth((e.nativeEvent.layout.width - TRACK_PADDING * 2) / 2);
  };

  return (
    <View>
      <View style={styles.track} onLayout={handleLayout}>
        {pillWidth > 0 && (
          <Animated.View
            style={[
              styles.pill,
              {
                width: pillWidth,
                transform: [{ translateX }],
              },
            ]}
          />
        )}
        {options.map((label, i) => (
          <Pressable
            key={label}
            style={styles.option}
            onPress={() => onChange(i as 0 | 1)}
          >
            <Text
              style={[
                styles.optionText,
                selectedIndex === i && styles.optionTextActive,
              ]}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>
      {hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: theme.colors.gray100,
    borderRadius: 16,
    padding: 6,
  },
  pill: {
    position: 'absolute',
    top: TRACK_PADDING,
    left: TRACK_PADDING,
    bottom: TRACK_PADDING,
    borderRadius: 12,
    backgroundColor: theme.colors.white,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  option: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  optionText: {
    fontFamily: theme.typography.fontFamily.interSemiBold,
    fontSize: 14,
    color: theme.colors.gray700,
  },
  optionTextActive: {
    fontFamily: theme.typography.fontFamily.interBold,
    color: theme.colors.blueSecondary,
  },
  hint: {
    marginTop: 6,
    paddingHorizontal: 4,
    fontSize: 11,
    color: theme.colors.activityGray,
    lineHeight: 16.5,
  },
});
