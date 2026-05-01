import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/constants/theme';

export function ComplaintLoadingState() {
  return (
    <SafeAreaView style={styles.container}>
      <ActivityIndicator size="large" color={colors.bluePrimary} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.whiteSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
