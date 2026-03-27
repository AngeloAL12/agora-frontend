import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Club {
  id: string;
  nombre: string;
  descripcion: string;
  miembros: number;
  categoria: string;
  imagen: string;
  esPublico: boolean;
}

interface ExplorarTabProps {
  onVerDetalle: (clubId: string) => void;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_CLUBS: Club[] = [
  {
    id: '1',
    nombre: 'Lectores Apasionados',
    descripcion: 'Un espacio para amantes de la literatura',
    miembros: 128,
    categoria: 'Literatura',
    imagen: 'https://picsum.photos/seed/club1/80/80',
    esPublico: true,
  },
  {
    id: '2',
    nombre: 'Fotógrafos Urbanos',
    descripcion: 'Captura la ciudad con otros entusiastas',
    miembros: 74,
    categoria: 'Fotografía',
    imagen: 'https://picsum.photos/seed/club2/80/80',
    esPublico: true,
  },
  {
    id: '3',
    nombre: 'Code & Café',
    descripcion: 'Programación, proyectos y buena compañía',
    miembros: 203,
    categoria: 'Tecnología',
    imagen: 'https://picsum.photos/seed/club3/80/80',
    esPublico: false,
  },
];

const CATEGORIAS = [
  'Todos',
  'Literatura',
  'Fotografía',
  'Tecnología',
  'Arte',
  'Deporte',
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function ExplorarTab({ onVerDetalle }: ExplorarTabProps) {
  const [busqueda, setBusqueda] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');

  const clubesFiltrados = MOCK_CLUBS.filter((club) => {
    const matchBusqueda = club.nombre
      .toLowerCase()
      .includes(busqueda.toLowerCase());
    const matchCategoria =
      categoriaActiva === 'Todos' || club.categoria === categoriaActiva;
    return matchBusqueda && matchCategoria;
  });

  const renderClub = useCallback(
    ({ item }: { item: Club }) => (
      <TouchableOpacity
        style={styles.clubCard}
        onPress={() => onVerDetalle(item.id)}
        activeOpacity={0.85}
      >
        <Image source={{ uri: item.imagen }} style={styles.clubImagen} />
        <View style={styles.clubInfo}>
          <View style={styles.clubHeader}>
            <Text style={styles.clubNombre}>{item.nombre}</Text>
            <View
              style={[styles.badge, !item.esPublico && styles.badgePrivado]}
            >
              <Text style={styles.badgeText}>
                {item.esPublico ? 'Público' : 'Privado'}
              </Text>
            </View>
          </View>
          <Text style={styles.clubDescripcion} numberOfLines={1}>
            {item.descripcion}
          </Text>
          <View style={styles.clubMeta}>
            <Text style={styles.clubCategoria}>{item.categoria}</Text>
            <Text style={styles.clubMiembros}>👥 {item.miembros} miembros</Text>
          </View>
        </View>
      </TouchableOpacity>
    ),
    [onVerDetalle],
  );

  return (
    <View style={styles.container}>
      {/* Barra de búsqueda */}
      <View style={styles.searchWrapper}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar clubes..."
          placeholderTextColor="#4B5563"
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      {/* Filtros de categoría */}
      <FlatList
        data={CATEGORIAS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.categoriasList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoriaChip,
              categoriaActiva === item && styles.categoriaChipActivo,
            ]}
            onPress={() => setCategoriaActiva(item)}
          >
            <Text
              style={[
                styles.categoriaText,
                categoriaActiva === item && styles.categoriaTextActivo,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Lista de clubes */}
      <FlatList
        data={clubesFiltrados}
        keyExtractor={(item) => item.id}
        renderItem={renderClub}
        contentContainerStyle={styles.listaContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>No se encontraron clubes</Text>
          </View>
        }
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A24',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, color: '#FFFFFF', fontSize: 15 },
  categoriasList: { paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  categoriaChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#1A1A24',
    borderWidth: 1,
    borderColor: '#2D2D3A',
  },
  categoriaChipActivo: { backgroundColor: '#6C63FF', borderColor: '#6C63FF' },
  categoriaText: { color: '#6B7280', fontSize: 13, fontWeight: '600' },
  categoriaTextActivo: { color: '#FFFFFF' },
  listaContent: { paddingHorizontal: 16, gap: 12, paddingBottom: 20 },
  clubCard: {
    flexDirection: 'row',
    backgroundColor: '#1A1A24',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2D2D3A',
  },
  clubImagen: { width: 56, height: 56, borderRadius: 14, marginRight: 14 },
  clubInfo: { flex: 1 },
  clubHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  clubNombre: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
    flex: 1,
    marginRight: 8,
  },
  badge: {
    backgroundColor: 'rgba(108,99,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgePrivado: { backgroundColor: 'rgba(239,68,68,0.15)' },
  badgeText: { color: '#A78BFA', fontSize: 11, fontWeight: '600' },
  clubDescripcion: { color: '#6B7280', fontSize: 13, marginBottom: 6 },
  clubMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  clubCategoria: { color: '#6C63FF', fontSize: 12, fontWeight: '600' },
  clubMiembros: { color: '#4B5563', fontSize: 12 },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { color: '#4B5563', fontSize: 15 },
});
