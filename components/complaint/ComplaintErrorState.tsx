import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, typography } from '@/constants/theme';

export function ComplaintErrorState() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.errorText}>No se pudo cargar el reporte.</Text>
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
  errorText: {
    fontSize: 16,
    color: colors.notifBodyText,
    fontFamily: typography.fontFamily.interRegular,
  },
});
