import { HeaderBackButton } from '@/components/HeaderBackButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SearchInput } from '@/components/SearchInput';
import { colors } from '@/constants/theme';
import React, { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

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
  const [search, setSearch] = useState('');

  const filteredMembers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return MEMBERS;
    }

    return MEMBERS.filter((member) =>
      member.name.toLowerCase().includes(normalizedSearch),
    );
  }, [search]);

  return (
    <View style={styles.safeArea}>
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
        keyboardShouldPersistTaps="handled"
      >
        <SearchInput
          value={search}
          onChangeText={setSearch}
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

        {filteredMembers.length > 0 ? (
          filteredMembers.map((member) => (
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
          ))
        ) : (
          <Text style={styles.emptyText}>No se encontraron miembros</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: 24,
    elevation: 0,
    shadowOpacity: 0,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  searchInput: {
    marginBottom: 16,
  },
  filters: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  activeChip: {
    backgroundColor: colors.bluePrimary,
    height: 32,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeChipText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    textAlign: 'center',
  },
  inactiveChip: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray100,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiveChipText: {
    color: colors.gray950,
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
    backgroundColor: colors.white,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
    borderColor: colors.gray100,
    padding: 16,
    shadowColor: colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
  },
  avatarText: {
    color: colors.gray700,
    fontWeight: '700',
    fontSize: 14,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray950,
    lineHeight: 24,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  role: {
    fontSize: 14,
    color: colors.blueSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  roleHighlight: {
    color: colors.blueSecondary,
  },
  roleIcon: {
    width: 12,
    height: 12,
    resizeMode: 'contain',
    tintColor: colors.blueSecondary,
    marginRight: 6,
  },
  headerSide: {
    width: 32,
    height: 32,
  },
  emptyText: {
    marginTop: 24,
    textAlign: 'center',
    color: colors.gray700,
    fontSize: 14,
    fontWeight: '500',
  },
});
