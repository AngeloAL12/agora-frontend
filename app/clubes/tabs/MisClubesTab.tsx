import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ClubUnido {
  id: string;
  nombre: string;
  rol: 'admin' | 'miembro';
  nuevasActividades: number;
  imagen: string;
}

interface MisClubesTabProps {
  onVerDetalle: (clubId: string) => void;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const MIS_CLUBES: ClubUnido[] = [
  {
    id: '1',
    nombre: 'Lectores Apasionados',
    rol: 'admin',
    nuevasActividades: 3,
    imagen: 'https://picsum.photos/seed/club1/80/80',
  },
  {
    id: '3',
    nombre: 'Code & Café',
    rol: 'miembro',
    nuevasActividades: 0,
    imagen: 'https://picsum.photos/seed/club3/80/80',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function MisClubesTab({ onVerDetalle }: MisClubesTabProps) {
  if (MIS_CLUBES.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>🏛️</Text>
        <Text style={styles.emptyTitle}>Aún no perteneces a ningún club</Text>
        <Text style={styles.emptySubtitle}>
          Explora y únete a comunidades que te interesen
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={MIS_CLUBES}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listaContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.clubCard}
          onPress={() => onVerDetalle(item.id)}
          activeOpacity={0.85}
        >
          <View style={styles.imageWrapper}>
            <Image source={{ uri: item.imagen }} style={styles.clubImagen} />
            {item.nuevasActividades > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.nuevasActividades}</Text>
              </View>
            )}
          </View>
          <View style={styles.clubInfo}>
            <Text style={styles.clubNombre}>{item.nombre}</Text>
            <View style={styles.rolWrapper}>
              <Text
                style={[
                  styles.rolText,
                  item.rol === 'admin' && styles.rolAdmin,
                ]}
              >
                {item.rol === 'admin' ? '👑 Administrador' : '👤 Miembro'}
              </Text>
            </View>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      )}
    />
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  listaContent: { paddingHorizontal: 16, gap: 10, paddingBottom: 20 },
  clubCard: {
    flexDirection: 'row',
    backgroundColor: '#1A1A24',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2D2D3A',
  },
  imageWrapper: { position: 'relative', marginRight: 14 },
  clubImagen: { width: 52, height: 52, borderRadius: 13 },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  clubInfo: { flex: 1 },
  clubNombre: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 4,
  },
  rolWrapper: { flexDirection: 'row' },
  rolText: { color: '#6B7280', fontSize: 13 },
  rolAdmin: { color: '#F59E0B' },
  arrow: { color: '#4B5563', fontSize: 22, fontWeight: '300' },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
