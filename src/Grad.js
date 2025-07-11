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

// 페이지 로드 시 초기화
window.addEventListener('load', async () => {
  console.log('페이지 로드 완료');
  
  try {
    await startCamera();
    console.log('카메라 초기화 완료');
  } catch (error) {
    console.error('카메라 초기화 실패:', error);
  }
  
  initializeGrid();  // 격자 초기화 (격자점 계산 포함)
  setupEventListeners(); // 이벤트 리스너 설정
});

// 이벤트 리스너 설정 함수
function setupEventListeners() {
  console.log('이벤트 리스너 설정 중...');
  
  // 버튼 이벤트 리스너
  setupButtonEvents();
  
  // 터치/클릭 이벤트 리스너
  setupTouchEvents();
  
  console.log('이벤트 리스너 설정 완료');
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
      console.log('초기화 버튼 사용');
      e.stopPropagation();
      e.preventDefault();
      resetHighlights();
    });
  }

  // 삼각형 버튼
  if (buttons.triangle) {
    addButtonEventListeners(buttons.triangle, (e) => {
      console.log('삼각형 버튼 사용');
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
      console.log('거리 측정 버튼 사용');
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
      console.log('격자 증가 버튼 사용');
      e.stopPropagation();
      e.preventDefault();
      increaseGridSize(resetHighlights);
    });
  }

  // 격자 감소 버튼
  if (buttons.decreaseGrid) {
    addButtonEventListeners(buttons.decreaseGrid, (e) => {
      console.log('격자 감소 버튼 사용');
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
  // 터치 이벤트 (모바일)
  document.addEventListener('touchstart', handleTouch, { passive: false });
  document.addEventListener('touchmove', handleTouchMove, { passive: false });
  document.addEventListener('touchend', handleTouchEnd, { passive: false });
  
  // 클릭 이벤트 (데스크톱)
  document.addEventListener('click', handleClick);
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
