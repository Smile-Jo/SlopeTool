// 이벤트 처리 관련 기능 모듈

// 컨트롤 영역에서 클릭 차단 여부 확인 함수
export function isInControlArea(x, y) {
  const controls = document.querySelector('.controls');
  const infoPanel = document.querySelector('.info-panel');
  
  if (controls) {
    const controlsRect = controls.getBoundingClientRect();
    if (x >= controlsRect.left && x <= controlsRect.right && 
        y >= controlsRect.top && y <= controlsRect.bottom) {
      return true;
    }
  }
  
  if (infoPanel) {
    const infoPanelRect = infoPanel.getBoundingClientRect();
    if (x >= infoPanelRect.left && x <= infoPanelRect.right && 
        y >= infoPanelRect.top && y <= infoPanelRect.bottom) {
      return true;
    }
  }
  
  // 각 버튼들을 개별적으로도 확인
  const buttons = document.querySelectorAll('button');
  for (let button of buttons) {
    const buttonRect = button.getBoundingClientRect();
    if (x >= buttonRect.left && x <= buttonRect.right && 
        y >= buttonRect.top && y <= buttonRect.bottom) {
      return true;
    }
  }
  
  return false;
}

// 터치 액션 처리
export function handleTouchAction(touchPoint, points, gridSize, addPointCallback, removePointCallback) {
  // 두 점이 이미 추가된 경우 더 이상 추가하지 않음
  if (points.length >= 2) return;

  const { touchX, touchY } = touchPoint;

  // 컨트롤 영역에서 터치된 경우 무시
  if (isInControlArea(touchX, touchY)) {
    return;
  }

  // 격자 점 크기 및 간격
  const tolerance = 20; // 모바일용 허용 오차

  // 터치 좌표를 근접한 격자 점으로 스냅
  const snappedX = Math.round(touchX / gridSize) * gridSize;
  const snappedY = Math.round(touchY / gridSize) * gridSize;
  
  console.log(`터치 좌표: (${touchX}, ${touchY}), 스냅된 좌표: (${snappedX}, ${snappedY}), 격자 크기: ${gridSize}`);

  // 터치 좌표가 격자 점과 충분히 가까운지 확인
  if (Math.abs(touchX - snappedX) <= tolerance && Math.abs(touchY - snappedY) <= tolerance) {
    const existingHighlight = document.querySelector(`.highlight[data-x="${snappedX}"][data-y="${snappedY}"]`);

    if (existingHighlight) {
      removePointCallback(snappedX, snappedY);
    } else {
      addPointCallback(snappedX, snappedY);
    }
  }
}

// 클릭 액션 처리
export function handleClickAction(event, points, gridSize, addPointCallback, removePointCallback) {
  // 두 점이 이미 추가된 경우 더 이상 추가하지 않음
  if (points.length >= 2) return;

  // 클릭된 위치 좌표 가져오기
  const clickX = event.clientX;
  const clickY = event.clientY;

  // 컨트롤 영역에서 클릭된 경우 무시
  if (isInControlArea(clickX, clickY)) {
    return;
  }

  // 격자 점 크기 및 간격
  const tolerance = 15; // 데스크톱용 허용 오차

  // 클릭 좌표를 근접한 격자 점으로 스냅
  const snappedX = Math.round(clickX / gridSize) * gridSize;
  const snappedY = Math.round(clickY / gridSize) * gridSize;

  console.log(`클릭 좌표: (${clickX}, ${clickY}), 스냅된 좌표: (${snappedX}, ${snappedY}), 격자 크기: ${gridSize}`);

  // 클릭 좌표가 격자 점과 충분히 가까운지 확인
  if (Math.abs(clickX - snappedX) <= tolerance && Math.abs(clickY - snappedY) <= tolerance) {
    const existingHighlight = document.querySelector(`.highlight[data-x="${snappedX}"][data-y="${snappedY}"]`);

    if (existingHighlight) {
      removePointCallback(snappedX, snappedY);
    } else {
      addPointCallback(snappedX, snappedY);
    }
  }
}
