import { ScreenHeader } from '@/components/ScreenHeader';
import { SearchInput } from '@/components/SearchInput';
import { colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { HeaderBackButton } from '@/components/HeaderBackButton';

import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const MEMBERS = [
  {
    id: 1,
    name: 'Angelo Alvarado',
    role: 'Administrador',
    initials: 'AA',
    image: require('@/assets/images/AlejandroRivera.png'),
  },
  {
    id: 2,
    name: 'Sofía Martínez',
    role: 'Moderador',
    initials: 'SM',
    image: require('@/assets/images/SofíaMartínez.png'),
  },
  { id: 3, name: 'Carlos Mendoza', role: 'Miembro', initials: 'CM' },
  {
    id: 4,
    name: 'Diego Torres',
    role: 'Miembro',
    initials: 'DT',
    image: require('@/assets/images/DiegoTorres.png'),
  },
  { id: 5, name: 'Lucía Ramírez', role: 'Miembro', initials: 'LR' },
  {
    id: 6,
    name: 'Elena Gómez',
    role: 'Miembro',
    initials: 'EG',
    image: require('@/assets/images/ElenaGómez.png'),
  },
];

export default function ClubMembersScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScreenHeader
        title="Miembros"
        align="center"
        variant="white"
        containerStyle={styles.header}
        leftAction={<HeaderBackButton color={colors.blueDark} />}
        rightAction={<View style={styles.headerSide} />}
      />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <SearchInput
          placeholder="Buscar miembros..."
          containerStyle={styles.searchInput}
        />

        <View style={styles.filters}>
          <View style={styles.activeChip}>
            <Text style={styles.activeChipText}>Todos (42)</Text>
          </View>

          <View style={styles.inactiveChip}>
            <Text style={styles.inactiveChipText}>Administradores</Text>
          </View>
        </View>

        {MEMBERS.map((member) => (
          <View key={member.id} style={styles.card}>
            <View style={styles.avatar}>
              {member.image ? (
                <Image source={member.image} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{member.initials}</Text>
              )}
            </View>

            <View>
              <Text style={styles.name}>{member.name}</Text>
              <View style={styles.roleRow}>
                {(member.role === 'Administrador' ||
                  member.role === 'Moderador') && (
                  <Image
                    source={require('@/assets/icons/Admin.png')}
                    style={styles.roleIcon}
                  />
                )}
                <Text
                  style={[
                    styles.role,
                    (member.role === 'Administrador' ||
                      member.role === 'Moderador') &&
                      styles.roleHighlight,
                  ]}
                >
                  {member.role}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  header: {
    backgroundColor: colors.white,
    paddingHorizontal: 24,
    elevation: 0,
    shadowOpacity: 0,
  },

  leftIcon: {
    position: 'absolute',
    left: 16,
    top: 0,
    bottom: 0,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },

  backIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
    tintColor: '#192A56',
  },

  headerTitle: {
    flex: 1,
    textAlign: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
    color: '#192A56',
    letterSpacing: -0.5,
  },

  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },

  filters: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },

  activeChip: {
    backgroundColor: '#1E488F',
    height: 32,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeChipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    textAlign: 'center',
  },

  inactiveChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  inactiveChipText: {
    color: '#191C1E',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    textAlign: 'center',
  },

  card: {
    width: '100%',
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
    borderColor: '#ECEEF1',
    padding: 16,

    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 9999,
    backgroundColor: '#E6ECF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  avatarText: {
    color: '#003172',
    fontWeight: '700',
    fontSize: 14,
  },

  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#191C1E',
    lineHeight: 24,
  },

  role: {
    fontSize: 14,
    color: '#003172',
    fontWeight: '500',
    marginTop: 2,
  },
  roleDot: {
    color: '#434751',
    fontWeight: '400',
  },

  headerRightSpacer: {
    width: 24,
    height: 50,
  },

  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },

  roleIcon: {
    width: 12,
    height: 12,
    resizeMode: 'contain',
    tintColor: '#003172',
    marginRight: 6,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
  },
  roleHighlight: {
    color: '#003172',
  },
  headerSide: {
    width: 32,
    height: 32,
  },
  searchInput: {
    marginTop: 0,
    marginBottom: 16,
  },
});
