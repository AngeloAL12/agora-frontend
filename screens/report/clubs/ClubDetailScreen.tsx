import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  View,
} from 'react-native';

import ClubBanner from '@/components/clubs/ClubBanner';
import ClubEventCard from '@/components/clubs/ClubEventCard';
import ClubHeaderInfo from '@/components/clubs/ClubHeaderInfo';
import ClubPostCard from '@/components/clubs/ClubPostCard';
import ClubStats from '@/components/clubs/ClubStats';
import ClubTabs from '@/components/clubs/ClubTabs';
import { CLUB_DETAIL_MOCK } from '@/constants/clubs';
import { clubDetailStyles as styles } from '@/styles/clubs/clubDetail.styles';
import { ClubTabKey } from '@/types/club';

const ClubDetailScreen = () => {
  const { tab } = useLocalSearchParams<{ tab?: string }>();

  const club = CLUB_DETAIL_MOCK;

  const [activeTab, setActiveTab] = useState<ClubTabKey>('publicaciones');
  const [joined, setJoined] = useState(club.isMember);

  useEffect(() => {
    if (tab === 'eventos') {
      setActiveTab('eventos');
    }
  }, [tab]);

  const handleFloatingButtonPress = () => {
    if (activeTab === 'eventos') {
      router.push('/club-create-event' as any);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0D47A1" />

      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerIcon}
            activeOpacity={0.8}
            onPress={() => router.back()}
          >
            <Image
              source={require('@/assets/icons/regreso.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.headerIcon} activeOpacity={0.8}>
            <Image
              source={require('@/assets/images/campana.png')}
              style={styles.notificationIcon}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ClubBanner />

          <ClubHeaderInfo
            initials={club.initials}
            name={club.name}
            description={club.description}
            isMember={joined}
            onPressMember={() => setJoined(true)}
          />

          <ClubStats
            members={club.stats.members}
            publications={club.stats.publications}
          />

          <ClubTabs activeTab={activeTab} onChangeTab={setActiveTab} />

          {activeTab === 'publicaciones' ? (
            <>
              {club.posts.map((post) => (
                <ClubPostCard key={post.id} post={post} />
              ))}
            </>
          ) : (
            <View style={styles.eventsList}>
              {club.events.map((event) => (
                <ClubEventCard
                  key={event.id}
                  event={event}
                  onPress={() =>
                    router.push({
                      pathname: '/club-event-detail',
                      params: {
                        title: event.title,
                        date: `${event.day} de ${event.month}, 2026`,
                        description:
                          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In at libero nibh. Integer faucibus elementum ligula ac fermentum. Duis ultrices urna ac orci posuere dictum. Pellentesque convallis porttitor odio eget vulputate.',
                      },
                    })
                  }
                />
              ))}
            </View>
          )}
        </ScrollView>

        {joined && (
          <TouchableOpacity
            style={styles.floatingButton}
            activeOpacity={0.8}
            onPress={handleFloatingButtonPress}
          >
            <Image
              source={require('@/assets/images/Crear.png')}
              style={styles.floatingButtonIcon}
            />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

export default ClubDetailScreen;
