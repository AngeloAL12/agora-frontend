import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const ClubBanner = () => {
  return (
    <Image
      source={require('@/assets/images/robotica-banner.png')}
      style={styles.image}
    />
  );
};

export default ClubBanner;

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: 175,
    resizeMode: 'cover',
  },
});
