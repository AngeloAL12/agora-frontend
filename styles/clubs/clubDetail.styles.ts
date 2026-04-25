import { Platform, StatusBar as RNStatusBar, StyleSheet } from 'react-native';

const STATUS_BAR_HEIGHT =
  Platform.OS === 'android' ? RNStatusBar.currentHeight || 0 : 0;

export const clubDetailStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0D47A1',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  header: {
    height: 56 + STATUS_BAR_HEIGHT,
    paddingTop: STATUS_BAR_HEIGHT,
    backgroundColor: '#1E488F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  floatingButton: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#F4C400',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 10 },
  },
  floatingButtonText: {
    fontSize: 24,
    fontWeight: '500',
    color: '#1E2A3A',
    marginTop: -1,
  },

  eventsList: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 100,
  },

  backIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },

  floatingButtonIcon: {
    width: 15,
    height: 15,
    resizeMode: 'contain',
  },
  notificationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',

    resizeMode: 'contain',
    tintColor: '#FFFFFF',
  },
});
