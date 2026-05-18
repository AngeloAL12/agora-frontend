import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { BUILDINGS } from '@/constants/mapData';
import { colors, typography } from '@/constants/theme';
import type { BuildingData } from '@/types/map';

interface RoutePanelProps {
  visible: boolean;
  originLabel: string | null;
  destinationLabel: string | null;
  selectingField: 'origin' | 'destination' | null;
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onSelectField: (field: 'origin' | 'destination') => void;
  onSelectBuilding: (building: BuildingData) => void;
  onClear: () => void;
  onClose: () => void;
}

export default function RoutePanel({
  visible,
  originLabel,
  destinationLabel,
  selectingField,
  searchQuery,
  onSearchChange,
  onSelectField,
  onSelectBuilding,
  onClear,
  onClose,
}: RoutePanelProps) {
  if (!visible) return null;

  const filtered = BUILDINGS.filter(
    (b) =>
      b.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.code.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ruta</Text>
        <Pressable onPress={onClose} hitSlop={12}>
          <Ionicons name="close" size={22} color={colors.gray700} />
        </Pressable>
      </View>

      <Pressable
        style={[
          styles.fieldRow,
          selectingField === 'origin' && styles.fieldActive,
        ]}
        onPress={() => onSelectField('origin')}
      >
        <View style={[styles.dot, { backgroundColor: '#4285F4' }]} />
        <Text style={[styles.fieldText, !originLabel && styles.placeholder]}>
          {originLabel ?? 'Mi ubicación'}
        </Text>
      </Pressable>

      <Pressable
        style={[
          styles.fieldRow,
          selectingField === 'destination' && styles.fieldActive,
        ]}
        onPress={() => onSelectField('destination')}
      >
        <View style={[styles.dot, { backgroundColor: '#F1C806' }]} />
        <Text
          style={[styles.fieldText, !destinationLabel && styles.placeholder]}
        >
          {destinationLabel ?? 'Seleccionar destino'}
        </Text>
      </Pressable>

      {selectingField && (
        <View style={styles.searchSection}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar edificio..."
            placeholderTextColor={colors.searchPlaceholder}
            value={searchQuery}
            onChangeText={onSearchChange}
            autoFocus
          />
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id.toString()}
            style={styles.list}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable
                style={styles.listItem}
                onPress={() => onSelectBuilding(item)}
              >
                <Ionicons
                  name="business-outline"
                  size={18}
                  color={colors.gray700}
                />
                <Text style={styles.listItemText}>{item.label}</Text>
              </Pressable>
            )}
          />
        </View>
      )}

      {(originLabel || destinationLabel) && (
        <Pressable style={styles.clearButton} onPress={onClear}>
          <Text style={styles.clearText}>Limpiar ruta</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 12,
  },
  title: {
    fontSize: 17,
    fontFamily: typography.fontFamily.manropeBold,
    color: colors.gray950,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: colors.gray100,
    marginBottom: 8,
  },
  fieldActive: {
    borderWidth: 1.5,
    borderColor: colors.bluePrimary,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  fieldText: {
    fontSize: 15,
    fontFamily: typography.fontFamily.interMedium,
    color: colors.gray900,
  },
  placeholder: {
    color: colors.searchPlaceholder,
  },
  searchSection: {
    marginTop: 8,
  },
  searchInput: {
    backgroundColor: colors.gray100,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.gray900,
  },
  list: {
    maxHeight: 180,
    marginTop: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  listItemText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.gray900,
  },
  clearButton: {
    alignSelf: 'center',
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  clearText: {
    fontSize: 13,
    fontFamily: typography.fontFamily.interMedium,
    color: colors.gray700,
  },
});
