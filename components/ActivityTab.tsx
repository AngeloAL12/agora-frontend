import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@/constants/theme';

export interface ActivityItem {
  id: string;
  type: 'club' | 'comment' | 'like';
  clubName?: string;
  location?: string;
  timestamp?: string;
  title?: string;
  subtitle?: string;
  dotColor?: string;
}

const getActivityTitle = (item: ActivityItem) => {
  if (item.title) return item.title;
  if (item.type === 'club' && item.clubName) {
    return `Asistencia al Club de ${item.clubName}`;
  }
  if (item.type === 'comment') return 'Comentario';
  if (item.type === 'like') return 'Like';
  return 'Actividad';
};

const getActivitySubtitle = (item: ActivityItem) => {
  if (item.subtitle) return item.subtitle;

  const parts: string[] = [];
  if (item.timestamp) parts.push(item.timestamp);
  if (item.location) parts.push(item.location);
  return parts.length > 0 ? parts.join(' • ') : undefined;
};

export const ActivityTab = ({ activities }: { activities: ActivityItem[] }) => {
  if (activities.length === 0) {
    return <Text style={styles.emptyText}>No hay actividad reciente.</Text>;
  }

  return (
    <View>
      {activities.map((item, index) => {
        const title = getActivityTitle(item);
        const subtitle = getActivitySubtitle(item);
        const dotColor = item.dotColor ?? theme.palette.accent;

        return (
          <View key={item.id} style={styles.activityItem}>
            <View style={styles.timelineCol}>
              <View style={[styles.dot, { backgroundColor: dotColor }]} />
              {index < activities.length - 1 && (
                <View style={styles.timelineLine} />
              )}
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityItemTitle}>{title}</Text>
              {!!subtitle && (
                <Text style={styles.activityItemSubtitle}>{subtitle}</Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  emptyText: {
    fontSize: 13,
    fontFamily: theme.typography.fontFamily.interRegular,
    color: theme.palette.textSecondary,
    textAlign: 'center',
    paddingVertical: 16,
  },
  activityItem: { flexDirection: 'row', minHeight: 60 },
  timelineCol: { width: 20, alignItems: 'center', marginRight: 16 },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 6 },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: theme.palette.divider,
    marginVertical: 4,
  },
  activityContent: { flex: 1, paddingBottom: 20 },
  activityItemTitle: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.interSemiBold,
    color: theme.palette.textPrimary,
    lineHeight: 18,
  },
  activityItemSubtitle: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.interRegular,
    color: theme.palette.textSecondary,
    marginTop: 2,
  },
});
