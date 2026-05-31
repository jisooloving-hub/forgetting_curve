import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../../services/firebase';
import { getTodayReviews, deleteNote } from '../../services/notes';
import { Note } from '../../types';

export default function HomeScreen() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);

  // 화면에 포커스될 때마다 오늘 복습 목록 새로 불러오기
  useFocusEffect(
    useCallback(() => {
      fetchTodayReviews();
      checkNewBadge();
    }, [])
  );

  const checkNewBadge = async () => {
    const created = await AsyncStorage.getItem('lastNoteCreatedAt');
    const visited = await AsyncStorage.getItem('lastListVisitedAt');
    if (created && (!visited || Number(created) > Number(visited))) {
      setShowNew(true);
    } else {
      setShowNew(false);
    }
  };

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

  const handleDelete = async (item: Note) => {
    setOpenMenuId(null);
    await deleteNote(item.id);
    setReviews(prev => prev.filter(n => n.id !== item.id));
  };

  return (
    <View style={styles.container}>

      {/* 헤더 */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>커브터디</Text>
        <Text style={styles.headerSub}>curvetudy</Text>
      </View>

      {/* 스트릭 */}
      <View style={styles.streakBox}>
        <Text style={styles.streakEmoji}>🔥</Text>
        <Text style={styles.streakText}>0일 연속 복습 중</Text>
      </View>

      {/* 전체 노트 보기 버튼 */}
      <TouchableOpacity
        style={styles.allNotesButton}
        onPress={() => router.push('/note/list')}
      >
        <View style={styles.allNotesLeft}>
          <Text style={styles.allNotesText}>📋  저장된 전체 노트 보기</Text>
          {showNew && <Text style={styles.newBadge}>new</Text>}
        </View>
        <Text style={styles.allNotesArrow}>›</Text>
      </TouchableOpacity>

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
            <View style={styles.noteCardWrapper}>
              <TouchableOpacity
                style={styles.noteCard}
                onPress={() => {
                  setOpenMenuId(null);
                  router.push(`/note/${item.id}`);
                }}
              >
                <Text style={styles.noteSubject}>{item.subject || '과목 없음'}</Text>
                <Text style={styles.noteTitle}>{item.title}</Text>
                <Text style={styles.noteDate}>복습 예정일: {item.nextReviewDate}</Text>
              </TouchableOpacity>

              {/* 더보기 버튼 */}
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
              >
                <Text style={styles.menuDots}>⋮</Text>
              </TouchableOpacity>

              {/* 드롭다운 메뉴 */}
              {openMenuId === item.id && (
                <View style={styles.dropdown}>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => handleDelete(item)}
                  >
                    <Text style={styles.dropdownDelete}>🗑 삭제</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a2e',
    fontFamily: 'Jua',
  },
  headerSub: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 4,
    fontFamily: 'Arial Rounded MT Bold',
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
  noteCardWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  noteCard: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 10,
  },
  menuButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 6,
  },
  menuDots: {
    fontSize: 20,
    color: '#888',
    lineHeight: 20,
  },
  dropdown: {
    position: 'absolute',
    top: 36,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 10,
    minWidth: 100,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  dropdownDelete: {
    fontSize: 14,
    color: '#e53935',
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
  allNotesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 16,
  },
  allNotesLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  allNotesText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  newBadge: {
    fontSize: 12,
    color: '#e91e8c',
    fontWeight: 'bold',
  },
  allNotesArrow: {
    fontSize: 20,
    color: '#aaa',
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
