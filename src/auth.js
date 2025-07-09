// 인증 관련 기능 모듈
import { auth, signInWithGoogle, logOut } from './firebaseConfig.js';
import { onAuthStateChanged } from 'firebase/auth';

// DOM 요소들
const loginButton = document.getElementById('loginButton');
const logoutButton = document.getElementById('logoutButton');
const loginSection = document.getElementById('loginSection');
const userSection = document.getElementById('userSection');
const userInfo = document.getElementById('userInfo');
const authenticatedFeatures = document.getElementById('authenticatedFeatures');

// 페이지 로드 시 인증 상태 리스너 설정
document.addEventListener('DOMContentLoaded', () => {
  console.log('인증 모듈 로드됨');
  
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
    const result = await signInWithGoogle();
    console.log('로그인 성공:', result.user.displayName);
  } catch (error) {
    console.error('로그인 실패:', error);
    alert('로그인에 실패했습니다. 다시 시도해주세요.');
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
