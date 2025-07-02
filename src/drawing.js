// 그리기 관련 기능 모듈

// 상태 변수들을 export로 내보내면서 수정 가능하도록 함수로 접근
let _points = [];
let _triangleCreated = false;

// 상태 접근자
export const state = {
  get points() { return _points; },
  get triangleCreated() { return _triangleCreated; },
  set triangleCreated(value) { _triangleCreated = value; }
};

// 점 추가 함수
export function addPoint(x, y) {
  console.log('점 추가:', x, y);
  
  const highlight = document.createElement('div');
  highlight.classList.add('highlight');
  highlight.style.position = 'absolute';
  highlight.style.width = '12px';
  highlight.style.height = '12px';
  highlight.style.backgroundColor = 'rgba(255, 0, 0, 0.9)';
  highlight.style.borderRadius = '50%';
  highlight.style.border = '2px solid white';
  highlight.style.boxShadow = '0 0 4px rgba(0,0,0,0.5)';
  highlight.style.top = `${y - 6}px`;
  highlight.style.left = `${x - 6}px`;
  highlight.style.pointerEvents = 'none';
  highlight.style.zIndex = '15';
  highlight.setAttribute('data-x', x);
  highlight.setAttribute('data-y', y);

  document.body.appendChild(highlight);
  _points.push({ x, y });

  if (_points.length === 2) {
    drawLine(_points[0], _points[1]);
  }
}

// 점 제거 함수
export function removePoint(x, y) {
  console.log('점 제거:', x, y);
  
  const existingHighlight = document.querySelector(`.highlight[data-x="${x}"][data-y="${y}"]`);
  if (existingHighlight) {
    existingHighlight.remove();
  }
  
  _points = _points.filter(point => point.x !== x || point.y !== y);
  
  // 선분도 제거
  const existingLines = document.querySelectorAll('.connection-line, div[style*="rgba(0, 0, 255"]');
  existingLines.forEach(line => line.remove());
  
  // 버튼 초기 상태로 복원
  resetButtonsToInitial();
}

// 선분 그리기
export function drawLine(point1, point2) {
  console.log('선분 그리기:', point1, point2);
  
  const line = document.createElement('div');
  line.classList.add('connection-line');
  line.style.position = 'absolute';
  line.style.backgroundColor = 'rgba(0, 0, 255, 0.8)';
  line.style.zIndex = '14';
  line.style.pointerEvents = 'none';

  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  line.style.width = `${length}px`;
  line.style.height = '3px';
  line.style.top = `${point1.y - 1.5}px`;
  line.style.left = `${point1.x}px`;
  line.style.transformOrigin = '0 50%';
  line.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`;
  
  console.log(`선분 위치: top=${point1.y - 1.5}, left=${point1.x}, 각도=${Math.atan2(dy, dx) * 180 / Math.PI}도`);
  
  document.body.appendChild(line);

  // 1단계: 초기화, 거리 측정, 캡쳐만 활성화
  document.getElementById('resetButton').style.display = 'block';
  document.getElementById('lengthButton').style.display = 'block';
  document.getElementById('triangleButton').style.display = 'none';
  document.getElementById('captureButton').style.display = 'block';
  document.getElementById('increaseGridButton').style.display = 'none';
  document.getElementById('decreaseGridButton').style.display = 'none';
}

// 삼각형 그리기
export function drawTriangle(point1, point2) {
  if (_triangleCreated) return;

  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;

  const triangle = document.createElement('div');
  triangle.style.position = 'absolute';
  triangle.style.width = '0';
  triangle.style.height = '0';
  triangle.style.borderStyle = 'none';
  triangle.style.zIndex = '13';
  triangle.style.pointerEvents = 'none';

  if (dx * dy >= 0) {
    triangle.style.borderRight = `${Math.abs(dx)}px solid transparent`;
    triangle.style.borderBottom = `${Math.abs(dy)}px solid rgba(0, 255, 0, 0.5)`;
    triangle.style.top = `${Math.min(point1.y, point2.y)}px`;
    triangle.style.left = `${Math.min(point1.x, point2.x)}px`;
  } else {
    triangle.style.borderLeft = `${Math.abs(dx)}px solid transparent`;
    triangle.style.borderBottom = `${Math.abs(dy)}px solid rgba(0, 255, 0, 0.5)`;
    triangle.style.top = `${Math.min(point1.y, point2.y)}px`;
    triangle.style.left = `${Math.min(point1.x, point2.x)}px`;
  }

  document.body.appendChild(triangle);

  // 삼각형의 밑변과 높이에 강조 선 추가
  drawBaseLine(point1, point2);
  drawHeightLine(point1, point2);

  _triangleCreated = true;

  // 3단계: 초기화, 캡쳐만 활성화
  document.getElementById('resetButton').style.display = 'block';
  document.getElementById('lengthButton').style.display = 'none';
  document.getElementById('triangleButton').style.display = 'none';
  document.getElementById('captureButton').style.display = 'block';
  document.getElementById('increaseGridButton').style.display = 'none';
  document.getElementById('decreaseGridButton').style.display = 'none';
}

// 밑변 선 그리기
function drawBaseLine(point1, point2) {
  const baseLine = document.createElement('div');
  baseLine.classList.add('base-line');
  baseLine.style.position = 'absolute';
  baseLine.style.backgroundColor = 'yellow';
  baseLine.style.zIndex = '14';
  baseLine.style.pointerEvents = 'none';

  const dx = point2.x - point1.x;
  const length = Math.abs(dx);

  baseLine.style.width = `${length}px`;
  baseLine.style.height = '3px';
  baseLine.style.top = `${Math.max(point1.y, point2.y)}px`;
  baseLine.style.left = `${Math.min(point1.x, point2.x)}px`;

  document.body.appendChild(baseLine);
}

// 높이 선 그리기
function drawHeightLine(point1, point2) {
  const heightLine = document.createElement('div');
  heightLine.classList.add('height-line');
  heightLine.style.position = 'absolute';
  heightLine.style.backgroundColor = 'red';
  heightLine.style.zIndex = '14';
  heightLine.style.pointerEvents = 'none';

  const dy = Math.abs(point2.y - point1.y);

  heightLine.style.width = '3px';
  heightLine.style.height = `${dy}px`;
  heightLine.style.top = `${Math.min(point1.y, point2.y)}px`;

  const lowerYPointX = point1.y < point2.y ? point1.x : point2.x;
  heightLine.style.left = `${lowerYPointX}px`;

  document.body.appendChild(heightLine);
}

// 전체 리셋
export function resetHighlights() {
  console.log('초기화 함수 실행');
  
  // 기존 요소들 제거
  document.querySelectorAll('.highlight, .triangle, .connection-line, .base-line, .height-line, div[style*="rgba(0, 255, 0, 0.5)"], div[style*="rgba(0, 0, 255"]').forEach(el => el.remove());
  
  _points.length = 0; // 배열 초기화
  _triangleCreated = false;

  const display = document.getElementById('dimensionDisplay');
  if (display) {
    display.style.display = 'none';
  }

  resetButtonsToInitial();
}

// 버튼 상태 관리
export function resetButtonsToInitial() {
  document.getElementById('resetButton').style.display = 'block';
  document.getElementById('lengthButton').style.display = 'none';
  document.getElementById('triangleButton').style.display = 'none';
  document.getElementById('captureButton').style.display = 'block';
  document.getElementById('increaseGridButton').style.display = 'block';
  document.getElementById('decreaseGridButton').style.display = 'block';
}

// 치수 표시
export function displayDimensions(point1, point2, gridSize) {
  const dx = Math.abs(point2.x - point1.x);
  const dy = Math.abs(point2.y - point1.y);

  const display = document.getElementById('dimensionDisplay');
  if (display) {
    display.innerHTML = `
      수평 거리: <span style="color: yellow;">${(dx / gridSize)}</span> 
      &nbsp;&nbsp; 수직 거리: <span style="color: red;">${(dy / gridSize)}</span>
    `;
    display.style.display = 'block';
  }

  // 2단계: 초기화, 삼각형 그리기, 캡쳐만 활성화
  document.getElementById('resetButton').style.display = 'block';
  document.getElementById('lengthButton').style.display = 'none';
  document.getElementById('triangleButton').style.display = 'block';
  document.getElementById('captureButton').style.display = 'block';
  document.getElementById('increaseGridButton').style.display = 'none';
  document.getElementById('decreaseGridButton').style.display = 'none';
}
