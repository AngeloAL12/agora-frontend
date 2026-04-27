import { Image as ExpoImage } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors, typography } from '@/constants/theme';
import { ClubMember } from '@/types/club';

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

interface MemberCardProps {
  member: ClubMember;
  showOptions?: boolean;
  onOptionsPress?: () => void;
}

export default function MemberCard({
  member,
  showOptions = false,
  onOptionsPress,
}: MemberCardProps) {
  return (
    <View style={styles.card}>
      {member.photo ? (
        <ExpoImage
          source={{ uri: member.photo }}
          style={styles.avatar}
          contentFit="cover"
        />
      ) : (
        <View
          style={[
            styles.avatarFallback,
            member.is_leader && styles.avatarLeader,
          ]}
        >
          <Text
            style={[
              styles.avatarInitials,
              member.is_leader && styles.initialsLeader,
            ]}
          >
            {getInitials(member.name)}
          </Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.name}>{member.name}</Text>
        <View style={styles.roleRow}>
          {member.is_leader && (
            <ExpoImage
              source={require('@/assets/icons/clubs/admin.svg')}
              style={styles.roleIcon}
              contentFit="contain"
              tintColor={colors.blueSecondary}
            />
          )}
          <Text style={[styles.role, member.is_leader && styles.roleLeader]}>
            {member.is_leader ? 'Administrador' : 'Miembro'}
          </Text>
        </View>
      </View>

      {showOptions && (
        <TouchableOpacity
          style={styles.optionsBtn}
          onPress={onOptionsPress}
          activeOpacity={0.6}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <View style={styles.dotWrap}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.chatBorder,
    shadowColor: colors.blueSecondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 17,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: colors.chatBorder,
  },
  avatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 9999,
    backgroundColor: colors.eventDateBg,
    borderWidth: 2,
    borderColor: colors.chatBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLeader: {
    backgroundColor: colors.bluePrimaryLight,
  },
  avatarInitials: {
    fontSize: 18,
    fontFamily: typography.fontFamily.manropeBold,
    color: colors.gray700,
  },
  initialsLeader: {
    color: colors.blueSecondary,
  },
  info: {
    flex: 1,
    paddingLeft: 16,
    gap: 2,
  },
  name: {
    fontSize: 16,
    fontFamily: typography.fontFamily.manropeBold,
    color: colors.gray950,
    lineHeight: 24,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  roleIcon: {
    width: 10,
    height: 12,
  },
  role: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.gray700,
    lineHeight: 20,
  },
  roleLeader: {
    color: colors.blueSecondary,
  },
  optionsBtn: {
    padding: 8,
    borderRadius: 9999,
  },
  dotWrap: {
    gap: 3,
    alignItems: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 9999,
    backgroundColor: colors.gray700,
  },
});
