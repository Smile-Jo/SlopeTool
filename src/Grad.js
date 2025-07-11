// 메인 기울기 측정 앱
import { startCamera } from './camera.js';
import { 
  state,
  addPoint, 
  removePoint, 
  drawTriangle, 
  resetHighlights, 
  displayDimensions 
} from './drawing.js';
import { gridSize, updateGridOverlay, increaseGridSize, decreaseGridSize, initializeGrid, setGridSize, getCurrentGridSize } from './grid.js';
import { handleTouchAction, handleClickAction, handlePinchStart, handlePinchMove, handlePinchEnd } from './events.js';

// 터치 이벤트 상태
let touchStartTime = 0;
let touchStartPoint = null;

// 카메라 상태 관리
let cameraInitialized = false;
let eventListenersAdded = false;

// 페이지 로드 시 초기화
window.addEventListener('load', async () => {
  initializeGrid();  // 격자 초기화 (격자점 계산 포함)
  setupButtonEvents(); // 버튼 이벤트만 먼저 설정
  
  try {
    await startCamera();
    cameraInitialized = true;
    setupTouchEvents(); // 카메라 성공 시에만 터치 이벤트 설정
  } catch (error) {
    console.error('카메라 초기화 실패:', error);
    cameraInitialized = false;
    // 카메라 실패 시 터치 이벤트는 설정하지 않음
  }
});

// 이벤트 리스너 설정 함수
function setupEventListeners() {
  // 버튼 이벤트 리스너
  setupButtonEvents();
  
  // 터치/클릭 이벤트 리스너 (카메라 성공 시에만)
  if (cameraInitialized) {
    setupTouchEvents();
  }
}

// 버튼 이벤트 설정
function setupButtonEvents() {
  const buttons = {
    reset: document.getElementById('resetButton'),
    triangle: document.getElementById('triangleButton'),
    length: document.getElementById('lengthButton'),
    increaseGrid: document.getElementById('increaseGridButton'),
    decreaseGrid: document.getElementById('decreaseGridButton')
  };

  // 초기화 버튼
  if (buttons.reset) {
    addButtonEventListeners(buttons.reset, (e) => {
      e.stopPropagation();
      e.preventDefault();
      resetHighlights();
    });
  }

  // 삼각형 버튼
  if (buttons.triangle) {
    addButtonEventListeners(buttons.triangle, (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (state.points.length >= 2) {
        drawTriangle(state.points[0], state.points[1]);
      }
    });
  }

  // 거리 측정 버튼
  if (buttons.length) {
    addButtonEventListeners(buttons.length, (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (state.points.length >= 2) {
        displayDimensions(state.points[0], state.points[1], gridSize);
      }
    });
  }

  // 격자 증가 버튼
  if (buttons.increaseGrid) {
    addButtonEventListeners(buttons.increaseGrid, (e) => {
      e.stopPropagation();
      e.preventDefault();
      increaseGridSize(resetHighlights);
    });
  }

  // 격자 감소 버튼
  if (buttons.decreaseGrid) {
    addButtonEventListeners(buttons.decreaseGrid, (e) => {
      e.stopPropagation();
      e.preventDefault();
      decreaseGridSize(resetHighlights);
    });
  }
}

// 버튼에 클릭과 터치 이벤트 모두 추가하는 헬퍼 함수
function addButtonEventListeners(button, handler) {
  button.addEventListener('click', handler);
  button.addEventListener('touchend', handler);
}

// 터치/클릭 이벤트 설정
function setupTouchEvents() {
  if (eventListenersAdded) {
    return; // 이미 추가된 경우 중복 방지
  }
  
  // 캔버스나 비디오 영역에만 이벤트 리스너 추가
  const targetElement = document.getElementById('overlay-canvas') || document.getElementById('video') || document;
  
  // 터치 이벤트 (모바일)
  targetElement.addEventListener('touchstart', handleTouch, { passive: false });
  targetElement.addEventListener('touchmove', handleTouchMove, { passive: false });
  targetElement.addEventListener('touchend', handleTouchEnd, { passive: false });
  
  // 클릭 이벤트 (데스크톱)
  targetElement.addEventListener('click', handleClick);
  
  eventListenersAdded = true;
}

// 터치 시작 처리
function handleTouch(event) {
  event.preventDefault();
  
  // 핀치 줌 처리
  if (event.touches.length === 2) {
    handlePinchStart(event, getCurrentGridSize);
    return;
  }
  
  // 단일 터치 처리
  touchStartTime = Date.now();
  
  const touch = event.touches[0];
  touchStartPoint = {
    touchX: touch.clientX,
    touchY: touch.clientY
  };
}

// 터치 이동 처리
function handleTouchMove(event) {
  // 핀치 줌 처리
  if (event.touches.length === 2) {
    handlePinchMove(event, (newSize) => {
      setGridSize(newSize, resetHighlights);
    });
  }
}

// 터치 종료 처리
function handleTouchEnd(event) {
  // 핀치 줌 종료 처리
  handlePinchEnd(event);
  
  const touchEndTime = Date.now();
  const touchDuration = touchEndTime - touchStartTime;
  
  // 짧은 단일 터치만 처리 (길게 누르거나 멀티터치면 무시)
  if (touchDuration < 300 && touchStartPoint && event.touches.length === 0) {
    handleTouchAction(touchStartPoint, state.points, gridSize, addPoint, removePoint);
  }
}

// 클릭 처리
function handleClick(event) {
  handleClickAction(event, state.points, gridSize, addPoint, removePoint);
}
