// 이미지 목록 기능 모듈
import { checkAuthState } from './auth.js';
import { getImageList, deleteImageData, deleteImage } from './firebaseConfig.js';

// DOM 요소들
let authCheck, filterSection, loadingSection, imageListSection, emptyMessage;
let gradeFilter, classFilter, sortOrder, refreshButton, imageGrid, imageCount;
let imageModal, closeModal, modalImageContainer, modalImageInfo, deleteImageButton, copyUrlButton;

// 전역 변수
let allImages = [];
let currentImageData = null;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', async () => {
  console.log('이미지 목록 페이지 로드됨');
  
  // DOM 요소 참조
  initializeDOMElements();
  
  // 인증 상태 확인
  await checkUserAuth();
  
  // 이벤트 리스너 설정
  setupEventListeners();
  
  // 이미지 목록 로드
  await loadImageList();
});

// DOM 요소 초기화
function initializeDOMElements() {
  authCheck = document.getElementById('authCheck');
  filterSection = document.getElementById('filterSection');
  loadingSection = document.getElementById('loadingSection');
  imageListSection = document.getElementById('imageListSection');
  emptyMessage = document.getElementById('emptyMessage');
  
  gradeFilter = document.getElementById('gradeFilter');
  classFilter = document.getElementById('classFilter');
  sortOrder = document.getElementById('sortOrder');
  refreshButton = document.getElementById('refreshButton');
  imageGrid = document.getElementById('imageGrid');
  imageCount = document.getElementById('imageCount');
  
  imageModal = document.getElementById('imageModal');
  closeModal = document.getElementById('closeModal');
  modalImageContainer = document.getElementById('modalImageContainer');
  modalImageInfo = document.getElementById('modalImageInfo');
  deleteImageButton = document.getElementById('deleteImageButton');
  copyUrlButton = document.getElementById('copyUrlButton');
}

// 사용자 인증 상태 확인
async function checkUserAuth() {
  try {
    const user = await checkAuthState();
    
    if (user) {
      // 인증된 사용자
      authCheck.style.display = 'none';
      filterSection.style.display = 'block';
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
  // 필터 변경 이벤트
  if (gradeFilter) gradeFilter.addEventListener('change', applyFilters);
  if (classFilter) classFilter.addEventListener('change', applyFilters);
  if (sortOrder) sortOrder.addEventListener('change', applyFilters);
  
  // 새로고침 버튼
  if (refreshButton) refreshButton.addEventListener('click', loadImageList);
  
  // 모달 관련 이벤트
  if (closeModal) closeModal.addEventListener('click', closeImageModal);
  if (imageModal) {
    imageModal.addEventListener('click', (e) => {
      if (e.target === imageModal) closeImageModal();
    });
  }
  if (deleteImageButton) deleteImageButton.addEventListener('click', handleDeleteImage);
  if (copyUrlButton) copyUrlButton.addEventListener('click', handleCopyUrl);
  
  // ESC 키로 모달 닫기
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeImageModal();
  });
}

// 이미지 목록 로드
async function loadImageList() {
  try {
    showLoading();
    
    console.log('이미지 목록 로드 시작');
    allImages = await getImageList();
    console.log('로드된 이미지 수:', allImages.length);
    
    hideLoading();
    applyFilters();
    
  } catch (error) {
    console.error('이미지 목록 로드 실패:', error);
    hideLoading();
    showError('이미지 목록을 불러오는데 실패했습니다.');
  }
}

// 필터 적용
function applyFilters() {
  let filteredImages = [...allImages];
  
  // 학년 필터
  const selectedGrade = gradeFilter?.value;
  if (selectedGrade) {
    filteredImages = filteredImages.filter(img => img.grade === parseInt(selectedGrade));
  }
  
  // 반 필터
  const selectedClass = classFilter?.value;
  if (selectedClass) {
    filteredImages = filteredImages.filter(img => img.classNumber === parseInt(selectedClass));
  }
  
  // 정렬
  const sortBy = sortOrder?.value || 'newest';
  switch (sortBy) {
    case 'newest':
      filteredImages.sort((a, b) => new Date(b.timestamp.seconds * 1000) - new Date(a.timestamp.seconds * 1000));
      break;
    case 'oldest':
      filteredImages.sort((a, b) => new Date(a.timestamp.seconds * 1000) - new Date(b.timestamp.seconds * 1000));
      break;
    case 'name':
      filteredImages.sort((a, b) => a.userName.localeCompare(b.userName));
      break;
    case 'grade':
      filteredImages.sort((a, b) => a.grade - b.grade || a.classNumber - b.classNumber);
      break;
  }
  
  displayImages(filteredImages);
}

// 이미지 표시
function displayImages(images) {
  if (images.length === 0) {
    showEmptyMessage();
    return;
  }
  
  // 이미지 개수 표시
  imageCount.textContent = `총 ${images.length}개의 이미지`;
  
  // 이미지 그리드 생성
  imageGrid.innerHTML = images.map(image => createImageCard(image)).join('');
  
  // 이미지 카드 클릭 이벤트
  const imageCards = imageGrid.querySelectorAll('.image-card');
  imageCards.forEach((card, index) => {
    card.addEventListener('click', () => openImageModal(images[index]));
  });
  
  showImageList();
}

// 이미지 카드 생성
function createImageCard(image) {
  const uploadDate = new Date(image.timestamp.seconds * 1000).toLocaleDateString('ko-KR');
  const fileSize = (image.fileSize / 1024 / 1024).toFixed(2);
  
  return `
    <div class="image-card" data-id="${image.id}">
      <div class="image-thumbnail">
        <img src="${image.imageUrl}" alt="${image.originalName}" loading="lazy">
      </div>
      <div class="image-info">
        <h3 class="image-title">${image.userName}</h3>
        <p class="image-details">${image.grade}학년 ${image.classNumber}반</p>
        <p class="image-date">${uploadDate}</p>
        <p class="image-size">${fileSize} MB</p>
        ${image.description ? `<p class="image-description">${image.description}</p>` : ''}
      </div>
    </div>
  `;
}

// 이미지 모달 열기
function openImageModal(imageData) {
  currentImageData = imageData;
  
  const uploadDate = new Date(imageData.timestamp.seconds * 1000).toLocaleString('ko-KR');
  const fileSize = (imageData.fileSize / 1024 / 1024).toFixed(2);
  
  modalImageContainer.innerHTML = `
    <img src="${imageData.imageUrl}" alt="${imageData.originalName}" class="modal-image">
  `;
  
  modalImageInfo.innerHTML = `
    <h3>${imageData.userName}</h3>
    <p><strong>학년/반:</strong> ${imageData.grade}학년 ${imageData.classNumber}반</p>
    <p><strong>업로드 날짜:</strong> ${uploadDate}</p>
    <p><strong>파일명:</strong> ${imageData.originalName}</p>
    <p><strong>파일 크기:</strong> ${fileSize} MB</p>
    ${imageData.description ? `<p><strong>설명:</strong> ${imageData.description}</p>` : ''}
    <p><strong>이미지 URL:</strong> <span class="url-text">${imageData.imageUrl}</span></p>
  `;
  
  imageModal.style.display = 'block';
  document.body.style.overflow = 'hidden';
}

// 이미지 모달 닫기
function closeImageModal() {
  imageModal.style.display = 'none';
  document.body.style.overflow = 'auto';
  currentImageData = null;
}

// 이미지 삭제 처리
async function handleDeleteImage() {
  if (!currentImageData) return;
  
  if (!confirm(`${currentImageData.userName}님의 이미지를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
    return;
  }
  
  try {
    console.log('이미지 삭제 시작:', currentImageData.fileName);
    
    // Storage에서 이미지 파일 삭제
    await deleteImage(currentImageData.filePath);
    console.log('Storage에서 이미지 삭제 완료');
    
    // Firestore에서 이미지 데이터 삭제
    await deleteImageData(currentImageData.id);
    console.log('Firestore에서 데이터 삭제 완료');
    
    alert('이미지가 성공적으로 삭제되었습니다.');
    closeImageModal();
    
    // 목록 새로고침
    await loadImageList();
    
  } catch (error) {
    console.error('이미지 삭제 실패:', error);
    alert('이미지 삭제에 실패했습니다. 다시 시도해주세요.');
  }
}

// URL 복사 처리
function handleCopyUrl() {
  if (!currentImageData) return;
  
  navigator.clipboard.writeText(currentImageData.imageUrl).then(() => {
    alert('이미지 URL이 클립보드에 복사되었습니다.');
  }).catch(err => {
    console.error('URL 복사 실패:', err);
    // 대체 방법
    const textArea = document.createElement('textarea');
    textArea.value = currentImageData.imageUrl;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    alert('이미지 URL이 클립보드에 복사되었습니다.');
  });
}

// UI 상태 관리 함수들
function showLoading() {
  hideAllSections();
  loadingSection.style.display = 'block';
}

function hideLoading() {
  loadingSection.style.display = 'none';
}

function showImageList() {
  hideAllSections();
  imageListSection.style.display = 'block';
}

function showEmptyMessage() {
  hideAllSections();
  emptyMessage.style.display = 'block';
}

function showError(message) {
  hideAllSections();
  emptyMessage.innerHTML = `
    <p>${message}</p>
    <button onclick="location.reload()" class="refresh-button">다시 시도</button>
  `;
  emptyMessage.style.display = 'block';
}

function hideAllSections() {
  imageListSection.style.display = 'none';
  emptyMessage.style.display = 'none';
}
