type LoadModuleOptions = {
  documentDirectory?: string | null;
};

function loadPreferencesModule(options: LoadModuleOptions = {}) {
  jest.resetModules();

  const readAsStringAsync = jest.fn();
  const writeAsStringAsync = jest.fn();
  const getItemAsync = jest.fn();

  jest.doMock('expo-file-system/legacy', () => ({
    documentDirectory:
      options.documentDirectory !== undefined
        ? options.documentDirectory
        : 'file:///documents/',
    readAsStringAsync,
    writeAsStringAsync,
  }));

  jest.doMock('expo-secure-store', () => ({
    getItemAsync,
  }));

  const module =
    require('../../lib/preferencesStorage') as typeof import('../../lib/preferencesStorage');

  return {
    module,
    readAsStringAsync,
    writeAsStringAsync,
    getItemAsync,
  };
}

describe('preferencesStorage', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.dontMock('expo-file-system/legacy');
    jest.dontMock('expo-secure-store');
  });

  it('normalizes legacy and current home screen keys', () => {
    const { module } = loadPreferencesModule();

    expect(module.normalizeHomeScreen(undefined)).toBeNull();
    expect(module.normalizeHomeScreen('reports')).toBe('complaints');
    expect(module.normalizeHomeScreen('ia')).toBe('messages');
    expect(module.normalizeHomeScreen('map')).toBe('map');
  });

  it('reads preferences from local file when valid JSON exists', async () => {
    const { module, readAsStringAsync, getItemAsync } = loadPreferencesModule();

    readAsStringAsync.mockResolvedValueOnce(
      JSON.stringify({ homeScreen: 'clubs', notificationsEnabled: true }),
    );

    await expect(module.readPreferences()).resolves.toEqual({
      homeScreen: 'clubs',
      notificationsEnabled: true,
    });

    expect(getItemAsync).not.toHaveBeenCalled();
  });

  it('falls back to legacy secure storage when file read fails', async () => {
    const { module, readAsStringAsync, getItemAsync } = loadPreferencesModule();

    readAsStringAsync.mockRejectedValueOnce(new Error('missing file'));
    getItemAsync
      .mockResolvedValueOnce(JSON.stringify({ homeScreen: 'reports' }))
      .mockResolvedValueOnce('false');

    await expect(module.readPreferences()).resolves.toEqual({
      homeScreen: 'reports',
      notificationsEnabled: false,
    });
  });

  it('returns null when legacy sources do not contain data', async () => {
    const { module, readAsStringAsync, getItemAsync } = loadPreferencesModule();

    readAsStringAsync.mockRejectedValueOnce(new Error('missing file'));
    getItemAsync.mockResolvedValueOnce(null).mockResolvedValueOnce(null);

    await expect(module.readPreferences()).resolves.toBeNull();
  });

  it('handles invalid legacy JSON and keeps notifications from legacy key', async () => {
    const { module, readAsStringAsync, getItemAsync } = loadPreferencesModule();

    readAsStringAsync.mockResolvedValueOnce('{invalid-json');
    getItemAsync
      .mockResolvedValueOnce('{invalid-json')
      .mockResolvedValueOnce('true');

    await expect(module.readPreferences()).resolves.toEqual({
      notificationsEnabled: true,
    });
  });

  it('returns null when legacy read throws', async () => {
    const { module, readAsStringAsync, getItemAsync } = loadPreferencesModule();

    readAsStringAsync.mockRejectedValueOnce(new Error('missing file'));
    getItemAsync.mockRejectedValueOnce(new Error('secure store unavailable'));

    await expect(module.readPreferences()).resolves.toBeNull();
  });

  it('writes preferences to local file storage', async () => {
    const { module, writeAsStringAsync } = loadPreferencesModule();

    await module.savePreferences({
      homeScreen: 'profile',
      notificationsEnabled: false,
    });

    expect(writeAsStringAsync).toHaveBeenCalledWith(
      'file:///documents/agora_preferences.json',
      JSON.stringify({ homeScreen: 'profile', notificationsEnabled: false }),
    );
  });

  it('throws when local preferences storage is unavailable', async () => {
    const { module, writeAsStringAsync } = loadPreferencesModule({
      documentDirectory: null,
    });

    await expect(
      module.savePreferences({ homeScreen: 'map', notificationsEnabled: true }),
    ).rejects.toThrow('Local preferences storage is unavailable.');

    expect(writeAsStringAsync).not.toHaveBeenCalled();
  });
});
