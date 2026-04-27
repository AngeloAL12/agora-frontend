import React from 'react';
import { Image, StyleSheet } from 'react-native';

interface ClubBannerProps {
  coverImage?: string;
}

const ClubBanner = ({ coverImage }: ClubBannerProps) => {
  return (
    <Image
      source={
        coverImage
          ? { uri: coverImage }
          : require('@/assets/images/post-robotica.png')
      }
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
