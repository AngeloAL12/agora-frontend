import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const ClubEventsEmpty = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sin eventos por ahora</Text>
      <Text style={styles.description}>
        Aquí aparecerán los próximos eventos del club.
      </Text>
    </View>
  );
};

export default ClubEventsEmpty;

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E2A3A',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6C7480',
    textAlign: 'center',
  },
});
