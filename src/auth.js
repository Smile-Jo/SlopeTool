// 인증 관련 기능 모듈
import { auth, signInWithGooglePopup, signInWithGoogle, getRedirectResultHandler, logOut } from './firebaseConfig.js';
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
  console.log('User Agent:', navigator.userAgent);
  console.log('화면 크기:', window.innerWidth, 'x', window.innerHeight);
  console.log('터치 지원:', 'ontouchstart' in window);
  
  // 리다이렉트 결과 확인 (Google 로그인 후 돌아온 경우)
  try {
    console.log('리다이렉트 결과 확인 중...');
    const result = await getRedirectResultHandler();
    if (result) {
      console.log('리다이렉트 로그인 성공:', result.user.displayName);
      // 성공 메시지 표시 (선택사항)
      setTimeout(() => {
        console.log('로그인 완료');
      }, 1000);
    } else {
      console.log('리다이렉트 결과 없음 (정상)');
    }
  } catch (error) {
    console.error('리다이렉트 로그인 오류:', error);
    // 리다이렉트 오류가 있어도 계속 진행
  }
  
  // 인증 상태 변화 감지
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // 사용자 로그인됨
      console.log('사용자 로그인됨:', user.displayName);
      showUserSection(user);
    } else {
      // 사용자 로그아웃됨
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

// 로그인 처리
async function handleLogin() {
  try {
    // 모바일 환경 감지
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isSmallScreen = window.innerWidth <= 768;
    
    console.log('로그인 시도 - 모바일:', isMobile, '작은 화면:', isSmallScreen);
    
    if (isMobile || isSmallScreen) {
      // 모바일이나 작은 화면에서는 리다이렉트 방식 사용
      console.log('리다이렉트 방식으로 로그인');
      await signInWithGoogle();
    } else {
      // 데스크톱에서는 팝업 방식 사용
      console.log('팝업 방식으로 로그인');
      const result = await signInWithGooglePopup();
      console.log('팝업 로그인 성공:', result.user.displayName);
    }
  } catch (error) {
    console.error('로그인 실패:', error);
    
    // 에러 유형에 따른 자세한 메시지
    let errorMessage = '로그인에 실패했습니다.';
    if (error.code === 'auth/popup-blocked') {
      errorMessage = '팝업이 차단되었습니다. 팝업을 허용하거나 다시 시도해주세요.';
    } else if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = '로그인 창이 닫혔습니다.';
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = '네트워크 연결을 확인해주세요.';
    } else if (error.code === 'auth/unauthorized-domain') {
      errorMessage = '이 도메인은 인증이 허용되지 않았습니다.';
    }
    
    alert(errorMessage + ' 다시 시도해주세요.');
  }
}

// 로그아웃 처리
async function handleLogout() {
  try {
    await logOut();
    console.log('로그아웃 성공');
  } catch (error) {
    console.error('로그아웃 실패:', error);
    alert('로그아웃에 실패했습니다.');
  }
}

// 사용자 섹션 표시
function showUserSection(user) {
  if (loginSection) loginSection.style.display = 'none';
  if (userSection) userSection.style.display = 'block';
  if (userInfo) userInfo.textContent = `👤 ${user.displayName}`;
  if (authenticatedFeatures) authenticatedFeatures.style.display = 'block';
}

// 로그인 섹션 표시
function showLoginSection() {
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
