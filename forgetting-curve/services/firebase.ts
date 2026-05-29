import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDw8T15guq5jc_zQGFsucAzEgYfliWaTVg",
  authDomain: "forgetting-curve-d7265.firebaseapp.com",
  projectId: "forgetting-curve-d7265",
  storageBucket: "forgetting-curve-d7265.firebasestorage.app",
  messagingSenderId: "1030612976668",
  appId: "1:1030612976668:web:e5d0fcdd2a9ae912080bd9",
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// 로그인/회원가입에 사용
export const auth = getAuth(app);

// 데이터 저장/불러오기에 사용
export const db = getFirestore(app);
