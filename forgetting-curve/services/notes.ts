import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import { Note } from '../types';

// 날짜를 YYYY-MM-DD 형식으로 반환
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// 오늘 날짜로부터 n일 후 날짜 반환
const addDays = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return formatDate(date);
};

// 노트 저장 (첫 복습 일정은 1일 후 자동 설정)
export const createNote = async (
  userId: string,
  title: string,
  subject: string,
  content: string,
  subjectColor: string = '#4A90D9'
) => {
  const note = {
    userId,
    title,
    subject,
    subjectColor,
    content,
    createdAt: formatDate(new Date()),
    nextReviewDate: addDays(1), // 첫 복습은 1일 후
  };
  const docRef = await addDoc(collection(db, 'notes'), note);
  return docRef.id;
};

// 특정 유저의 노트 전체 불러오기
export const getNotes = async (userId: string): Promise<Note[]> => {
  const q = query(collection(db, 'notes'), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note));
};

// 오늘 복습해야 할 노트 불러오기
export const getTodayReviews = async (userId: string): Promise<Note[]> => {
  const today = formatDate(new Date());
  // userId로만 검색 후 날짜 필터링은 코드에서 처리 (인덱스 불필요)
  const q = query(collection(db, 'notes'), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  const allNotes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note));
  return allNotes.filter(note => note.nextReviewDate <= today);
};

// 노트 삭제
export const deleteNote = async (noteId: string): Promise<void> => {
  await deleteDoc(doc(db, 'notes', noteId));
};
