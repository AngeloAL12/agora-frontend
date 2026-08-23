import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { colors, typography } from '@/constants/theme';

const RULES = [
  {
    icon: 'people-outline' as const,
    title: 'Trata a todos con respeto',
    text: 'No se permite acoso, intimidación, discriminación ni ataques personales.',
  },
  {
    icon: 'shield-outline' as const,
    title: 'Protege la seguridad',
    text: 'No publiques amenazas, instrucciones peligrosas ni contenido que promueva violencia.',
  },
  {
    icon: 'eye-off-outline' as const,
    title: 'Cuida la privacidad',
    text: 'No compartas datos personales, imágenes o conversaciones sin autorización.',
  },
  {
    icon: 'images-outline' as const,
    title: 'Comparte contenido apropiado',
    text: 'Se prohíbe contenido sexual explícito, explotación, fraude y material ilegal.',
  },
  {
    icon: 'megaphone-outline' as const,
    title: 'Evita spam y engaños',
    text: 'No uses Agora para campañas repetitivas, suplantación o información fraudulenta.',
  },
];

export default function CommunityGuidelinesScreen() {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView edges={['left', 'right']} style={styles.root}>
      <ScreenHeader
        variant="white"
        title="Normas de comunidad"
        align="center"
        showBackButton
        backButtonColor={colors.blueDark}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 30 },
        ]}
      >
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="sparkles" size={27} color={colors.blueSecondary} />
          </View>
          <Text style={styles.heroTitle}>Una comunidad útil y segura</Text>
          <Text style={styles.heroText}>
            Agora conecta a la comunidad del campus. Estas normas aplican a
            publicaciones, comentarios, imágenes y mensajes.
          </Text>
        </View>

        <View style={styles.rules}>
          {RULES.map((rule, index) => (
            <View key={rule.title} style={styles.ruleCard}>
              <View style={styles.ruleNumber}>
                <Text style={styles.ruleNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.ruleIcon}>
                <Ionicons
                  name={rule.icon}
                  size={22}
                  color={colors.bluePrimary}
                />
              </View>
              <View style={styles.ruleCopy}>
                <Text style={styles.ruleTitle}>{rule.title}</Text>
                <Text style={styles.ruleText}>{rule.text}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.reportNote}>
          <Ionicons name="flag-outline" size={22} color={colors.errorText} />
          <View style={styles.reportCopy}>
            <Text style={styles.reportTitle}>Ayúdanos a actuar</Text>
            <Text style={styles.reportText}>
              Usa la bandera junto a cualquier contenido ofensivo. Solo los
              administradores revisan estas denuncias y el autor no conocerá tu
              identidad.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.whiteSoft },
  content: { padding: 16, gap: 18 },
  hero: {
    alignItems: 'center',
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 24,
    backgroundColor: colors.primaryContainer,
  },
  heroIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.yellow,
    marginBottom: 13,
  },
  heroTitle: {
    fontSize: 22,
    textAlign: 'center',
    color: colors.blueDark,
    fontFamily: typography.fontFamily.manropeExtraBold,
  },
  heroText: {
    marginTop: 7,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 20,
    color: colors.gray700,
    fontFamily: typography.fontFamily.interRegular,
  },
  rules: { gap: 10 },
  ruleCard: {
    minHeight: 94,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 14,
    gap: 11,
    backgroundColor: colors.white,
  },
  ruleNumber: {
    position: 'absolute',
    right: 12,
    top: 9,
    opacity: 0.08,
  },
  ruleNumberText: {
    fontSize: 34,
    color: colors.blueSecondary,
    fontFamily: typography.fontFamily.manropeExtraBold,
  },
  ruleIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bluePrimaryLight2,
  },
  ruleCopy: { flex: 1, paddingRight: 18, gap: 3 },
  ruleTitle: {
    fontSize: 14,
    color: colors.gray950,
    fontFamily: typography.fontFamily.manropeBold,
  },
  ruleText: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.gray700,
    fontFamily: typography.fontFamily.interRegular,
  },
  reportNote: {
    flexDirection: 'row',
    borderRadius: 18,
    padding: 16,
    gap: 12,
    backgroundColor: colors.errorContainer,
  },
  reportCopy: { flex: 1, gap: 3 },
  reportTitle: {
    fontSize: 14,
    color: colors.errorText,
    fontFamily: typography.fontFamily.manropeBold,
  },
  reportText: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.gray700,
    fontFamily: typography.fontFamily.interRegular,
  },
});
