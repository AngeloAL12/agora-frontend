export const MICROSOFT_CLIENT_ID =
  process.env.EXPO_PUBLIC_MICROSOFT_CLIENT_ID ?? '';

export const MICROSOFT_TENANT_ID =
  process.env.EXPO_PUBLIC_MICROSOFT_TENANT_ID ?? '';

function normalizeGoogleClientId(rawClientId: string): string {
  if (rawClientId.startsWith('com.googleusercontent.apps.')) {
    return `${rawClientId.replace('com.googleusercontent.apps.', '')}.apps.googleusercontent.com`;
  }

  return rawClientId;
}

function buildGoogleScheme(rawClientId: string): string {
  if (rawClientId.startsWith('com.googleusercontent.apps.')) {
    return rawClientId;
  }

  return `com.googleusercontent.apps.${rawClientId.replace('.apps.googleusercontent.com', '')}`;
}

const rawGoogleIosId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '';

export const GOOGLE_IOS_CLIENT_ID = normalizeGoogleClientId(rawGoogleIosId);

export const GOOGLE_IOS_REDIRECT_URI = `${buildGoogleScheme(rawGoogleIosId)}:/`;

export const googleDiscovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
};

export const microsoftDiscovery = {
  authorizationEndpoint: `https://login.microsoftonline.com/${MICROSOFT_TENANT_ID}/oauth2/v2.0/authorize`,
  tokenEndpoint: `https://login.microsoftonline.com/${MICROSOFT_TENANT_ID}/oauth2/v2.0/token`,
};
