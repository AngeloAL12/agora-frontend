import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ClubHeaderInfoProps {
  initials: string;
  name: string;
  description: string;
  isMember: boolean;
  onPressMember?: () => void;
}

const ClubHeaderInfo = ({
  initials,
  name,
  description,
  isMember,
  onPressMember,
}: ClubHeaderInfoProps) => {
  return (
    <>
      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        <TouchableOpacity
          style={styles.memberButton}
          activeOpacity={0.8}
          onPress={onPressMember}
        >
          <Text style={styles.memberButtonText}>
            {isMember ? 'Miembro' : 'Unirse'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.clubInfo}>
        <Text style={styles.clubTitle}>{name}</Text>
        <Text style={styles.clubDescription}>{description}</Text>
      </View>
    </>
  );
};

export default ClubHeaderInfo;

const styles = StyleSheet.create({
  profileSection: {
    marginTop: -48,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#003172',
    borderWidth: 4,
    borderColor: '#F7F9FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
  },
  memberButton: {
    backgroundColor: '#F1C806',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,

    shadowColor: '#003172',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },

  memberButtonText: {
    color: '#192A56',
    fontSize: 14,
    fontWeight: '600',
  },
  clubInfo: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  clubTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#192A56',
    marginBottom: 6,
    lineHeight: 32,
    letterSpacing: -0.6,
  },
  clubDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: '#434751',
    lineHeight: 22,
    marginTop: 4,
    maxWidth: '84%',
  },
});
