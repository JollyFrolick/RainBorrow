import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'RainBorrow',
  slug: 'rainborrow',
  plugins: [
    ...(config.plugins || []),
    ['react-native-maps', process.env.GOOGLE_MAPS_ANDROID_API_KEY ? { androidGoogleMapsApiKey: process.env.GOOGLE_MAPS_ANDROID_API_KEY } : {}],
  ],
});
