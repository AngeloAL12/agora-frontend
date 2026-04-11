import React, { useState, useEffect } from 'react';
import {
  Alert,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Image,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AyudaIcon from '../../assets/Iconos/ayuda-soporte.svg';
import EditarInfoIcon from '../../assets/Iconos/editar-info.svg';
import NotificationIcon from '../../assets/Iconos/notification.svg';

// ─── Colores ──────────────────────────────────────────────────────────────────
const COLORS = {
  headerBg: '#1E488F',
  primary: '#1E488F',
  bg: '#F8FAFF', // Fondo de la pantalla
  white: '#FFFFFF',

  userName: '#FFFFFF',
  statsValue: '#FFFFFF',
  careerText: '#D8EAFE',

  textDark: '#191C1E',
  iconBg: '#D8E2FF',
  iconColor: '#192A56',

  tabContainerBg: '#F3F4F6',
  tabActiveBg: '#FFFFFF',
  tabTextActive: '#003172',
  tabTextInactive: '#434751',

  textMuted: '#6B7280',
  border: '#E5E7EB',
  logoutBg: '#FFDAD6',
  logoutText: '#BA1A1A',
};

// ─── Datos de ejemplo (Ajustados a tu imagen de diseño) ───────────────────────
interface UserProfile {
  name: string;
  career: string;
  avatar: any;
  stats: { clubs: number; reports: number; likes: number };
}

interface ActivityItem {
  id: string;
  type: 'club' | 'comment' | 'like';
  clubName?: string;
  location?: string;
  timestamp?: string;
  title?: string;
  subtitle?: string;
  dotColor: string;
}

const RECENT_ACTIVITY: ActivityItem[] = [
  {
    id: '1',
    type: 'club',
    clubName: 'Ajedrez',
    location: 'Edificio G',
    timestamp: 'Hace 2 horas',
    dotColor: '#EAB308', // Amarillo del diseño
  },
  {
    id: '2',
    type: 'comment',
    title: 'Comentaste en una publicación',
    subtitle: 'Ayer • 14:30 PM',
    dotColor: '#1E488F', // Azul oscuro
  },
  {
    id: '3',
    type: 'like',
    title: 'Diste like a una publicación',
    subtitle: '05 Mar 2026',
    dotColor: '#9CA3AF', // Gris
  },
];

// ─── Componente principal ─────────────────────────────────────────────────────
export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<'info' | 'activity'>('info');
  const [notificationsOn, setNotifications] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);

  const handleEditInfo = () =>
    Alert.alert('Editar información', 'Navega a la pantalla de edición.');
  const handleHelp = () => Alert.alert('Ayuda y soporte', 'Abriendo soporte…');
  const handleLogout = () =>
    Alert.alert('Cerrar sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: () => router.replace('/'),
      },
    ]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setTimeout(() => {
          setUser({
            name: 'Angelo Alvarado',
            career: 'Ingeniería en Sistemas Computacionales',
            avatar: null,
            stats: { clubs: 12, reports: 4, likes: 156 },
          });
        }, 500);
      } catch (error) {
        console.error('Error cargando el perfil:', error);
      }
    };
    fetchUserData();
  }, []);

  if (!user) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerBg} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HEADER ── */}
        <View style={styles.header}>
          <View style={styles.avatarWrapper}>
            {user.avatar ? (
              <Image source={user.avatar} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons
                  name="person-outline"
                  size={44}
                  color="rgba(255,255,255,0.7)"
                />
              </View>
            )}
          </View>

          {/* Nombre y Carrera */}
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userCareer}>{user.career}</Text>

          <View style={styles.statsRow}>
            <StatBox label="CLUBES" value={user.stats.clubs} />
            <StatBox label="REPORTES" value={user.stats.reports} />
            <StatBox label="LIKES" value={user.stats.likes} />
          </View>
        </View>

        {/* ── TABS ── */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'info' && styles.tabActive]}
            onPress={() => setActiveTab('info')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'info' && styles.tabTextActive,
              ]}
            >
              Información
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'activity' && styles.tabActive]}
            onPress={() => setActiveTab('activity')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'activity' && styles.tabTextActive,
              ]}
            >
              Actividad
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── CONTENIDO ── */}
        <View style={styles.contentContainer}>
          {activeTab === 'info' ? (
            <View style={styles.cardInfo}>
              <InfoTab
                notificationsOn={notificationsOn}
                onToggleNotifications={setNotifications}
                onEditInfo={handleEditInfo}
                onHelp={handleHelp}
                onLogout={handleLogout}
              />
            </View>
          ) : (
            <View style={styles.activityContainer}>
              <Text style={styles.activityTitle}>Actividad Reciente</Text>
              <View style={styles.cardActivity}>
                <ActivityTab activities={RECENT_ACTIVITY} />
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─── InfoTab ──────────────────────────────────────────────────────────────────
function InfoTab({
  notificationsOn,
  onToggleNotifications,
  onEditInfo,
  onHelp,
  onLogout,
}: {
  notificationsOn: boolean;
  onToggleNotifications: (v: boolean) => void;
  onEditInfo: () => void;
  onHelp: () => void;
  onLogout: () => void;
}) {
  return (
    <View>
      <TouchableOpacity
        style={styles.menuItem}
        activeOpacity={0.7}
        onPress={onEditInfo}
      >
        <View style={styles.menuIconBg}>
          <EditarInfoIcon width={20} height={20} fill={COLORS.iconColor} />
        </View>
        <Text style={styles.menuLabel}>Editar información</Text>
        <Text style={styles.menuChevron}>{'›'}</Text>
      </TouchableOpacity>

      <View style={styles.separator} />

      <View style={styles.menuItem}>
        <View style={styles.menuIconBg}>
          <NotificationIcon width={20} height={20} fill={COLORS.iconColor} />
        </View>
        <Text style={styles.menuLabel}>Notificaciones</Text>
        <Switch
          value={notificationsOn}
          onValueChange={onToggleNotifications}
          trackColor={{ false: '#D1D5DB', true: COLORS.primary }}
          thumbColor="#FFFFFF"
        />
      </View>

      <View style={styles.separator} />

      <TouchableOpacity
        style={styles.menuItem}
        activeOpacity={0.7}
        onPress={onHelp}
      >
        <View style={styles.menuIconBg}>
          <AyudaIcon width={20} height={20} fill={COLORS.iconColor} />
        </View>
        <Text style={styles.menuLabel}>Ayuda y soporte</Text>
        <Text style={styles.menuChevron}>{'›'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={onLogout}
        activeOpacity={0.8}
      >
        <Ionicons name="log-out-outline" size={20} color={COLORS.logoutText} />
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── ActivityTab (Corregido a diseño de línea pura) ───────────────────────────
function ActivityTab({ activities }: { activities: ActivityItem[] }) {
  return (
    <View>
      {activities.map((item, index) => {
        const isClub = item.type === 'club';
        const displayTitle = isClub
          ? `Asistencia al Club de ${item.clubName}`
          : item.title;
        const displaySubtitle = isClub
          ? `${item.timestamp} • ${item.location}`
          : item.subtitle;

        return (
          <View key={item.id} style={styles.activityItem}>
            <View style={styles.timelineCol}>
              <View style={[styles.dot, { backgroundColor: item.dotColor }]} />
              {index < activities.length - 1 && (
                <View style={styles.timelineLine} />
              )}
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityItemTitle}>{displayTitle}</Text>
              <Text style={styles.activityItemSubtitle}>{displaySubtitle}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.headerBg },
  scroll: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { flexGrow: 1, paddingBottom: 40 }, // Espacio extra para la barra de navegación flotante

  header: {
    backgroundColor: COLORS.headerBg,
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 25,
    paddingHorizontal: 20,
  },
  avatarWrapper: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    overflow: 'hidden',
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },

  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.userName,
    marginBottom: 4,
  },
  userCareer: {
    fontSize: 13,
    color: COLORS.careerText,
    textAlign: 'center',
    marginBottom: 20,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },

  statBox: {
    backgroundColor: '#345B9D',
    borderRadius: 16,
    paddingVertical: 14,
    width: '31%',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  statLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // ── Tabs corregidos (Estilo Píldora) ──
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.tabContainerBg,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 25, // Mucho más redondeado
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: COLORS.tabActiveBg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: { fontSize: 14, fontWeight: '600', color: COLORS.tabTextInactive },
  tabTextActive: { color: COLORS.tabTextActive },

  // ── Contenedores de contenido ──
  contentContainer: { marginTop: 12, flex: 1 },
  cardInfo: {
    marginHorizontal: 20,
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 12,
    //    elevation: 2,
    //    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5,
  },
  activityContainer: { flex: 1 },

  // ── Menú de Información ──
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  menuIconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.iconBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textDark,
  },
  menuChevron: { fontSize: 22, color: COLORS.textMuted },
  separator: { height: 1, backgroundColor: COLORS.border },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.logoutBg,
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 12,
    gap: 8,
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: COLORS.logoutText },

  // ── Sección de Actividad ──
  activitySection: { paddingHorizontal: 20 },
  activityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 16,
    marginLeft: 20,
  },

  cardActivity: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    paddingTop: 20,
    paddingBottom: 8,
    paddingRight: 16,
    paddingLeft: 22,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  activityItem: {
    flexDirection: 'row',
    minHeight: 30,
  },
  timelineCol: {
    width: 20,
    alignItems: 'center',
    marginRight: 20,
  },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
  activityContent: { flex: 1, paddingBottom: 12 },
  activityItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
    lineHeight: 18,
  },
  activityItemSubtitle: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
});
