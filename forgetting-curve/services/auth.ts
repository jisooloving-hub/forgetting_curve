import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './firebase';

// 회원가입
export const signUp = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// 로그인
export const signIn = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// 로그아웃
export const logOut = () => {
  return signOut(auth);
};

// 비밀번호 재설정 이메일 발송
export const resetPassword = (email: string) => {
  return sendPasswordResetEmail(auth, email);
};
