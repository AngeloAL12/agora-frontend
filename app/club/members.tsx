import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Image as ExpoImage } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ConfirmBottomSheet from '@/components/ConfirmBottomSheet';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SearchInput } from '@/components/SearchInput';
import MemberCard from '@/components/clubs/MemberCard';
import { colors, typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useSearch } from '@/hooks/useSearch';
import {
  getClubById,
  getClubMembers,
  removeMember,
  transferLeader,
} from '@/services/clubService';
import { ClubMember } from '@/types/club';

type Filter = 'all' | 'leaders';
type PendingAction = 'expel' | 'promote';

export default function MembersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { token, user } = useAuth();

  const confirmRef = useRef<BottomSheetModal>(null);

  const [members, setMembers] = useState<ClubMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLeader, setIsLeader] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [menuMemberId, setMenuMemberId] = useState<number | null>(null);
  const [pendingMemberId, setPendingMemberId] = useState<number | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>('expel');
  const [acting, setActing] = useState(false);

  const load = useCallback(async () => {
    if (!id || !token) return;
    try {
      const [club, data] = await Promise.all([
        getClubById(id),
        getClubMembers(Number(id), token),
      ]);
      setMembers(data);
      setIsLeader(user ? club.id_leader === user.id : false);
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
    }
  }, [id, token, user]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered =
    filter === 'leaders' ? members.filter((m) => m.is_leader) : members;

  const searched = useSearch(searchQuery, filtered, 'name');

  function toggleMenu(memberId: number) {
    setMenuMemberId((prev) => (prev === memberId ? null : memberId));
  }

  function closeMenu() {
    setMenuMemberId(null);
  }

  function handleActionPress(memberId: number, action: PendingAction) {
    closeMenu();
    setPendingMemberId(memberId);
    setPendingAction(action);
    confirmRef.current?.present();
  }

  async function confirmAction() {
    console.log('[members] confirmAction called', {
      pendingMemberId,
      pendingAction,
      id,
      hasToken: !!token,
    });
    if (!pendingMemberId || !token || !id) return;
    setActing(true);
    try {
      if (pendingAction === 'expel') {
        await removeMember(Number(id), pendingMemberId, token);
        setMembers((prev) => prev.filter((m) => m.id !== pendingMemberId));
      } else {
        await transferLeader(Number(id), pendingMemberId, token);
        setMembers((prev) =>
          prev.map((m) => ({
            ...m,
            is_leader: m.id === pendingMemberId,
          })),
        );
        setIsLeader(false);
      }
    } catch (err: unknown) {
      console.log('[members] confirmAction error', err);
      const detail =
        err && typeof err === 'object' && 'detail' in err
          ? String((err as { detail: unknown }).detail)
          : 'Ocurrió un error. Intenta de nuevo.';
      Alert.alert('Error', detail);
    } finally {
      setActing(false);
      setPendingMemberId(null);
      confirmRef.current?.dismiss();
    }
  }

  const pendingMember = members.find((m) => m.id === pendingMemberId);

  const confirmTitle =
    pendingAction === 'expel' ? 'Confirmar Expulsión' : 'Transferir Liderazgo';
  const confirmMessage =
    pendingAction === 'expel'
      ? `¿Estás seguro de expulsar del club a ${pendingMember?.name ?? 'esta persona'}?`
      : `¿Transferir el liderazgo del club a ${pendingMember?.name ?? 'esta persona'}? Perderás tus permisos de líder.`;
  const confirmLabel =
    pendingAction === 'expel'
      ? acting
        ? 'Expulsando...'
        : 'Expulsar miembro'
      : acting
        ? 'Transfiriendo...'
        : 'Transferir liderazgo';

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.bluePrimary} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScreenHeader
        variant="white"
        title="Miembros"
        align="center"
        showBackButton
        backButtonColor={colors.blueDark}
        containerStyle={styles.header}
      />

      {menuMemberId !== null && (
        <Pressable style={styles.menuBackdrop} onPress={closeMenu} />
      )}

      <View style={[styles.main, { paddingBottom: insets.bottom + 16 }]}>
        <SearchInput
          placeholder="Buscar miembros..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.searchPlaceholder}
        />

        {/* Filter chips */}
        <View style={styles.chips}>
          <TouchableOpacity
            style={[styles.chip, filter === 'all' && styles.chipActive]}
            onPress={() => setFilter('all')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.chipText,
                filter === 'all' && styles.chipTextActive,
              ]}
            >
              {`Todos (${members.length})`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.chip, filter === 'leaders' && styles.chipActive]}
            onPress={() => setFilter('leaders')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.chipText,
                filter === 'leaders' && styles.chipTextActive,
              ]}
            >
              Líderes
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={searched}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.cardWrap}>
              <MemberCard
                member={item}
                showOptions={isLeader && !item.is_leader}
                onOptionsPress={() => toggleMenu(item.id)}
              />

              {/* Inline context menu */}
              {menuMemberId === item.id && (
                <View style={styles.menu}>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => handleActionPress(item.id, 'promote')}
                    activeOpacity={0.7}
                  >
                    <View style={styles.menuIconWrap}>
                      <ExpoImage
                        source={require('@/assets/icons/clubs/moderator_shield.svg')}
                        style={styles.menuIcon}
                        contentFit="contain"
                        tintColor={colors.gray950}
                      />
                    </View>
                    <Text style={styles.menuItemText}>Dar moderador</Text>
                  </TouchableOpacity>
                  <View style={styles.menuDivider} />
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => handleActionPress(item.id, 'expel')}
                    activeOpacity={0.7}
                  >
                    <View style={styles.menuIconWrap}>
                      <ExpoImage
                        source={require('@/assets/icons/clubs/remove_user.svg')}
                        style={styles.menuIcon}
                        contentFit="contain"
                        tintColor={colors.errorText}
                      />
                    </View>
                    <Text style={[styles.menuItemText, styles.menuItemDanger]}>
                      Expulsar
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No se encontraron miembros.</Text>
          }
        />
      </View>

      <ConfirmBottomSheet
        ref={confirmRef}
        title={confirmTitle}
        message={confirmMessage}
        confirmLabel={confirmLabel}
        cancelLabel="Cancelar"
        onConfirm={confirmAction}
        onCancel={() => confirmRef.current?.dismiss()}
        onDismiss={() => setPendingMemberId(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  header: { shadowOpacity: 0, elevation: 0 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  main: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 20,
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 9999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  chipActive: {
    backgroundColor: colors.bluePrimary,
  },
  chipText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.interBold,
    color: colors.gray950,
    lineHeight: 16,
  },
  chipTextActive: {
    color: colors.white,
  },
  listContent: {
    paddingBottom: 8,
  },
  cardWrap: {
    position: 'relative',
  },
  separator: {
    height: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.gray700,
    fontFamily: typography.fontFamily.interRegular,
    fontSize: 14,
    marginTop: 32,
  },
  menu: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 192,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle20,
    shadowColor: colors.blueSecondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 10,
    paddingVertical: 9,
    paddingHorizontal: 1,
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIconWrap: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  menuIcon: {
    width: 18,
    height: 18,
  },
  menuItemText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.gray950,
  },
  menuItemDanger: {
    fontFamily: typography.fontFamily.interSemiBold,
    color: colors.errorText,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.borderSubtle20,
  },
  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },
});
