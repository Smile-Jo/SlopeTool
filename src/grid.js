// 격자 관련 기능 모듈

export let gridSize = 50; // 초기 격자 크기

// grid-overlay의 background-size 업데이트 함수
export function updateGridOverlay() {
  const gridOverlay = document.querySelector('.grid-overlay');
  if (gridOverlay) {
      gridOverlay.style.backgroundSize = `${gridSize}px ${gridSize}px`;
      gridOverlay.style.backgroundPosition = '0 0'; // 격자가 정확히 0,0에서 시작
  }
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

// 가장 가까운 격자점을 찾는 함수
export function findNearestGridPoint(x, y) {
  // 클릭/터치 위치에서 가장 가까운 격자점 좌표 계산
  // CSS 격자는 0,0에서 시작하므로 정확히 gridSize 간격으로 격자점이 위치
  const nearestX = Math.round(x / gridSize) * gridSize;
  const nearestY = Math.round(y / gridSize) * gridSize;
  
  return { x: nearestX, y: nearestY };
}

// 두 점 사이의 거리 계산
export function calculateDistance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// 클릭/터치 위치가 격자점에 충분히 가까운지 확인
export function isNearGridPoint(clickX, clickY, tolerance = 25) {
  const nearest = findNearestGridPoint(clickX, clickY);
  const distance = calculateDistance(clickX, clickY, nearest.x, nearest.y);
  return distance <= tolerance ? nearest : null;
}
