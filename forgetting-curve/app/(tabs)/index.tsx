import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { auth } from '../../services/firebase';
import { getTodayReviews } from '../../services/notes';
import { Note } from '../../types';

export default function HomeScreen() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  // 화면에 포커스될 때마다 오늘 복습 목록 새로 불러오기
  useFocusEffect(
    useCallback(() => {
      fetchTodayReviews();
    }, [])
  );

  const fetchTodayReviews = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    setLoading(true);
    try {
      const data = await getTodayReviews(userId);
      setReviews(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>

      {/* 헤더 */}
      <Text style={styles.headerTitle}>오늘의 복습</Text>

      {/* 스트릭 */}
      <View style={styles.streakBox}>
        <Text style={styles.streakEmoji}>🔥</Text>
        <Text style={styles.streakText}>0일 연속 복습 중</Text>
      </View>

      {/* 오늘 복습 목록 */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" />
      ) : reviews.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>오늘 복습할 내용이 없어요 🎉</Text>
          <Text style={styles.emptySubText}>새 노트를 작성해보세요!</Text>
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.noteCard}
              onPress={() => router.push(`/note/${item.id}`)}
            >
              <Text style={styles.noteSubject}>{item.subject || '과목 없음'}</Text>
              <Text style={styles.noteTitle}>{item.title}</Text>
              <Text style={styles.noteDate}>복습 예정일: {item.nextReviewDate}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* 새 노트 작성 버튼 */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/note/create')}
      >
        <Text style={styles.fabText}>+ 새 노트</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  streakBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff8e1',
    padding: 12,
    borderRadius: 10,
    marginBottom: 24,
    gap: 8,
  },
  streakEmoji: {
    fontSize: 24,
  },
  streakText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f57c00',
  },
  emptyBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
  },
  noteCard: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  noteSubject: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  noteDate: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 6,
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    backgroundColor: '#000',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
  },
  fabText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
