// 인증 관련 기능 모듈
import { auth, signInWithGooglePopup, signInWithGoogleRedirect, getRedirectResultHandler, logOut } from './firebaseConfig.js';
import { onAuthStateChanged } from 'firebase/auth';

// DOM 요소들
const loginButton = document.getElementById('loginButton');
const logoutButton = document.getElementById('logoutButton');
const loginSection = document.getElementById('loginSection');
const userSection = document.getElementById('userSection');
const userInfo = document.getElementById('userInfo');
const authenticatedFeatures = document.getElementById('authenticatedFeatures');

// 페이지 로드 시 인증 상태 리스너 설정
document.addEventListener('DOMContentLoaded', async () => {
  console.log('인증 모듈 로드됨');
  
  // React 예제처럼 단순하게 리다이렉트 결과만 확인
  try {
    const result = await getRedirectResultHandler();
    if (result) {
      console.log('리다이렉트 로그인 성공:', result.user.displayName);
    }
  } catch (error) {
    console.error('리다이렉트 로그인 오류:', error);
  }
  
  // 인증 상태 변화 감지 (React 예제와 동일한 방식)
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log('사용자 로그인됨:', user.displayName);
      showUserSection(user);
    } else {
      console.log('사용자 로그아웃됨');
      showLoginSection();
    }
  });

  // 로그인 버튼 이벤트
  if (loginButton) {
    loginButton.addEventListener('click', handleLogin);
  }

  // 로그아웃 버튼 이벤트
  if (logoutButton) {
    logoutButton.addEventListener('click', handleLogout);
  }
});

// 로그인 처리 (사파리 계정 선택 강제)
async function handleLogin() {
  try {
    // 사파리에서 계정 선택 강제를 위한 추가 처리
    console.log('로그인 시도 - 계정 선택 화면 강제 표시');
    
    // 먼저 팝업 방식으로 시도 (React 예제와 동일)
    console.log('팝업 방식으로 로그인 시도');
    const result = await signInWithGooglePopup();
    console.log('로그인 성공:', result.user.displayName);
  } catch (error) {
    console.error('팝업 로그인 실패:', error);
    
    // 팝업이 차단되거나 모바일인 경우 리다이렉트 시도
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
      try {
        console.log('팝업 실패 - 리다이렉트 방식으로 재시도 (계정 선택 강제)');
        await signInWithGoogleRedirect();
      } catch (redirectError) {
        console.error('리다이렉트 로그인도 실패:', redirectError);
        alert('로그인에 실패했습니다. 인터넷 연결을 확인해주세요.');
      }
    } else {
      let errorMessage = '로그인에 실패했습니다.';
      if (error.code === 'auth/network-request-failed') {
        errorMessage = '네트워크 연결을 확인해주세요.';
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = '이 도메인은 인증이 허용되지 않았습니다.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Google 로그인이 활성화되지 않았습니다.';
      }
      alert(errorMessage);
    }
  }
}

async function handleLogout() {
  try {
    // Firebase 로그아웃
    await logOut();
    
    // 사파리에서 Google 인증 캐시 정리
    // 브라우저의 Google 세션도 정리하기 위한 추가 처리
    if (navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')) {
      console.log('Safari 감지 - Google 세션 정리 시도');
      // Google 로그아웃 URL로 숨겨진 iframe 요청
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = 'https://accounts.google.com/logout';
      document.body.appendChild(iframe);
      
      // 잠시 후 iframe 제거
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }
    
  } catch (error) {
    console.error('로그아웃 실패:', error);
    alert('로그아웃에 실패했습니다.');
  }
}

// 사용자 섹션 표시
function showUserSection(user) {
  console.log('사용자 섹션 표시:', user.displayName);
  if (loginSection) loginSection.style.display = 'none';
  if (userSection) userSection.style.display = 'block';
  if (userInfo) userInfo.textContent = `👤 ${user.displayName}`;
  if (authenticatedFeatures) authenticatedFeatures.style.display = 'block';
}

// 로그인 섹션 표시
function showLoginSection() {
  console.log('로그인 섹션 표시');
  if (loginSection) loginSection.style.display = 'block';
  if (userSection) userSection.style.display = 'none';
  if (authenticatedFeatures) authenticatedFeatures.style.display = 'none';
}

// 현재 사용자 정보 가져오기 (다른 페이지에서 사용)
export function getCurrentUser() {
  return auth.currentUser;
}

// 인증 상태 확인 (다른 페이지에서 사용)
export function checkAuthState() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}
