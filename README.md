# SlopeTool - 기울기 측정 도구

모바일 친화적인 웹 앱으로, 카메라와 격자 오버레이를 사용하여 기울기를 측정합니다.

## 프로젝트 구조

```
SlopeTool/
├── index.html          # 메인 페이지 (페이지 선택)
├── Grad.html           # 기울기 측정 페이지
├── Slope.html          # 3D 경사로 모델 페이지  
├── common.css          # 공통 스타일시트
├── package.json        # 프로젝트 설정
├── vite.config.js      # Vite 빌드 설정
├── public/             # 정적 파일들
│   ├── Target.mind
│   ├── Target.png
│   └── vite.svg
└── src/                # 소스 코드
    ├── Grad.js         # 기울기 측정 메인 앱 (모듈화됨)
    ├── camera.js       # 카메라 접근 및 제어
    ├── drawing.js      # 점, 선, 삼각형 그리기
    ├── capture.js      # 화면 캡처 기능
    ├── grid.js         # 격자 관리
    ├── events.js       # 사용자 입력 처리
    ├── main.js         # 메인 페이지 스크립트
    └── Slope.js        # 3D 경사로 모델
├── archive/            # 백업 파일들
    ├── Grad-old.js     # 모듈화 이전 버전
    └── Grad-new.js     # 모듈화 개발 중간 버전
```

## 주요 기능

### 기울기 측정 (Grad.html)
- **모바일 최적화**: 후면 카메라 자동 선택, 터치 인터페이스
- **격자 오버레이**: 조정 가능한 격자로 정확한 측정
- **점 선택**: 격자 교차점에 정확히 정렬되는 빨간 점
- **선분 그리기**: 두 점 사이의 파란색 연결선
- **삼각형 생성**: 직각삼각형으로 수평/수직 거리 시각화
- **치수 표시**: 격자 단위로 거리 측정
- **화면 캡처**: 카메라 화면 + 오버레이 요소 통합 캡처

### 3D 경사로 모델 (Slope.html)
- **3D 시각화**: Three.js로 구현된 인터랙티브 경사로
- **실시간 계산**: 입력값에 따른 즉시 업데이트

## 모듈 구조

### camera.js
- `startCamera()`: 모바일 후면 카메라 접근 및 설정
- 다단계 fallback 전략으로 최대 호환성 보장

### drawing.js
- 점, 선분, 삼각형 그리기 및 관리
- 상태 관리: `state.points`, `state.triangleCreated`
- DOM 요소 생성 및 정확한 위치 계산

### capture.js
- `captureScreenshot()`: 비디오 + 웹 요소 통합 캡처
- `fallbackCapture()`: Canvas API 직접 렌더링 대안

### grid.js
- 격자 크기 관리 및 업데이트
- `increaseGridSize()`, `decreaseGridSize()`

### events.js
- 터치/클릭 이벤트 처리
- 컨트롤 영역 감지 및 차단
- 격자점 스냅 로직

## 사용법

1. **개발 서버 시작**:
   ```bash
   npm run dev
   ```

2. **빌드**:
   ```bash
   npm run build
   ```

3. **기울기 측정**:
   - 휴대폰에서 Grad.html 접속
   - 카메라 권한 허용
   - 격자점 두 개 선택
   - 거리 측정 또는 삼각형 그리기
   - 캡처 버튼으로 결과 저장

## 기술 스택

- **Frontend**: Vanilla JavaScript (ES6 Modules)
- **3D Graphics**: Three.js
- **Build Tool**: Vite
- **Mobile Support**: MediaDevices API, Touch Events
- **Capture**: html2canvas + Canvas API

## 브라우저 호환성

- Chrome/Safari (모바일): 완전 지원
- Firefox (모바일): 부분 지원
- 데스크톱: 모든 주요 브라우저

## 개발 노트

- 모듈화된 구조로 유지보수성 향상
- 모바일 우선 설계
- 터치 및 클릭 이벤트 통합 처리
- 카메라 접근 실패 시 여러 단계 fallback
- 정확한 격자점 정렬 및 스냅 기능

## 아카이브 파일들

`archive/` 폴더에는 리팩토링 과정의 백업 파일들이 저장되어 있습니다:

- **Grad-old.js**: 모듈화 이전의 원본 모놀리식 코드 (850라인)
- **Grad-new.js**: 모듈화 개발 과정에서의 중간 버전

현재 활성화된 `src/Grad.js`는 모듈화가 완료된 버전입니다.
