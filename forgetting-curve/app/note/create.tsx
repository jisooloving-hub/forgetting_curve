import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { auth } from '../../services/firebase';
import { createNote } from '../../services/notes';

export default function CreateNoteScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!title || !content) {
      Alert.alert('오류', '제목과 내용을 입력해주세요.');
      return;
    }
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    setLoading(true);
    try {
      await createNote(userId, title, subject, content);
      Alert.alert('저장 완료', '내일 복습 일정이 자동으로 생성됐어요!', [
        { text: '확인', onPress: () => router.back() }
      ]);
    } catch (e) {
      Alert.alert('오류', '저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>제목 *</Text>
      <TextInput
        style={styles.input}
        placeholder="노트 제목을 입력하세요"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>과목 / 태그</Text>
      <TextInput
        style={styles.input}
        placeholder="예: 생물, 수학, 영어"
        value={subject}
        onChangeText={setSubject}
      />

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

      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
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
    marginTop: 16,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  contentInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
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
    backgroundColor: '#000',
    padding: 14,
    borderRadius: 8,
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
