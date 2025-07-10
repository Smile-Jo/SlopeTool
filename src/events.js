// 이벤트 처리 관련 기능 모듈
import { findNearestGridPoint } from './grid.js';

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

  // 허용 오차 설정 (터치 지점과 격자점 사이의 최대 거리)
  const tolerance = 35; // 모바일용 허용 오차

  // 가장 가까운 격자점 찾기
  const nearestGridPoint = findNearestGridPoint(touchX, touchY);
  
  if (!nearestGridPoint) {
    console.log('가장 가까운 격자점을 찾을 수 없습니다.');
    return;
  }

  // 터치 지점과 격자점 사이의 거리 계산
  const distance = Math.sqrt(
    Math.pow(touchX - nearestGridPoint.x, 2) + Math.pow(touchY - nearestGridPoint.y, 2)
  );

  // 허용 오차 내에 있는지 확인
  if (distance <= tolerance) {
    const existingHighlight = document.querySelector(`.highlight[data-x="${nearestGridPoint.x}"][data-y="${nearestGridPoint.y}"]`);

    if (existingHighlight) {
      removePointCallback(nearestGridPoint.x, nearestGridPoint.y);
    } else {
      addPointCallback(nearestGridPoint.x, nearestGridPoint.y);
    }
  } else {
    console.log(`터치 지점이 격자점에서 너무 멀리 떨어져 있습니다. 거리: ${distance.toFixed(2)}px`);
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

  // 허용 오차 설정 (클릭 지점과 격자점 사이의 최대 거리)
  const tolerance = 25; // 데스크톱용 허용 오차

  // 가장 가까운 격자점 찾기
  const nearestGridPoint = findNearestGridPoint(clickX, clickY);
  
  if (!nearestGridPoint) {
    console.log('가장 가까운 격자점을 찾을 수 없습니다.');
    return;
  }

  // 클릭 지점과 격자점 사이의 거리 계산
  const distance = Math.sqrt(
    Math.pow(clickX - nearestGridPoint.x, 2) + Math.pow(clickY - nearestGridPoint.y, 2)
  );

  // 허용 오차 내에 있는지 확인
  if (distance <= tolerance) {
    const existingHighlight = document.querySelector(`.highlight[data-x="${nearestGridPoint.x}"][data-y="${nearestGridPoint.y}"]`);

    if (existingHighlight) {
      removePointCallback(nearestGridPoint.x, nearestGridPoint.y);
    } else {
      addPointCallback(nearestGridPoint.x, nearestGridPoint.y);
    }
  } else {
    console.log(`클릭 지점이 격자점에서 너무 멀리 떨어져 있습니다. 거리: ${distance.toFixed(2)}px`);
  }
}
