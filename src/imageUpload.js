// 이미지 업로드 기능 모듈
import { checkAuthState } from './auth.js';
import { uploadImage, addImageData } from './firebaseConfig.js';

// DOM 요소들
let authCheck, uploadForm, uploadButton, cancelButton, imageFile, imagePreview, uploadProgress, progressFill;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', async () => {
  console.log('이미지 업로드 페이지 로드됨');
  
  // DOM 요소 참조
  authCheck = document.getElementById('authCheck');
  uploadForm = document.getElementById('uploadForm');
  uploadButton = document.getElementById('uploadButton');
  cancelButton = document.getElementById('cancelButton');
  imageFile = document.getElementById('imageFile');
  imagePreview = document.getElementById('imagePreview');
  uploadProgress = document.getElementById('uploadProgress');
  progressFill = document.getElementById('progressFill');

  // 인증 상태 확인
  await checkUserAuth();
  
  // 이벤트 리스너 설정
  setupEventListeners();
});

// 사용자 인증 상태 확인
async function checkUserAuth() {
  try {
    const user = await checkAuthState();
    
    if (user) {
      // 인증된 사용자
      authCheck.style.display = 'none';
      uploadForm.style.display = 'block';
      console.log('인증된 사용자:', user.displayName);
    } else {
      // 인증되지 않은 사용자
      authCheck.innerHTML = `
        <div class="auth-required">
          <p>이 기능을 사용하려면 로그인이 필요합니다.</p>
          <a href="./index.html" class="auth-button">메인 페이지로 이동</a>
        </div>
      `;
    }
  } catch (error) {
    console.error('인증 상태 확인 실패:', error);
    authCheck.innerHTML = `
      <div class="auth-error">
        <p>인증 상태를 확인할 수 없습니다.</p>
        <a href="./index.html" class="auth-button">메인 페이지로 이동</a>
      </div>
    `;
  }
}

// 이벤트 리스너 설정
function setupEventListeners() {
  // 파일 선택 시 미리보기
  if (imageFile) {
    imageFile.addEventListener('change', handleFileSelect);
  }

  // 폼 제출
  if (uploadForm) {
    uploadForm.addEventListener('submit', handleFormSubmit);
  }

  // 취소 버튼
  if (cancelButton) {
    cancelButton.addEventListener('click', handleCancel);
  }
}

// 파일 선택 처리
function handleFileSelect(event) {
  const file = event.target.files[0];
  
  if (file) {
    // 파일 크기 확인 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.');
      imageFile.value = '';
      imagePreview.innerHTML = '';
      return;
    }

    // 이미지 파일 형식 확인
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      imageFile.value = '';
      imagePreview.innerHTML = '';
      return;
    }

    // 미리보기 생성
    const reader = new FileReader();
    reader.onload = function(e) {
      imagePreview.innerHTML = `
        <img src="${e.target.result}" alt="미리보기" class="preview-image">
        <p class="file-info">파일명: ${file.name}</p>
        <p class="file-info">크기: ${(file.size / 1024 / 1024).toFixed(2)} MB</p>
      `;
    };
    reader.readAsDataURL(file);
  } else {
    imagePreview.innerHTML = '';
  }
}

// 폼 제출 처리
async function handleFormSubmit(event) {
  event.preventDefault();
  
  // 폼 데이터 수집
  const formData = new FormData(event.target);
  const userName = formData.get('userName').trim();
  const grade = formData.get('grade');
  const classNumber = formData.get('classNumber');
  const description = formData.get('description').trim();
  const file = formData.get('imageFile');

  // 유효성 검사
  if (!userName || !grade || !classNumber || !file) {
    alert('모든 필수 필드를 입력해주세요.');
    return;
  }

  try {
    // 업로드 진행 상태 표시
    showUploadProgress();
    
    // 파일명 생성 (중복 방지를 위해 타임스탬프 추가)
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}_${grade}학년_${classNumber}반_${userName}.${fileExtension}`;
    const filePath = `images/${fileName}`;

    // Firebase Storage에 이미지 업로드
    console.log('이미지 업로드 시작:', fileName);
    const imageUrl = await uploadImage(file, filePath);
    console.log('이미지 업로드 완료:', imageUrl);

    // Firestore에 이미지 정보 저장
    const imageData = {
      fileName: fileName,
      originalName: file.name,
      userName: userName,
      grade: parseInt(grade),
      classNumber: parseInt(classNumber),
      description: description,
      imageUrl: imageUrl,
      filePath: filePath,
      timestamp: new Date(),
      fileSize: file.size
    };

    console.log('이미지 데이터 저장 시작');
    await addImageData(imageData);
    console.log('이미지 데이터 저장 완료');

    // 성공 메시지 및 리다이렉트
    alert('이미지가 성공적으로 업로드되었습니다!');
    window.location.href = './imageList.html';

  } catch (error) {
    console.error('업로드 실패:', error);
    alert('업로드에 실패했습니다. 다시 시도해주세요.');
    hideUploadProgress();
  }
}

// 취소 버튼 처리
function handleCancel() {
  if (confirm('작성 중인 내용이 모두 사라집니다. 계속하시겠습니까?')) {
    window.location.href = './index.html';
  }
}

// 업로드 진행 상태 표시
function showUploadProgress() {
  uploadForm.style.display = 'none';
  uploadProgress.style.display = 'block';
  
  // 진행 바 애니메이션 (시뮬레이션)
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 20;
    if (progress > 90) {
      progress = 90;
      clearInterval(interval);
    }
    progressFill.style.width = `${progress}%`;
  }, 200);
}

// 업로드 진행 상태 숨기기
function hideUploadProgress() {
  uploadProgress.style.display = 'none';
  uploadForm.style.display = 'block';
  progressFill.style.width = '0%';
}
