import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../../services/firebase';
import { createNote, getNotes } from '../../services/notes';

const PALETTE = [
  '#4A90D9', // 파랑
  '#9B59B6', // 보라
  '#27AE60', // 초록
  '#E67E22', // 주황
  '#E74C3C', // 빨강
  '#1ABC9C', // 청록
  '#E91E63', // 핑크
  '#607D8B', // 슬레이트
];

type SubjectChip = { name: string; color: string };

export default function CreateNoteScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [selectedColor, setSelectedColor] = useState(PALETTE[0]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [pastSubjects, setPastSubjects] = useState<SubjectChip[]>([]);

  // 기존 노트에서 과목 목록 불러오기
  useEffect(() => {
    const loadSubjects = async () => {
      const userId = auth.currentUser?.uid;
      if (!userId) return;
      const notes = await getNotes(userId);
      // 과목별로 가장 최근 색상 추출 (중복 제거)
      const map = new Map<string, string>();
      notes.forEach(n => {
        if (n.subject) map.set(n.subject, n.subjectColor || PALETTE[0]);
      });
      setPastSubjects(Array.from(map.entries()).map(([name, color]) => ({ name, color })));
    };
    loadSubjects();
  }, []);

  // 과목 칩 선택 시 subject + color 자동 설정
  const handleChipPress = (chip: SubjectChip) => {
    setSubject(chip.name);
    setSelectedColor(chip.color);
  };

  const handleSave = async () => {
    if (!title || !content) {
      if (Platform.OS === 'web') {
        window.alert('제목과 내용을 입력해주세요.');
      } else {
        Alert.alert('오류', '제목과 내용을 입력해주세요.');
      }
      return;
    }
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    setLoading(true);
    try {
      await createNote(userId, title, subject, content, selectedColor);
      await AsyncStorage.setItem('lastNoteCreatedAt', Date.now().toString());
      router.back();
    } catch (e) {
      if (Platform.OS === 'web') {
        window.alert('저장에 실패했습니다. 다시 시도해주세요.');
      } else {
        Alert.alert('오류', '저장에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">

      {/* 제목 */}
      <Text style={styles.label}>제목 *</Text>
      <TextInput
        style={styles.input}
        placeholder="노트 제목을 입력하세요"
        value={title}
        onChangeText={setTitle}
      />

      {/* 과목 / 태그 */}
      <Text style={styles.label}>과목 / 태그</Text>

      {/* 과목 입력창 + 색상 인디케이터 */}
      <View style={styles.subjectRow}>
        <View style={[styles.colorDot, { backgroundColor: selectedColor }]} />
        <TextInput
          style={styles.subjectInput}
          placeholder="예: 생물, 수학, 영어"
          value={subject}
          onChangeText={setSubject}
        />
      </View>

      {/* 이전 과목 칩 */}
      {pastSubjects.length > 0 && (
        <View style={styles.chipRow}>
          {pastSubjects.map(chip => (
            <TouchableOpacity
              key={chip.name}
              style={[
                styles.chip,
                { borderColor: chip.color },
                subject === chip.name && { backgroundColor: chip.color },
              ]}
              onPress={() => handleChipPress(chip)}
            >
              <Text style={[
                styles.chipText,
                subject === chip.name && { color: '#fff' },
              ]}>
                {chip.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* 색상 팔레트 */}
      <Text style={styles.paletteLabel}>색상 선택</Text>
      <View style={styles.paletteRow}>
        {PALETTE.map(color => (
          <TouchableOpacity
            key={color}
            style={[
              styles.paletteCircle,
              { backgroundColor: color },
              selectedColor === color && styles.paletteCircleSelected,
            ]}
            onPress={() => setSelectedColor(color)}
          />
        ))}
      </View>

      {/* 내용 */}
      <Text style={styles.label}>내용 *</Text>
      <TextInput
        style={styles.contentInput}
        placeholder="공부한 내용을 자유롭게 입력하세요"
        value={content}
        onChangeText={setContent}
        multiline
        textAlignVertical="top"
      />

      <Text style={styles.hint}>💡 저장하면 내일 복습 일정이 자동으로 생성돼요</Text>

      <TouchableOpacity style={[styles.button, { backgroundColor: selectedColor }]} onPress={handleSave} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? '저장 중...' : '저장하기'}</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
    marginTop: 20,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  subjectInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  chipText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  paletteLabel: {
    fontSize: 13,
    color: '#888',
    marginTop: 16,
    marginBottom: 8,
  },
  paletteRow: {
    flexDirection: 'row',
    gap: 10,
  },
  paletteCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  paletteCircleSelected: {
    borderWidth: 3,
    borderColor: '#000',
    transform: [{ scale: 1.15 }],
  },
  contentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    height: 200,
  },
  hint: {
    marginTop: 12,
    color: '#888',
    fontSize: 13,
  },
  button: {
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
