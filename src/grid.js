// 격자 관련 기능 모듈

export let gridSize = 50; // 초기 격자 크기
let _gridPoints = []; // 격자점 좌표 배열

// 격자점 배열 계산 함수
function calculateGridPoints() {
  _gridPoints = [];
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // 모든 격자점 좌표를 계산하여 배열에 저장
  for (let x = 0; x <= viewportWidth; x += gridSize) {
    for (let y = 0; y <= viewportHeight; y += gridSize) {
      _gridPoints.push({ x, y });
    }
  }

  console.log(`격자점 ${_gridPoints.length}개 계산 완료 (격자 크기: ${gridSize}px)`);
}

// 가장 가까운 격자점 찾기 함수
export function findNearestGridPoint(touchX, touchY) {
  if (_gridPoints.length === 0) {
    calculateGridPoints();
  }

  let nearestPoint = null;
  let minDistance = Infinity;

  for (const point of _gridPoints) {
    const distance = Math.sqrt(
      Math.pow(point.x - touchX, 2) + Math.pow(point.y - touchY, 2)
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      nearestPoint = point;
    }
  }

  console.log(`터치 지점: (${touchX}, ${touchY}), 가장 가까운 격자점: (${nearestPoint.x}, ${nearestPoint.y}), 거리: ${minDistance.toFixed(2)}px`);
  return nearestPoint;
}

// grid-overlay의 background-size 업데이트 함수
export function updateGridOverlay() {
  const gridOverlay = document.querySelector('.grid-overlay');
  if (gridOverlay) {
      gridOverlay.style.backgroundSize = `${gridSize}px ${gridSize}px`;
      gridOverlay.style.backgroundPosition = '0 0'; // 격자가 정확히 0,0에서 시작
  }
  
  // 격자 크기가 변경되면 격자점도 다시 계산
  calculateGridPoints();
}

// gridSize를 5px 증가시키는 함수
export function increaseGridSize(resetCallback) {
  resetCallback();  // 격자 크기 조정 전 초기화
  if (gridSize < 100) { // 100 이하로 제한
      gridSize += 5;
      updateGridOverlay();
  }
}

// gridSize를 5px 감소시키는 함수
export function decreaseGridSize(resetCallback) {
  resetCallback();  // 격자 크기 조정 전 초기화
  if (gridSize > 20) { // 20보다 크도록 제한
      gridSize -= 5;
      updateGridOverlay();
  }
}

// 초기 격자점 계산 (페이지 로드 시 호출)
export function initializeGrid() {
  updateGridOverlay();
  calculateGridPoints();
  
  // 윈도우 크기 변경 시 격자점 재계산
  window.addEventListener('resize', () => {
    calculateGridPoints();
  });
}
