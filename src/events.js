// 이벤트 처리 관련 기능 모듈
import { isNearGridPoint } from './grid.js';

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
export function handleTouchAction(touchPoint, points, addPointCallback, removePointCallback) {
  // 두 점이 이미 추가된 경우 더 이상 추가하지 않음
  if (points.length >= 2) return;

  const { touchX, touchY } = touchPoint;

  // 컨트롤 영역에서 터치된 경우 무시
  if (isInControlArea(touchX, touchY)) {
    return;
  }

  // 터치 위치에서 가장 가까운 격자점 찾기 (모바일용 허용 오차: 30px)
  const nearestGridPoint = isNearGridPoint(touchX, touchY, 30);
  
  if (nearestGridPoint) {
    const { x: snappedX, y: snappedY } = nearestGridPoint;
    
    const existingHighlight = document.querySelector(`.highlight[data-x="${snappedX}"][data-y="${snappedY}"]`);

    if (existingHighlight) {
      removePointCallback(snappedX, snappedY);
    } else {
      addPointCallback(snappedX, snappedY);
    }
  }
}

// 클릭 액션 처리
export function handleClickAction(event, points, addPointCallback, removePointCallback) {
  // 두 점이 이미 추가된 경우 더 이상 추가하지 않음
  if (points.length >= 2) return;

  // 클릭된 위치 좌표 가져오기 (뷰포트 기준)
  const clickX = event.clientX;
  const clickY = event.clientY;

  // 컨트롤 영역에서 클릭된 경우 무시
  if (isInControlArea(clickX, clickY)) {
    return;
  }

  // 클릭 위치에서 가장 가까운 격자점 찾기 (데스크톱용 허용 오차: 25px)
  const nearestGridPoint = isNearGridPoint(clickX, clickY, 25);
  
  if (nearestGridPoint) {
    const { x: snappedX, y: snappedY } = nearestGridPoint;
    
    const existingHighlight = document.querySelector(`.highlight[data-x="${snappedX}"][data-y="${snappedY}"]`);

    if (existingHighlight) {
      removePointCallback(snappedX, snappedY);
    } else {
      addPointCallback(snappedX, snappedY);
    }
  }
}
