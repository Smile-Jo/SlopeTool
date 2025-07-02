let points = []; // 터치된 점들을 저장
let triangleCreated = false; // 삼각형 생성 여부 추적
let gridSize = 50; // 초기 격자 크기

// 카메라 시작
async function startCamera() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');

    // 후면 카메라 중 첫 번째 장치를 선택
    const backCamera = videoDevices.find(device => device.label.toLowerCase().includes('back')) || videoDevices[0];

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: backCamera.deviceId,
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        facingMode: { exact: "environment" }
      }
    });

    const videoElement = document.getElementById('video');
    videoElement.srcObject = stream;
  } catch (error) {
    console.error('Error accessing camera:', error);
  }
}

// 페이지 로드 시 카메라 시작
window.addEventListener('load', () => {
  startCamera();
  updateGridOverlay();  // 초기 그리드 적용
});

// grid-overlay의 background-size 업데이트 함수
function updateGridOverlay() {
  const gridOverlay = document.querySelector('.grid-overlay');
  if (gridOverlay) {
      gridOverlay.style.backgroundSize = `${gridSize}px ${gridSize}px`;
  }
}

// gridSize를 5px 증가시키는 함수
function increaseGridSize() {
  resetHighlights();  // 격자 크기 조정 전 초기화
  if (gridSize < 100) { // 100 이하로 제한
      gridSize += 5;
      updateGridOverlay();
  }
}

// gridSize를 5px 감소시키는 함수
function decreaseGridSize() {
  resetHighlights();  // 격자 크기 조정 전 초기화
  if (gridSize > 20) { // 20보다 크도록 제한
      gridSize -= 5;
      updateGridOverlay();
  }
}

// 화면에 터치 이벤트 리스너 추가
document.addEventListener('touchstart', handleTouch);

function handleTouch(event) {
  // 두 점이 이미 추가된 경우 더 이상 추가하지 않음
  if (points.length >= 2) return;

  // 터치된 위치 좌표 가져오기
  const touch = event.touches[0];
  const touchX = touch.clientX;
  const touchY = touch.clientY;

  // 격자 점 크기 및 간격
  const tolerance = 20; // 터치 좌표와 격자 점 사이의 허용 오차

  // 터치 좌표를 근접한 격자 점으로 스냅
  const snappedX = Math.round(touchX / gridSize) * gridSize ;
  const snappedY = Math.round(touchY / gridSize) * gridSize ;

  // 터치 좌표가 격자 점과 충분히 가까운지 확인
  if (Math.abs(touchX - snappedX) <= tolerance && Math.abs(touchY - snappedY) <= tolerance) {
    const existingHighlight = document.querySelector(`.highlight[data-x="${snappedX}"][data-y="${snappedY}"]`);

    if (existingHighlight) {
      // 이미 강조 표시가 있으면 제거하고 points 배열에서도 제거
      existingHighlight.remove();
      points = points.filter(point => point.x !== snappedX || point.y !== snappedY);
    } else {
      // 강조 표시 요소 생성
      const highlight = document.createElement('div');
      highlight.classList.add('highlight');
      highlight.style.position = 'absolute';
      highlight.style.width = '20px';
      highlight.style.height = '20px';
      highlight.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
      highlight.style.borderRadius = '50%';
      highlight.style.top = `${snappedY - 9.5}px`;
      highlight.style.left = `${snappedX - 9.5}px`;
      highlight.style.pointerEvents = 'none'; 
      highlight.style.zIndex = '15';
      highlight.setAttribute('data-x', snappedX);
      highlight.setAttribute('data-y', snappedY);

      // 강조 표시 요소를 바디에 추가
      document.body.appendChild(highlight);

      // points 배열에 추가
      points.push({ x: snappedX, y: snappedY });

      // 두 점이 모두 추가되면 선분을 그리기
      if (points.length === 2) {
        drawLine(points[0], points[1]);
      }
    }
  }
}

function drawLine(point1, point2) {
  const line = document.createElement('div');
  line.style.position = 'absolute';
  line.style.backgroundColor = 'rgba(0, 0, 255, 0.7)'; // 파란색 반투명
  line.style.zIndex = '14'; // 강조 표시 아래
  line.style.pointerEvents = 'none';

  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  line.style.width = `${length}px`;
  line.style.height = '3px';
  line.style.top = `${point1.y}px`;
  line.style.left = `${point1.x}px`;
  line.style.transformOrigin = '0 0';
  line.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`;
  document.body.appendChild(line);

  // 선분이 그려진 후 triangleButton을 표시
  document.getElementById('triangleButton').style.display = 'block';
}

function drawTriangle(point1, point2) {
  if (triangleCreated) return; // 삼각형이 이미 생성되었으면 더 이상 생성하지 않음

  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;

  const triangle = document.createElement('div');
  triangle.style.position = 'absolute';
  triangle.style.width = '0';
  triangle.style.height = '0';
  triangle.style.borderStyle = 'none';
  triangle.style.zIndex = '13'; // 선분 아래
  triangle.style.pointerEvents = 'none';

  if (dx * dy >= 0) {
    triangle.style.borderRight = `${Math.abs(dx)}px solid transparent`;
    triangle.style.borderBottom = `${Math.abs(dy)}px solid rgba(0, 255, 0, 0.5)`; // 초록색 반투명
    triangle.style.top = `${Math.min(point1.y, point2.y)}px`;
    triangle.style.left = `${Math.min(point1.x, point2.x)}px`;
  } else {
    triangle.style.borderLeft = `${Math.abs(dx)}px solid transparent`;
    triangle.style.borderBottom = `${Math.abs(dy)}px solid rgba(0, 255, 0, 0.5)`; // 초록색 반투명
    triangle.style.top = `${Math.min(point1.y, point2.y)}px`;
    triangle.style.left = `${Math.min(point1.x, point2.x)}px`;
  }

  document.body.appendChild(triangle);

  // 삼각형의 밑변과 높이에 강조 선 추가
  drawBaseLine(point1, point2);
  drawHeightLine(point1, point2);

  triangleCreated = true; // 삼각형이 생성되었음을 표시

  // 삼각형이 그려진 후 lengthButton을 표시
  document.getElementById('lengthButton').style.display = 'block';
}

function drawBaseLine(point1, point2) {
  const baseLine = document.createElement('div');
  baseLine.classList.add('base-line'); // 클래스 추가
  baseLine.style.position = 'absolute';
  baseLine.style.backgroundColor = 'yellow'; // 노란색 선
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

function drawHeightLine(point1, point2) {
  const heightLine = document.createElement('div');
  heightLine.classList.add('height-line'); // 클래스 추가
  heightLine.style.position = 'absolute';
  heightLine.style.backgroundColor = 'red'; // 빨간색 선
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

function displayDimensions(point1, point2) {
  const dx = Math.abs(point2.x - point1.x);
  const dy = Math.abs(point2.y - point1.y);

  const display = document.getElementById('dimensionDisplay');
  if (display) {
    // 수평 거리와 수직 거리 각각을 span으로 스타일링
    display.innerHTML = `
      수평 거리: <span style="color: yellow;">${(dx / gridSize)}</span> 
      &nbsp;&nbsp; 수직 거리: <span style="color: red;">${(dy / gridSize)}</span>
    `;
    display.style.display = 'block'; // 요소를 표시
  }
}


// 화면에서 video 요소만 캡처
function captureScreenshot() {
  const videoElement = document.getElementById('video');

  html2canvas(videoElement, {
    scale: window.devicePixelRatio,
    useCORS: true
  }).then(canvas => {
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'video_screenshot.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }).catch(error => {
    console.error('Screenshot capture failed:', error);
  });
}


// 초기화, 직각삼각형, 길이 버튼 클릭 이벤트 리스너 추가
document.getElementById('resetButton').addEventListener('click', resetHighlights);
document.getElementById('triangleButton').addEventListener('click', () => drawTriangle(points[0], points[1]));
document.getElementById('lengthButton').addEventListener('click', () => displayDimensions(points[0], points[1]));
document.getElementById('captureButton').addEventListener('click', captureScreenshot);
document.getElementById('increaseGridButton').addEventListener('click', increaseGridSize);
document.getElementById('decreaseGridButton').addEventListener('click', decreaseGridSize);

function resetHighlights() {
  // 기존 요소들 제거
  document.querySelectorAll('.highlight, .triangle, div[style*="rgba(0, 255, 0, 0.5)"], div[style*="rgba(0, 0, 255, 0.7)"], .base-line, .height-line').forEach(el => el.remove());
  
  points = [];
  triangleCreated = false; // 초기화 시 삼각형 생성 상태도 리셋

  const display = document.getElementById('dimensionDisplay');
  if (display) {
    display.style.display = 'none';
  }

  // 버튼 초기 상태로 숨김
  document.getElementById('triangleButton').style.display = 'none';
  document.getElementById('lengthButton').style.display = 'none';
}