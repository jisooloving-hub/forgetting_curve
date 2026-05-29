export type Note = {
  id: string;
  userId: string;
  title: string;
  subject: string;
  content: string;
  createdAt: string;      // 작성 날짜 (YYYY-MM-DD)
  nextReviewDate: string; // 다음 복습 날짜 (YYYY-MM-DD)
};

export type ReviewRecord = {
  id: string;
  userId: string;
  noteId: string;
  noteTitle: string;
  result: 'good' | 'bad';       // 잘됨 / 안됨
  reviewedAt: string;           // 복습한 날짜
  nextReviewDate: string;       // 이번 복습으로 설정된 다음 복습 날짜
};
