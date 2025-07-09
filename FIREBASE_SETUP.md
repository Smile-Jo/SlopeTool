# Firebase 설정 가이드

## 1. Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름 입력 (예: slope-tool)
4. Google Analytics 설정 (선택사항)
5. 프로젝트 생성 완료

## 2. 웹 앱 추가

1. Firebase 프로젝트 대시보드에서 웹 아이콘 (</>) 클릭
2. 앱 닉네임 입력 (예: slope-tool-web)
3. Firebase Hosting 설정 (선택사항)
4. 앱 등록 및 설정 복사

## 3. 필요한 서비스 활성화

### Authentication (인증)
1. 왼쪽 메뉴에서 "Authentication" 클릭
2. "시작하기" 클릭
3. "Sign-in method" 탭에서 "Google" 활성화
4. 프로젝트 지원 이메일 설정

### Firestore Database (데이터베이스)
1. 왼쪽 메뉴에서 "Firestore Database" 클릭
2. "데이터베이스 만들기" 클릭
3. 보안 규칙: 테스트 모드로 시작 (나중에 수정 가능)
4. 위치 선택 (asia-northeast3 권장 - 서울)

### Storage (파일 저장소)
1. 왼쪽 메뉴에서 "Storage" 클릭
2. "시작하기" 클릭
3. 보안 규칙: 테스트 모드로 시작
4. 위치는 Firestore와 동일하게 설정

## 4. 설정 정보 업데이트

1. Firebase 프로젝트 설정으로 이동
2. "일반" 탭에서 웹 앱의 설정 정보 확인
3. `src/firebaseConfig.js` 파일에서 다음 정보 업데이트:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};
```

## 5. 보안 규칙 설정 (운영 환경)

### Firestore 보안 규칙
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /images/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Storage 보안 규칙
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /images/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 6. 도메인 승인 (필요시)

Authentication > Settings > Authorized domains에서 사용할 도메인 추가

## 7. 테스트

1. 프로젝트 실행: `npm run dev`
2. Google 로그인 테스트
3. 이미지 업로드 테스트
4. 이미지 목록 확인 테스트

## 주의사항

- Firebase 설정 정보는 공개 저장소에 업로드하지 마세요
- 보안 규칙은 반드시 운영 환경에 맞게 설정하세요
- Storage 사용량과 비용을 주기적으로 확인하세요
