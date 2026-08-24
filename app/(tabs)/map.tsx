import { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppBottomSheet from '@/components/AppBottomSheet';
import BuildingInfoSheet from '@/components/map/BuildingInfoSheet';
import MapOverlay from '@/components/map/MapOverlay';
import { NotificationsModal } from '@/components/NotificationsModal';
import RoutePanel from '@/components/map/RoutePanel';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SearchInput } from '@/components/SearchInput';
import ZoomableMap, { ZoomableMapRef } from '@/components/map/ZoomableMap';
import { BUILDINGS, ROUTE_EDGES, ROUTE_NODES } from '@/constants/mapData';
import { colors, typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useNotificationsContext } from '@/context/NotificationsContext';
import { useUserLocation } from '@/hooks/useUserLocation';
import { getBuildingDetail } from '@/services/mapService';
import type {
  BuildingCategory,
  BuildingData,
  BuildingDetailResponse,
  MapPosition,
} from '@/types/map';
import { pixelDistanceToMeters } from '@/utils/coordinateTransform';
import { findPath } from '@/utils/pathfinding';

// ── SVG icon strings ────────────────────────────────────────────────────────
const ZOOM_IN_ICON = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 8H0V6H6V0H8V6H14V8H8V14H6V8Z" fill="currentColor"/></svg>`;
const ZOOM_OUT_ICON = `<svg width="14" height="2" viewBox="0 0 14 2" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 2V0H14V2H0Z" fill="currentColor"/></svg>`;
const LOCATION_ICON = `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.95 21.9V19.9C7.86667 19.6667 6.07917 18.8042 4.5875 17.3125C3.09583 15.8208 2.23333 14.0333 2 11.95H0V9.95H2C2.23333 7.86667 3.09583 6.07917 4.5875 4.5875C6.07917 3.09583 7.86667 2.23333 9.95 2V0H11.95V2C14.0333 2.23333 15.8208 3.09583 17.3125 4.5875C18.8042 6.07917 19.6667 7.86667 19.9 9.95H21.9V11.95H19.9C19.6667 14.0333 18.8042 15.8208 17.3125 17.3125C15.8208 18.8042 14.0333 19.6667 11.95 19.9V21.9H9.95ZM10.95 17.95C12.8833 17.95 14.5333 17.2667 15.9 15.9C17.2667 14.5333 17.95 12.8833 17.95 10.95C17.95 9.01667 17.2667 7.36667 15.9 6C14.5333 4.63333 12.8833 3.95 10.95 3.95C9.01667 3.95 7.36667 4.63333 6 6C4.63333 7.36667 3.95 9.01667 3.95 10.95C3.95 12.8833 4.63333 14.5333 6 15.9C7.36667 17.2667 9.01667 17.95 10.95 17.95ZM10.95 14.95C9.85 14.95 8.90833 14.5583 8.125 13.775C7.34167 12.9917 6.95 12.05 6.95 10.95C6.95 9.85 7.34167 8.90833 8.125 8.125C8.90833 7.34167 9.85 6.95 10.95 6.95C12.05 6.95 12.9917 7.34167 13.775 8.125C14.5583 8.90833 14.95 9.85 14.95 10.95C14.95 12.05 14.5583 12.9917 13.775 13.775C12.9917 14.5583 12.05 14.95 10.95 14.95Z" fill="currentColor"/></svg>`;
const BUILDINGS_ICON = `<svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 10.5V9.33333H1.16667V0H7V0.583333H9.33333V9.33333H10.5V10.5H8.16667V1.75H7V10.5H0ZM2.33333 1.16667V9.33333V1.16667ZM4.66667 5.83333C4.83194 5.83333 4.97049 5.77743 5.08229 5.66563C5.1941 5.55382 5.25 5.41528 5.25 5.25C5.25 5.08472 5.1941 4.94618 5.08229 4.83437C4.97049 4.72257 4.83194 4.66667 4.66667 4.66667C4.50139 4.66667 4.36285 4.72257 4.25104 4.83437C4.13924 4.94618 4.08333 5.08472 4.08333 5.25C4.08333 5.41528 4.13924 5.55382 4.25104 5.66563C4.36285 5.77743 4.50139 5.83333 4.66667 5.83333ZM2.33333 9.33333H5.83333V1.16667H2.33333V9.33333Z" fill="currentColor"/></svg>`;
const LABS_ICON = `<svg width="9" height="12" viewBox="0 0 9 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 11.0833V9.91667H2.91667V8.75C2.10972 8.75 1.42188 8.46562 0.853125 7.89687C0.284375 7.32812 0 6.64028 0 5.83333C0 5.24028 0.162847 4.70069 0.488542 4.21458C0.814236 3.72847 1.25417 3.37361 1.80833 3.15C1.88611 2.81944 2.05868 2.55208 2.32604 2.34792C2.5934 2.14375 2.89722 2.04167 3.2375 2.04167L2.91667 1.1375L3.47083 0.933333L3.26667 0.408333L4.375 0L4.55 0.554167L5.10417 0.35L6.70833 4.725L6.15417 4.92917L6.35833 5.48333L5.25 5.89167L5.075 5.3375L4.52083 5.54167L4.17083 4.57917C4.025 4.71528 3.85729 4.81736 3.66771 4.88542C3.47813 4.95347 3.28611 4.97778 3.09167 4.95833C2.87778 4.93889 2.67847 4.87326 2.49375 4.76146C2.30903 4.64965 2.14861 4.51111 2.0125 4.34583C1.75 4.50139 1.5434 4.71042 1.39271 4.97292C1.24201 5.23542 1.16667 5.52222 1.16667 5.83333C1.16667 6.31944 1.33681 6.73264 1.67708 7.07292C2.01736 7.41319 2.43056 7.58333 2.91667 7.58333H7.58333V8.75H4.66667V9.91667H8.16667V11.0833H0ZM5.04583 4.40417L5.57083 4.2L4.57917 1.45833L4.025 1.6625L5.04583 4.40417ZM3.20833 4.08333C3.37361 4.08333 3.51215 4.02743 3.62396 3.91563C3.73576 3.80382 3.79167 3.66528 3.79167 3.5C3.79167 3.33472 3.73576 3.19618 3.62396 3.08437C3.51215 2.97257 3.37361 2.91667 3.20833 2.91667C3.04306 2.91667 2.90451 2.97257 2.79271 3.08437C2.6809 3.19618 2.625 3.33472 2.625 3.5C2.625 3.66528 2.6809 3.80382 2.79271 3.91563C2.90451 4.02743 3.04306 4.08333 3.20833 4.08333Z" fill="currentColor"/></svg>`;
// ── Category chip data ───────────────────────────────────────────────────────
type ChipKey = 'todos' | BuildingCategory;

const CHIPS: { key: ChipKey; label: string; icon: string }[] = [
  { key: 'todos', label: 'Todos', icon: BUILDINGS_ICON },
  { key: 'edificio', label: 'Edificios', icon: BUILDINGS_ICON },
  { key: 'laboratorio', label: 'Laboratorios', icon: LABS_ICON },
];

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const {
    notifications,
    loading: notificationsLoading,
    markRead,
  } = useNotificationsContext();

  // Building selection
  const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(
    null,
  );
  const [buildingDetail, setBuildingDetail] =
    useState<BuildingDetailResponse | null>(null);
  const [buildingLoading, setBuildingLoading] = useState(false);
  const sheetRef = useRef<BottomSheetModal>(null);

  // Route
  const [routeMode, setRouteMode] = useState(false);
  const [routeOrigin, setRouteOrigin] = useState<BuildingData | null>(null);
  const [routeDestination, setRouteDestination] = useState<BuildingData | null>(
    null,
  );
  const [selectingField, setSelectingField] = useState<
    'origin' | 'destination' | null
  >(null);
  const [routeSearchQuery, setRouteSearchQuery] = useState('');

  // Location (always active)
  const { pixelPosition, isOnCampus } = useUserLocation();
  const errorSheetRef = useRef<BottomSheetModal>(null);

  // Map ref for zoom controls
  const mapRef = useRef<ZoomableMapRef>(null);

  // Search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ChipKey>('todos');

  // ── Filtered buildings ─────────────────────────────────────────────────────
  const filteredBuildings = useMemo(() => {
    return BUILDINGS.filter((b) => {
      const matchesCategory =
        selectedCategory === 'todos' || b.category === selectedCategory;
      const removeAccents = (s: string) =>
        s.normalize('NFD').replace(/\p{M}/gu, '');
      const q = removeAccents(searchQuery.toLowerCase().trim());
      const matchesSearch =
        !q ||
        removeAccents(b.label.toLowerCase()).includes(q) ||
        removeAccents(b.code.toLowerCase()).includes(q) ||
        b.aliases.some((a) => removeAccents(a.toLowerCase()).includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  // ── Route computation ──────────────────────────────────────────────────────
  const routePoints = useMemo((): MapPosition[] | null => {
    if (!routeOrigin || !routeDestination) return null;

    const originNode = ROUTE_NODES.find((n) => n.buildingId === routeOrigin.id);
    const destNode = ROUTE_NODES.find(
      (n) => n.buildingId === routeDestination.id,
    );
    if (!originNode || !destNode) return null;

    const result = findPath(
      ROUTE_NODES,
      ROUTE_EDGES,
      originNode.id,
      destNode.id,
    );
    return result?.path ?? null;
  }, [routeOrigin, routeDestination]);

  // Distance to selected building (only when on campus)
  const distanceText = useMemo(() => {
    if (!isOnCampus || !pixelPosition || !selectedBuildingId) return null;
    const building = BUILDINGS.find((b) => b.id === selectedBuildingId);
    if (!building) return null;
    const dx = building.position.x - pixelPosition.x;
    const dy = building.position.y - pixelPosition.y;
    const m = Math.round(pixelDistanceToMeters(dx, dy));
    return `A ${m} metros de tu ubicación`;
  }, [isOnCampus, pixelPosition, selectedBuildingId]);

  // Incremented on each tap — lets async callbacks self-discard if stale
  const requestIdRef = useRef(0);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleBuildingPress = useCallback(
    async (building: BuildingData) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      if (selectingField) {
        if (selectingField === 'origin') {
          setRouteOrigin(building);
        } else {
          setRouteDestination(building);
        }
        setSelectingField(null);
        setRouteSearchQuery('');
        return;
      }

      const myId = ++requestIdRef.current;

      setSelectedBuildingId(building.id);
      setBuildingLoading(true);
      setBuildingDetail(null);
      sheetRef.current?.present();

      try {
        if (token) {
          const detail = await getBuildingDetail(building.id, token);
          if (requestIdRef.current === myId) {
            setBuildingDetail(detail);
          }
        }
      } catch {
        // Silent fail — sheet shows category + name at minimum
      } finally {
        if (requestIdRef.current === myId) {
          setBuildingLoading(false);
        }
      }
    },
    [token, selectingField],
  );

  const handleSheetDismiss = useCallback(() => {
    setSelectedBuildingId(null);
    setBuildingDetail(null);
  }, []);

  const handleRouteFromSheet = useCallback(() => {
    const building = BUILDINGS.find((b) => b.id === selectedBuildingId);
    if (building) {
      setRouteDestination(building);
      setRouteMode(true);
    }
    sheetRef.current?.dismiss();
  }, [selectedBuildingId]);

  const handleRouteClear = useCallback(() => {
    setRouteOrigin(null);
    setRouteDestination(null);
    setSelectingField(null);
    setRouteSearchQuery('');
  }, []);

  const handleRouteClose = useCallback(() => {
    setRouteMode(false);
    handleRouteClear();
  }, [handleRouteClear]);

  const handleSelectBuilding = useCallback((building: BuildingData) => {
    setSelectingField((field) => {
      if (field === 'origin') {
        setRouteOrigin(building);
      } else {
        setRouteDestination(building);
      }
      return null;
    });
    setRouteSearchQuery('');
  }, []);

  const selectedBuildingData = useMemo(
    () => BUILDINGS.find((b) => b.id === selectedBuildingId) ?? null,
    [selectedBuildingId],
  );

  const getMatchedAlias = (b: BuildingData, q: string): string | null => {
    if (!q || !b.aliases.length) return null;
    const ra = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '');
    const norm = ra(q.toLowerCase());
    return (
      b.aliases.find((a) => ra(a.toLowerCase()).includes(norm)) ?? b.aliases[0]
    );
  };

  return (
    <View style={styles.container}>
      <ZoomableMap ref={mapRef}>
        <MapOverlay
          buildings={filteredBuildings}
          selectedBuildingId={selectedBuildingId}
          routePoints={routePoints}
          userPosition={isOnCampus ? pixelPosition : null}
          onBuildingPress={handleBuildingPress}
        />
      </ZoomableMap>

      {/* Header — search + bell (matches clubs screen layout) */}
      {!routeMode && (
        <View style={styles.headerBar}>
          <ScreenHeader
            showNotificationBell
            onNotificationPress={() => setNotificationsVisible(true)}
            searchInput={
              <SearchInput
                placeholder="Buscar edificio o aula..."
                withShadow={false}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            }
          />
        </View>
      )}

      {/* Search results dropdown */}
      {!routeMode && searchQuery.trim() !== '' && (
        <View style={[styles.searchDropdown, { top: insets.top + 68 + 8 }]}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {filteredBuildings.length === 0 ? (
              <Text style={styles.dropdownEmpty}>Sin resultados</Text>
            ) : (
              filteredBuildings.map((b) => {
                const alias = getMatchedAlias(b, searchQuery.trim());
                return (
                  <Pressable
                    key={b.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      Keyboard.dismiss();
                      handleBuildingPress(b);
                      setSearchQuery('');
                      mapRef.current?.focusOnPoint(b.position.x, b.position.y);
                    }}
                  >
                    <Text style={styles.dropdownLabel}>{b.label}</Text>
                    {alias && <Text style={styles.dropdownAlias}>{alias}</Text>}
                  </Pressable>
                );
              })
            )}
          </ScrollView>
        </View>
      )}

      {/* Category chips — floating over the map, no background */}
      {!routeMode && (
        <View
          style={[styles.chipsOverlay, { top: insets.top + 68 + 12 }]}
          pointerEvents="box-none"
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsContent}
          >
            {CHIPS.map((chip) => {
              const isActive = selectedCategory === chip.key;
              return (
                <Pressable
                  key={chip.key}
                  style={[styles.chip, isActive && styles.chipActive]}
                  onPress={() => setSelectedCategory(chip.key)}
                >
                  <SvgXml
                    xml={chip.icon.replace(
                      /fill="currentColor"/g,
                      `fill="${isActive ? colors.gray950 : colors.bluePrimary}"`,
                    )}
                    width={14}
                    height={14}
                  />
                  <Text
                    style={[
                      styles.chipLabel,
                      isActive && styles.chipLabelActive,
                    ]}
                  >
                    {chip.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      <NotificationsModal
        visible={notificationsVisible}
        onDismiss={() => setNotificationsVisible(false)}
        notifications={notifications}
        loading={notificationsLoading}
        onNotificationPress={markRead}
      />

      {/* Route panel */}
      {routeMode && (
        <View style={[styles.routePanelWrapper, { paddingTop: insets.top }]}>
          <RoutePanel
            visible
            originLabel={routeOrigin?.label ?? null}
            destinationLabel={routeDestination?.label ?? null}
            selectingField={selectingField}
            searchQuery={routeSearchQuery}
            onSearchChange={setRouteSearchQuery}
            onSelectField={setSelectingField}
            onSelectBuilding={handleSelectBuilding}
            onClear={handleRouteClear}
            onClose={handleRouteClose}
          />
        </View>
      )}

      {/* Floating zoom + location buttons */}
      {!routeMode && (
        <View style={[styles.floatingButtons, { bottom: insets.bottom + 100 }]}>
          <Pressable
            style={styles.fab}
            onPress={() => mapRef.current?.zoomIn()}
          >
            <SvgXml
              xml={ZOOM_IN_ICON.replace(
                /fill="currentColor"/g,
                `fill="${colors.bluePrimary}"`,
              )}
              width={14}
              height={14}
            />
          </Pressable>
          <Pressable
            style={styles.fab}
            onPress={() => mapRef.current?.zoomOut()}
          >
            <SvgXml
              xml={ZOOM_OUT_ICON.replace(
                /fill="currentColor"/g,
                `fill="${colors.bluePrimary}"`,
              )}
              width={14}
              height={2}
            />
          </Pressable>
          <Pressable
            style={[styles.fab, isOnCampus && styles.fabActive]}
            onPress={() => {
              if (isOnCampus && pixelPosition) {
                mapRef.current?.focusOnPoint(pixelPosition.x, pixelPosition.y);
              } else {
                Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Error,
                );
                errorSheetRef.current?.present();
              }
            }}
          >
            <SvgXml
              xml={LOCATION_ICON.replace(
                /fill="currentColor"/g,
                `fill="${isOnCampus ? colors.white : colors.bluePrimary}"`,
              )}
              width={22}
              height={22}
            />
          </Pressable>
        </View>
      )}

      <BuildingInfoSheet
        ref={sheetRef}
        building={buildingDetail}
        buildingData={selectedBuildingData}
        distanceText={distanceText}
        loading={buildingLoading}
        onDismiss={handleSheetDismiss}
        onRoute={handleRouteFromSheet}
      />

      {/* Error sheet: not on campus */}
      <AppBottomSheet ref={errorSheetRef}>
        <View style={styles.errorSheetContent}>
          <Text style={styles.errorSheetIcon}>📍</Text>
          <Text style={styles.errorSheetTitle}>
            No estás en las instalaciones
          </Text>
          <Text style={styles.errorSheetMessage}>
            Tu ubicación actual está fuera del campus. Acércate a las
            instalaciones para ver tu posición en el mapa y las distancias a los
            edificios.
          </Text>
          <Pressable
            style={styles.errorSheetButton}
            onPress={() => errorSheetRef.current?.dismiss()}
          >
            <Text style={styles.errorSheetButtonText}>Entendido</Text>
          </Pressable>
        </View>
      </AppBottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4D7EBD',
  },
  headerBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: colors.bluePrimary,
    shadowColor: colors.blueSecondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  chipsOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 99,
  },
  chipsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.whiteTransparent90,
    borderRadius: 9999,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  chipActive: {
    backgroundColor: colors.yellow,
  },
  chipLabel: {
    fontSize: 12,
    fontFamily: typography.fontFamily.interSemiBold,
    color: colors.bluePrimary,
  },
  chipLabelActive: {
    color: colors.gray950,
  },
  routePanelWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  floatingButtons: {
    position: 'absolute',
    right: 16,
    gap: 10,
    zIndex: 50,
  },
  fab: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.blueSecondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  fabActive: {
    backgroundColor: colors.bluePrimary,
  },
  searchDropdown: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 101,
    backgroundColor: colors.white,
    borderRadius: 12,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle30,
  },
  dropdownLabel: {
    fontSize: 15,
    fontFamily: typography.fontFamily.interSemiBold,
    color: colors.gray950,
  },
  dropdownAlias: {
    fontSize: 13,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.gray700,
    marginTop: 2,
  },
  dropdownEmpty: {
    padding: 16,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.gray700,
    textAlign: 'center',
  },
  errorSheetContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 32,
  },
  errorSheetIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  errorSheetTitle: {
    fontSize: 18,
    fontFamily: typography.fontFamily.interBold,
    color: colors.gray950,
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSheetMessage: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.gray700,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  errorSheetButton: {
    backgroundColor: colors.bluePrimary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
  },
  errorSheetButtonText: {
    fontSize: 16,
    fontFamily: typography.fontFamily.interSemiBold,
    color: colors.white,
  },
});
