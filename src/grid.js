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
