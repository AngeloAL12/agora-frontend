import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState, useSyncExternalStore } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {
  FLOATING_TAB_BAR_BOTTOM_OFFSET,
  FLOATING_TAB_BAR_HEIGHT,
} from '@/components/FloatingTabBar';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ChatListItem } from '@/components/chats/ChatListItem';
import { ChatFilter, FilterChips } from '@/components/chats/FilterChips';
import { CLUB_CHATS_MOCK } from '@/constants/chats';
import { chatSummaryStore } from '@/services/chatSummaryStore';
import { colors } from '@/constants/theme';

export default function MessagesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<ChatFilter>('all');

  const summaries = useSyncExternalStore(
    chatSummaryStore.subscribe,
    chatSummaryStore.getSnapshot,
  );

  const chatsWithSummaries = useMemo(
    () =>
      CLUB_CHATS_MOCK.map((chat) => {
        const summary = summaries[chat.id];
        if (!summary) return chat;
        return {
          ...chat,
          lastMessage: summary.lastMessage || chat.lastMessage,
          timestamp: summary.timestamp || chat.timestamp,
          unreadCount: summary.unreadCount,
        };
      }),
    [summaries],
  );

  const filteredChats = useMemo(() => {
    if (activeFilter === 'unread') {
      return chatsWithSummaries.filter(
        (chat) => !!chat.unreadCount && chat.unreadCount > 0,
      );
    }
    return chatsWithSummaries;
  }, [activeFilter, chatsWithSummaries]);

  const scrollPaddingBottom =
    insets.bottom +
    FLOATING_TAB_BAR_BOTTOM_OFFSET +
    FLOATING_TAB_BAR_HEIGHT +
    16;

  const handleChatPress = (id: string, type: 'ia' | 'club') => {
    if (type === 'ia') {
      router.push('/chat/ia');
      return;
    }
    router.push(`/chat/${id}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar backgroundColor={colors.bluePrimary} style="light" />

      <ScreenHeader title="Mensajes" align="left" showNotificationBell />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: scrollPaddingBottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <FilterChips
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        <View style={styles.chatCard}>
          {filteredChats.map((chat, index) => (
            <ChatListItem
              key={chat.id}
              name={chat.name}
              type={chat.type}
              avatarSource={chat.avatarSource}
              lastMessage={chat.lastMessage}
              timestamp={chat.timestamp}
              unreadCount={chat.unreadCount}
              isLast={index === filteredChats.length - 1}
              onPress={() => handleChatPress(chat.id, chat.type)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.whiteSoft,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
  },
  chatCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.blueSecondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 2,
  },
});
