import { router } from 'expo-router';
import React from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const members = [
  { id: '1', name: 'Angelo Alvarado', role: 'Administrador', avatar: 'AA' },
  { id: '2', name: 'Sofía Martínez', role: 'Moderador', avatar: 'SM' },
  { id: '3', name: 'Carlos Mendoza', role: 'Miembro', avatar: 'CM' },
  { id: '4', name: 'Diego Torres', role: 'Miembro', avatar: 'DT' },
  { id: '5', name: 'Lucía Ramirez', role: 'Miembro', avatar: 'LR' },
  { id: '6', name: 'Elena Gómez', role: 'Miembro', avatar: 'EG' },
];

export default function ClubMembersScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerIcon}
        >
          <Image
            source={require('@/assets/icons/regreso.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Miembros</Text>

        <View style={styles.headerIcon} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            placeholder="Buscar miembros..."
            placeholderTextColor="#8A9099"
            style={styles.searchInput}
          />
        </View>

        <View style={styles.filters}>
          <TouchableOpacity
            style={[styles.filterButton, styles.filterButtonActive]}
          >
            <Text style={styles.filterTextActive}>Todos (42)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>Administradores</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.list}>
          {members.map((member) => (
            <View key={member.id} style={styles.memberCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{member.avatar}</Text>
              </View>

              <View>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberRole}>◉ {member.role}</Text>
              </View>
            </View>
          ))}
        </View>
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
    height: 56,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerIcon: {
    width: 32,
    height: 32,
    justifyContent: 'center',
  },
  backIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
    tintColor: '#003172',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: '#192A56',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  searchBox: {
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F7F8FA',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginTop: 8,
  },
  searchIcon: {
    fontSize: 18,
    color: '#8A9099',
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#191C1E',
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    marginBottom: 12,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonActive: {
    backgroundColor: '#003172',
    borderColor: '#003172',
  },
  filterText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#434751',
  },
  filterTextActive: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  list: {
    gap: 12,
    paddingBottom: 32,
  },
  memberCard: {
    minHeight: 72,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,

    shadowColor: '#003172',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E8EEF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#003172',
  },
  memberName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#191C1E',
  },
  memberRole: {
    marginTop: 3,
    fontSize: 11,
    color: '#003172',
  },
});
