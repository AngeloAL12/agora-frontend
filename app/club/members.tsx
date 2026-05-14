import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Image as ExpoImage } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ConfirmBottomSheet from '@/components/ConfirmBottomSheet';
import SuccessBottomSheet from '@/components/SuccessBottomSheet';
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

const MENU_WIDTH = 200;
const MENU_HEIGHT = 100; // approximate: two rows + divider

export default function MembersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { token, user } = useAuth();

  const confirmRef = useRef<BottomSheetModal>(null);
  const errorSheetRef = useRef<BottomSheetModal>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const [members, setMembers] = useState<ClubMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLeader, setIsLeader] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const [pendingMemberId, setPendingMemberId] = useState<number | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>('expel');
  const [acting, setActing] = useState(false);

  const load = useCallback(async () => {
    if (!id || !token) return;
    try {
      const [club, data] = await Promise.all([
        getClubById(id, token),
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

  function openMenu(
    memberId: number,
    position: { pageX: number; pageY: number },
  ) {
    setPendingMemberId(memberId);
    // Position the menu to the left of the tap so it doesn't go off-screen
    setMenuPos({
      top: position.pageY - MENU_HEIGHT / 2,
      right: 16,
    });
    setMenuVisible(true);
  }

  function closeMenu() {
    setMenuVisible(false);
  }

  function handleActionPress(action: PendingAction) {
    closeMenu();
    setPendingAction(action);
    confirmRef.current?.present();
  }

  async function confirmAction() {
    if (!pendingMemberId || !token || !id) return;
    setActing(true);
    try {
      if (pendingAction === 'expel') {
        await removeMember(Number(id), pendingMemberId, token);
        setMembers((prev) => prev.filter((m) => m.id !== pendingMemberId));
      } else {
        await transferLeader(Number(id), pendingMemberId, token);
        setMembers((prev) =>
          prev.map((m) => ({ ...m, is_leader: m.id === pendingMemberId })),
        );
        setIsLeader(false);
      }
    } catch (err: unknown) {
      const detail =
        err && typeof err === 'object' && 'detail' in err
          ? String((err as { detail: unknown }).detail)
          : 'Ocurrió un error. Intenta de nuevo.';
      setErrorMessage(detail);
      errorSheetRef.current?.present();
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

      <View style={[styles.main, { paddingBottom: insets.bottom + 16 }]}>
        <SearchInput
          placeholder="Buscar miembros..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.searchPlaceholder}
        />

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
            <MemberCard
              member={item}
              showOptions={isLeader && !item.is_leader}
              onOptionsPress={(pos) => openMenu(item.id, pos)}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No se encontraron miembros.</Text>
          }
        />
      </View>

      {/* Dropdown menu using Modal — same pattern as career dropdown */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="none"
        onRequestClose={closeMenu}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={closeMenu} />
        <View style={[styles.menu, { top: menuPos.top, right: menuPos.right }]}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleActionPress('promote')}
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
            onPress={() => handleActionPress('expel')}
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
      </Modal>

      <ConfirmBottomSheet
        ref={confirmRef}
        title={confirmTitle}
        message={confirmMessage}
        confirmLabel={confirmLabel}
        cancelLabel="Cancelar"
        onConfirm={confirmAction}
        onCancel={() => {
          confirmRef.current?.dismiss();
          setPendingMemberId(null);
        }}
      />

      <SuccessBottomSheet
        ref={errorSheetRef}
        title="Error"
        message={errorMessage}
        variant="error"
        primaryLabel="Entendido"
        secondaryLabel=""
        onPrimaryPress={() => errorSheetRef.current?.dismiss()}
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
  chipActive: { backgroundColor: colors.bluePrimary },
  chipText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.interBold,
    color: colors.gray950,
    lineHeight: 16,
  },
  chipTextActive: { color: colors.white },
  listContent: { paddingBottom: 8 },
  separator: { height: 8 },
  emptyText: {
    textAlign: 'center',
    color: colors.gray700,
    fontFamily: typography.fontFamily.interRegular,
    fontSize: 14,
    marginTop: 32,
  },

  // Dropdown menu
  menu: {
    position: 'absolute',
    width: MENU_WIDTH,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle20,
    shadowColor: colors.blueSecondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    paddingVertical: 4,
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIconWrap: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: { width: 18, height: 18 },
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
});
