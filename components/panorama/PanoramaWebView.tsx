import { BlurView } from 'expo-blur';
import { Image as ExpoImage } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { getPanoramaHtml } from './panoramaHtml';

const PANNELLUM_CDN =
  'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js';

let pannellumJsCache: string | null = null;

async function fetchPannellumJs(): Promise<string> {
  if (pannellumJsCache) return pannellumJsCache;
  const res = await fetch(PANNELLUM_CDN);
  pannellumJsCache = await res.text();
  return pannellumJsCache;
}

function getOrigin(url: string): string {
  try {
    return new URL(url).origin;
  } catch {
    return '';
  }
}

interface PanoramaWebViewProps {
  imageUrl: string;
  onTap: () => void;
}

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export default function PanoramaWebView({
  imageUrl,
  onTap,
}: PanoramaWebViewProps) {
  const [html, setHtml] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState<string>('');
  const webviewOpacity = useSharedValue(0);
  const blurOpacity = useSharedValue(1);

  useEffect(() => {
    setHtml(null);
    webviewOpacity.value = 0;
    blurOpacity.value = 1;
    setBaseUrl(getOrigin(imageUrl));
    fetchPannellumJs()
      .then((pannellumJs) => setHtml(getPanoramaHtml(imageUrl, pannellumJs)))
      .catch(() => {});
  }, [imageUrl, webviewOpacity, blurOpacity]);

  const handleMessage = (event: WebViewMessageEvent) => {
    const { data } = event.nativeEvent;
    if (data === 'ready') {
      webviewOpacity.value = withTiming(1, { duration: 400 });
      blurOpacity.value = withTiming(0, { duration: 400 });
    } else if (data === 'tap') {
      onTap();
    } else {
      console.log('[PanoramaWebView]', data);
    }
  };

  const webviewStyle = useAnimatedStyle(() => ({
    opacity: webviewOpacity.value,
  }));

  const blurStyle = useAnimatedStyle(() => ({
    opacity: blurOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <ExpoImage
        source={{ uri: imageUrl }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />
      <AnimatedBlurView
        intensity={60}
        tint="dark"
        style={[StyleSheet.absoluteFill, blurStyle]}
      />
      {html && (
        <Animated.View style={[StyleSheet.absoluteFill, webviewStyle]}>
          <WebView
            source={{ html, baseUrl }}
            style={styles.webview}
            onMessage={handleMessage}
            scrollEnabled={false}
            bounces={false}
            allowsInlineMediaPlayback
            javaScriptEnabled
            domStorageEnabled
            mixedContentMode="always"
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  webview: { flex: 1, backgroundColor: '#000' },
});
