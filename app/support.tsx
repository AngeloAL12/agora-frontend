import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { colors, typography } from '@/constants/theme';

const SUPPORT_EMAIL = process.env.EXPO_PUBLIC_SUPPORT_EMAIL?.trim();
const SUPPORT_URL = 'https://lnk.bio/nexora';

export default function SupportScreen() {
  const insets = useSafeAreaInsets();

  async function contactSupport() {
    const url = SUPPORT_EMAIL
      ? `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Soporte Agora')}`
      : SUPPORT_URL;
    await Linking.openURL(url);
  }

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.root}>
      <ScreenHeader
        variant="white"
        title="Ayuda y soporte"
        align="center"
        showBackButton
        backButtonColor={colors.blueDark}
      />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 32 },
        ]}
      >
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="headset-outline" size={31} color={colors.white} />
          </View>
          <Text style={styles.heroTitle}>Estamos para ayudarte</Text>
          <Text style={styles.heroText}>
            Escríbenos sobre seguridad, apelaciones, privacidad o cualquier
            problema con tu cuenta.
          </Text>
        </View>

        <View style={styles.contactCard}>
          <View style={styles.contactIcon}>
            <Ionicons
              name={SUPPORT_EMAIL ? 'mail-outline' : 'link-outline'}
              size={23}
              color={colors.bluePrimary}
            />
          </View>
          <View style={styles.contactCopy}>
            <Text style={styles.contactLabel}>CONTACTO PUBLICADO</Text>
            <Text style={styles.contactValue}>
              {SUPPORT_EMAIL ?? 'lnk.bio/nexora'}
            </Text>
            <Text style={styles.contactDescription}>
              Tiempo estimado de respuesta: 24 a 48 horas hábiles.
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Ionicons
            name="shield-checkmark-outline"
            size={23}
            color={colors.reportResolvedText}
          />
          <View style={styles.infoCopy}>
            <Text style={styles.infoTitle}>Casos urgentes de seguridad</Text>
            <Text style={styles.infoText}>
              Incluye el club, fecha y una descripción del contenido. No envíes
              contraseñas ni códigos de acceso.
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="link"
          onPress={() => void contactSupport()}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && { opacity: 0.78 },
          ]}
        >
          <Ionicons
            name={SUPPORT_EMAIL ? 'send-outline' : 'open-outline'}
            size={19}
            color={colors.white}
          />
          <Text style={styles.primaryText}>Contactar soporte</Text>
        </Pressable>

        <Pressable
          accessibilityRole="link"
          onPress={() => void Linking.openURL(SUPPORT_URL)}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryText}>Ver canales oficiales</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.whiteSoft },
  content: { padding: 16, gap: 15 },
  hero: {
    alignItems: 'center',
    borderRadius: 24,
    padding: 24,
    backgroundColor: colors.blueSecondary,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    marginBottom: 14,
  },
  heroTitle: {
    fontSize: 22,
    color: colors.white,
    fontFamily: typography.fontFamily.manropeExtraBold,
  },
  heroText: {
    marginTop: 7,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.76)',
    fontFamily: typography.fontFamily.interRegular,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 18,
    padding: 17,
    gap: 13,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.white,
  },
  contactIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryContainer,
  },
  contactCopy: { flex: 1, gap: 3 },
  contactLabel: {
    fontSize: 9,
    letterSpacing: 0.8,
    color: colors.activityGray,
    fontFamily: typography.fontFamily.interSemiBold,
  },
  contactValue: {
    fontSize: 15,
    color: colors.blueDark,
    fontFamily: typography.fontFamily.manropeBold,
  },
  contactDescription: {
    fontSize: 11,
    lineHeight: 16,
    color: colors.gray700,
    fontFamily: typography.fontFamily.interRegular,
  },
  infoCard: {
    flexDirection: 'row',
    borderRadius: 17,
    padding: 16,
    gap: 12,
    backgroundColor: colors.reportResolved,
  },
  infoCopy: { flex: 1, gap: 3 },
  infoTitle: {
    fontSize: 13,
    color: colors.reportResolvedText,
    fontFamily: typography.fontFamily.interSemiBold,
  },
  infoText: {
    fontSize: 11,
    lineHeight: 17,
    color: colors.gray700,
    fontFamily: typography.fontFamily.interRegular,
  },
  primaryButton: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    gap: 9,
    backgroundColor: colors.bluePrimary,
  },
  primaryText: {
    fontSize: 16,
    color: colors.white,
    fontFamily: typography.fontFamily.interSemiBold,
  },
  secondaryButton: { alignItems: 'center', paddingVertical: 10 },
  secondaryText: {
    fontSize: 14,
    color: colors.bluePrimary,
    fontFamily: typography.fontFamily.interSemiBold,
  },
});
