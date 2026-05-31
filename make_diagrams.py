import base64
import urllib.request
import os

OUTPUT_DIR = r"C:\Users\jisoo\OneDrive\Desktop\클로드 바이브 코딩\바이브 코딩 개인 노트\망각곡선\diagrams"
os.makedirs(OUTPUT_DIR, exist_ok=True)

diagrams = {
    "01_architecture": """
graph TB
    subgraph FE["Expo React Native - 프론트엔드"]
        Router["Expo Router"]

        subgraph Screens["화면 app/"]
            Auth["auth - login, signup, forgot-password"]
            Tabs["tabs - 홈, 캘린더, 설정"]
            Note["note - create, list, detail, self-check"]
        end

        subgraph Logic["로직"]
            Utils["utils - 망각곡선 계산"]
            Types["types - TypeScript 타입"]
        end
    end

    subgraph SVC["서비스 레이어 services/"]
        AuthSvc["auth.ts - signIn, signUp, logOut, resetPassword"]
        NotesSvc["notes.ts - createNote, getNotes, deleteNote"]
        FB["firebase.ts - 초기화"]
    end

    subgraph Cloud["외부 서비스"]
        FBAuth["Firebase Auth - 이메일 인증 + 비밀번호 재설정"]
        FSStore["Firestore DB - notes, reviews"]
        Claude["Claude API - AI 문제 생성 (5단계 예정)"]
    end

    Router --> Auth & Tabs & Note
    Auth --> AuthSvc
    Note --> NotesSvc
    AuthSvc & NotesSvc --> FB
    FB --> FBAuth & FSStore
    Note -.->|"예정"| Claude
""",

    "02_navigation": """
flowchart TD
    Start([앱 시작]) --> Check{로그인 상태?}
    Check -->|미로그인| Login[로그인 화면]
    Check -->|로그인됨| Home

    Login --> Signup[회원가입 화면]
    Login --> Forgot[비밀번호 찾기]
    Login -->|성공| Home
    Signup -->|성공| Home
    Forgot -->|이메일 발송| Login

    Home["홈 - 오늘 복습 목록"]
    Home -->|전체 노트 보기| List[전체 노트 목록]
    Home -->|+ 버튼| Create[노트 작성]
    Home --> Detail[노트 상세]
    Home --> Cal[캘린더]
    Home --> Set[설정]

    Create -->|저장| Home
    List -->|노트 선택| Detail
    Detail --> SelfCheck[자가 체크]
    SelfCheck -->|잘됨 - 3일 후| Home
    SelfCheck -->|안됨 - 1일 후| Home
""",

    "03_database": """
erDiagram
    users {
        string uid PK
        string email
        number streak
        string lastReviewDate
    }
    notes {
        string id PK
        string userId FK
        string title
        string subject
        string subjectColor
        string content
        string createdAt
        string nextReviewDate
    }
    reviews {
        string id PK
        string userId FK
        string noteId FK
        string result "good or bad"
        string reviewedAt
        string nextReviewDate
    }

    users ||--o{ notes : "작성"
    users ||--o{ reviews : "복습 기록"
    notes ||--o{ reviews : "연결"
"""
}

labels = {
    "01_architecture": "전체 아키텍처",
    "02_navigation": "화면 네비게이션",
    "03_database": "데이터베이스 구조"
}

print("다이어그램 이미지 생성 중...\n")

for name, code in diagrams.items():
    encoded = base64.urlsafe_b64encode(code.strip().encode("utf-8")).decode("utf-8")
    url = f"https://mermaid.ink/img/{encoded}?bgColor=ffffff"
    output_path = os.path.join(OUTPUT_DIR, f"{name}.png")

    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=15) as response:
            with open(output_path, "wb") as f:
                f.write(response.read())
        print(f"[완료] {labels[name]} → {name}.png")
    except Exception as e:
        print(f"[실패] {labels[name]}: {e}")

print(f"\n저장 위치: {OUTPUT_DIR}")
