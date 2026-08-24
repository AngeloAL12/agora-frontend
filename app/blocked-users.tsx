import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import ConfirmBottomSheet from '@/components/ConfirmBottomSheet';
import { ScreenHeader } from '@/components/ScreenHeader';
import { colors, typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { clearSessionMessageCache } from '@/hooks/useClubChat';
import { clubPostsCache } from '@/services/cacheService';
import { getBlockedUsers, unblockUser } from '@/services/contentSafetyService';
import { BlockedUser } from '@/types/contentSafety';

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export default function BlockedUsersScreen() {
  const { token } = useAuth();
  const insets = useSafeAreaInsets();
  const [users, setUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<BlockedUser | null>(null);
  const [unblocking, setUnblocking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const confirmRef = useRef<BottomSheetModal>(null);

  const load = useCallback(
    async (refresh = false) => {
      if (!token) return;
      if (refresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      try {
        setUsers(await getBlockedUsers(token));
      } catch (requestError) {
        const apiError = requestError as { detail?: string };
        setError(apiError?.detail ?? 'No se pudo cargar la lista.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token],
  );

  useEffect(() => {
    void load();
  }, [load]);

  async function handleUnblock() {
    if (!token || !selectedUser || unblocking) return;
    setUnblocking(true);
    setError(null);
    try {
      await unblockUser(selectedUser.id, token);
      setUsers((current) =>
        current.filter((user) => user.id !== selectedUser.id),
      );
      clearSessionMessageCache();
      for (const key of Object.keys(clubPostsCache)) delete clubPostsCache[key];
      confirmRef.current?.dismiss();
      setSelectedUser(null);
    } catch (requestError) {
      const apiError = requestError as { detail?: string };
      setError(apiError?.detail ?? 'No se pudo desbloquear al usuario.');
    } finally {
      setUnblocking(false);
    }
  }

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.root}>
      <ScreenHeader
        variant="white"
        title="Usuarios bloqueados"
        align="center"
        showBackButton
        backButtonColor={colors.blueDark}
      />

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.bluePrimary} />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 30 },
            users.length === 0 && styles.emptyContent,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void load(true)}
              tintColor={colors.bluePrimary}
            />
          }
          ListHeaderComponent={
            users.length > 0 ? (
              <Text style={styles.explanation}>
                No verás publicaciones, comentarios ni mensajes de estas
                personas.
              </Text>
            ) : null
          }
          renderItem={({ item }) => (
            <View style={styles.userCard}>
              {item.photo ? (
                <ExpoImage
                  source={{ uri: item.photo }}
                  style={styles.avatar}
                  contentFit="cover"
                />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                  <Text style={styles.initials}>{getInitials(item.name)}</Text>
                </View>
              )}
              <View style={styles.userCopy}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.blockedDate}>
                  Bloqueado el{' '}
                  {new Date(item.blocked_at).toLocaleDateString('es-MX')}
                </Text>
              </View>
              <Pressable
                onPress={() => {
                  setSelectedUser(item);
                  setError(null);
                  requestAnimationFrame(() => confirmRef.current?.present());
                }}
                style={({ pressed }) => [
                  styles.unblockButton,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={styles.unblockText}>Desbloquear</Text>
              </Pressable>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={styles.gap} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="people-outline"
                  size={30}
                  color={colors.bluePrimary}
                />
              </View>
              <Text style={styles.emptyTitle}>No has bloqueado a nadie</Text>
              <Text style={styles.emptyText}>
                Puedes bloquear a una persona al denunciar sus publicaciones,
                comentarios o mensajes.
              </Text>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>
          }
        />
      )}

      {selectedUser ? (
        <ConfirmBottomSheet
          ref={confirmRef}
          title={`¿Desbloquear a ${selectedUser.name}?`}
          message="Volverás a ver el contenido que publique en los clubes que comparten."
          confirmLabel="Sí, desbloquear"
          cancelLabel="Cancelar"
          isLoading={unblocking}
          errorMessage={error}
          onConfirm={() => void handleUnblock()}
          onCancel={() => confirmRef.current?.dismiss()}
          onDismiss={() => {
            setSelectedUser(null);
            setError(null);
          }}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.whiteSoft },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16 },
  emptyContent: { flexGrow: 1 },
  explanation: {
    marginBottom: 14,
    fontSize: 13,
    lineHeight: 19,
    color: colors.gray700,
    fontFamily: typography.fontFamily.interRegular,
  },
  userCard: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.white,
    gap: 11,
  },
  avatar: { width: 46, height: 46, borderRadius: 15 },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryContainer,
  },
  initials: {
    fontSize: 14,
    color: colors.blueSecondary,
    fontFamily: typography.fontFamily.interSemiBold,
  },
  userCopy: { flex: 1, gap: 2 },
  userName: {
    fontSize: 14,
    color: colors.gray950,
    fontFamily: typography.fontFamily.interSemiBold,
  },
  blockedDate: {
    fontSize: 10,
    color: colors.activityGray,
    fontFamily: typography.fontFamily.interRegular,
  },
  unblockButton: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: colors.gray100,
  },
  unblockText: {
    fontSize: 11,
    color: colors.bluePrimary,
    fontFamily: typography.fontFamily.interSemiBold,
  },
  gap: { height: 9 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryContainer,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    color: colors.blueDark,
    fontFamily: typography.fontFamily.manropeBold,
  },
  emptyText: {
    marginTop: 6,
    maxWidth: 290,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 20,
    color: colors.gray700,
    fontFamily: typography.fontFamily.interRegular,
  },
  errorText: {
    marginTop: 12,
    fontSize: 12,
    color: colors.errorText,
    fontFamily: typography.fontFamily.interMedium,
  },
});
