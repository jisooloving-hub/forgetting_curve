import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../../services/firebase';
import { getNotes, deleteNote } from '../../services/notes';
import { Note } from '../../types';

export default function NoteListScreen() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.setItem('lastListVisitedAt', Date.now().toString());
      fetchNotes();
    }, [])
  );

  const fetchNotes = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    setLoading(true);
    try {
      const data = await getNotes(userId);
      // 최신순 정렬
      data.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setNotes(data);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item: Note) => {
    setOpenMenuId(null);
    await deleteNote(item.id);
    setNotes(prev => prev.filter(n => n.id !== item.id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>저장된 노트</Text>
      <Text style={styles.subHeader}>{notes.length}개의 노트</Text>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" />
      ) : notes.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>아직 저장된 노트가 없어요</Text>
          <TouchableOpacity onPress={() => router.push('/note/create')}>
            <Text style={styles.emptyLink}>+ 첫 노트 작성하기</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <TouchableOpacity
                style={styles.card}
                onPress={() => {
                  setOpenMenuId(null);
                  router.push(`/note/${item.id}`);
                }}
              >
                {/* 과목 색상 바 */}
                <View style={[styles.colorBar, { backgroundColor: item.subjectColor || '#4A90D9' }]} />
                <View style={styles.cardContent}>
                  {item.subject ? (
                    <Text style={[styles.subject, { color: item.subjectColor || '#4A90D9' }]}>
                      {item.subject}
                    </Text>
                  ) : null}
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.date}>작성일: {item.createdAt}  ·  다음 복습: {item.nextReviewDate}</Text>
                </View>
              </TouchableOpacity>

              {/* 더보기 버튼 */}
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
              >
                <Text style={styles.menuDots}>⋮</Text>
              </TouchableOpacity>

              {/* 드롭다운 */}
              {openMenuId === item.id && (
                <View style={styles.dropdown}>
                  <TouchableOpacity style={styles.dropdownItem} onPress={() => handleDelete(item)}>
                    <Text style={styles.dropdownDelete}>🗑 삭제</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        />
      )}
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
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  subHeader: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 20,
  },
  emptyBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
  emptyLink: {
    fontSize: 15,
    color: '#4A90D9',
    fontWeight: 'bold',
  },
  cardWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    overflow: 'hidden',
  },
  colorBar: {
    width: 6,
  },
  cardContent: {
    flex: 1,
    padding: 14,
    paddingRight: 36,
  },
  subject: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 6,
  },
  date: {
    fontSize: 11,
    color: '#bbb',
  },
  menuButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 6,
  },
  menuDots: {
    fontSize: 20,
    color: '#bbb',
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
});
