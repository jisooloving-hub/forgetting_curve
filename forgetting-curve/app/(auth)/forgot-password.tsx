import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { resetPassword } from '../../services/auth';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);  // 이메일 발송 완료 여부

  const handleReset = async () => {
    if (!email) {
      Alert.alert('오류', '이메일을 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);  // 성공 시 완료 화면으로 전환
    } catch (e) {
      Alert.alert('오류', '가입된 이메일이 아니거나 올바르지 않은 이메일이에요.');
    } finally {
      setLoading(false);
    }
  };

  // 이메일 발송 완료 화면
  if (sent) {
    return (
      <View style={styles.container}>
        <Text style={styles.emoji}>📬</Text>
        <Text style={styles.title}>이메일을 보냈어요!</Text>
        <Text style={styles.desc}>
          <Text style={styles.bold}>{email}</Text>
          {'\n'}로 비밀번호 재설정 링크를 보냈어요.{'\n'}
          메일함을 확인해주세요.
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>로그인 화면으로 돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 이메일 입력 화면
  return (
    <View style={styles.container}>
      <Text style={styles.title}>비밀번호 찾기</Text>
      <Text style={styles.desc}>
        가입할 때 사용한 이메일을 입력하면{'\n'}
        비밀번호 재설정 링크를 보내드려요.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="이메일"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity style={styles.button} onPress={handleReset} disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? '보내는 중...' : '재설정 이메일 보내기'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.link}>로그인으로 돌아가기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  emoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  desc: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginBottom: 28,
  },
  bold: {
    fontWeight: 'bold',
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#000',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  link: {
    textAlign: 'center',
    color: '#555',
    fontSize: 14,
  },
});
