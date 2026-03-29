export const MICROSOFT_CLIENT_ID =
  process.env.EXPO_PUBLIC_MICROSOFT_CLIENT_ID ?? '';

const rawGoogleIosId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '';
const isSchemeFormat = rawGoogleIosId.startsWith('com.googleusercontent.apps.');

export const GOOGLE_IOS_CLIENT_ID = isSchemeFormat
  ? `${rawGoogleIosId.replace('com.googleusercontent.apps.', '')}.apps.googleusercontent.com`
  : rawGoogleIosId;

const googleIosScheme = isSchemeFormat
  ? rawGoogleIosId
  : `com.googleusercontent.apps.${rawGoogleIosId.replace('.apps.googleusercontent.com', '')}`;

export const GOOGLE_REDIRECT_URI = `${googleIosScheme}:/`;

export const googleDiscovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
};

export const microsoftDiscovery = {
  authorizationEndpoint:
    'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
  tokenEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
};
