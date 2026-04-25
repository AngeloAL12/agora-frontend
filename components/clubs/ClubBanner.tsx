import React from 'react';
import { Image, StyleSheet } from 'react-native';

interface ClubBannerProps {
  imageUrl: string;
}

const ClubBanner = ({ imageUrl }: ClubBannerProps) => {
  return <Image source={{ uri: imageUrl }} style={styles.image} />;
};

export default ClubBanner;

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: 175,
    resizeMode: 'cover',
  },
});
