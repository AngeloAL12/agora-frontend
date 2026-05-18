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

interface PanoramaWebViewProps {
  imageUrl: string;
  onTap: () => void;
}

async function fetchAsDataUrl(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export default function PanoramaWebView({
  imageUrl,
  onTap,
}: PanoramaWebViewProps) {
  const [html, setHtml] = useState<string | null>(null);
  const webviewOpacity = useSharedValue(0);
  const blurOpacity = useSharedValue(1);

  useEffect(() => {
    setHtml(null);
    webviewOpacity.value = 0;
    blurOpacity.value = 1;
    fetchAsDataUrl(imageUrl)
      .then((dataUrl) => setHtml(getPanoramaHtml(dataUrl)))
      .catch(() => setHtml(getPanoramaHtml(imageUrl)));
  }, [imageUrl, webviewOpacity, blurOpacity]);

  const handleMessage = (event: WebViewMessageEvent) => {
    const { data } = event.nativeEvent;
    if (data === 'ready') {
      webviewOpacity.value = withTiming(1, { duration: 400 });
      blurOpacity.value = withTiming(0, { duration: 400 });
    } else if (data === 'tap') {
      onTap();
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
            source={{ html }}
            style={styles.webview}
            onMessage={handleMessage}
            scrollEnabled={false}
            bounces={false}
            allowsInlineMediaPlayback
            javaScriptEnabled
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
