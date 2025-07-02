let points = []; // 터치된 점들을 저장
let triangleCreated = false; // 삼각형 생성 여부 추적
let gridSize = 50; // 초기 격자 크기

// 카메라 시작 - 후면 카메라 우선순위로 수정
async function startCamera() {
  try {
    let stream;
    
    try {
      // 1차 시도: facingMode만 사용 (ideal로 변경)
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" }, // exact 대신 ideal 사용
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      console.log('후면 카메라 연결 성공 (facingMode)');
    } catch (error) {
      console.log('1차 시도 실패, 디바이스 목록으로 시도 중...', error);
      
      try {
        // 2차 시도: 기기 목록을 통한 후면 카메라 선택
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        console.log('사용 가능한 카메라 목록:', videoDevices);

        // 후면 카메라 찾기 (더 다양한 키워드로 검색)
        const backCamera = videoDevices.find(device => {
          const label = device.label.toLowerCase();
          return label.includes('back') || 
                 label.includes('rear') || 
                 label.includes('environment') ||
                 label.includes('0') || // 보통 첫 번째가 후면
                 !label.includes('front') && !label.includes('user'); // 전면이 아닌 것
        }) || videoDevices[0]; // 찾지 못하면 첫 번째 카메라

        if (backCamera && backCamera.deviceId) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: { exact: backCamera.deviceId },
              width: { ideal: 1920 },
              height: { ideal: 1080 }
            }
          });
          console.log('후면 카메라 연결 성공 (deviceId):', backCamera.label);
        } else {
          throw new Error('후면 카메라를 찾을 수 없습니다');
        }
      } catch (error2) {
        console.log('2차 시도 실패, 기본 카메라 사용...', error2);
        
        // 3차 시도: 최소한의 설정으로 카메라 접근
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        });
        console.log('기본 카메라 연결 성공');
      }
    }

    const videoElement = document.getElementById('video');
    videoElement.srcObject = stream;
    
    // 카메라 정보 로그
    const track = stream.getVideoTracks()[0];
    const settings = track.getSettings();
    console.log('현재 카메라 설정:', settings);
    console.log('카메라 라벨:', track.label);
    
  } catch (error) {
    console.error('Error accessing camera:', error);
    alert('카메라에 접근할 수 없습니다. 브라우저 설정을 확인해주세요.');
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

// 컨트롤 영역에서 클릭 차단 여부 확인 함수
function isInControlArea(x, y) {
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

// 터치 이벤트 리스너 - 터치 유지되도록 수정
document.addEventListener('touchstart', handleTouch, { passive: false });
// 마우스 클릭 이벤트 리스너 추가 (데스크톱 지원)
document.addEventListener('click', handleClick);

function handleTouch(event) {
  // 기본 터치 동작 방지 (스크롤, 줌 등)
  event.preventDefault();
  
  // 두 점이 이미 추가된 경우 더 이상 추가하지 않음
  if (points.length >= 2) return;

  // 터치된 위치 좌표 가져오기
  const touch = event.touches[0];
  const touchX = touch.clientX;
  const touchY = touch.clientY;

  // 컨트롤 영역에서 터치된 경우 무시
  if (isInControlArea(touchX, touchY)) {
    return;
  }

  // 격자 점 크기 및 간격
  const tolerance = 30; // 터치 좌표와 격자 점 사이의 허용 오차 (모바일용 증가)

  // 터치 좌표를 근접한 격자 점으로 스냅
  const snappedX = Math.round(touchX / gridSize) * gridSize;
  const snappedY = Math.round(touchY / gridSize) * gridSize;

  // 터치 좌표가 격자 점과 충분히 가까운지 확인
  if (Math.abs(touchX - snappedX) <= tolerance && Math.abs(touchY - snappedY) <= tolerance) {
    const existingHighlight = document.querySelector(`.highlight[data-x="${snappedX}"][data-y="${snappedY}"]`);

    if (existingHighlight) {
      // 이미 강조 표시가 있으면 제거하고 points 배열에서도 제거
      existingHighlight.remove();
      points = points.filter(point => point.x !== snappedX || point.y !== snappedY);
      
      // 선분도 제거
      const existingLine = document.querySelector('div[style*="rgba(0, 0, 255, 0.7)"]');
      if (existingLine) {
        existingLine.remove();
      }
      
      // 버튼 초기 상태로 복원
      resetButtonsToInitial();
    } else {
      // 강조 표시 요소 생성 (모바일 터치용 크기 증가)
      const highlight = document.createElement('div');
      highlight.classList.add('highlight');
      highlight.style.position = 'absolute';
      highlight.style.width = '25px'; // 터치용 크기 증가
      highlight.style.height = '25px';
      highlight.style.backgroundColor = 'rgba(255, 0, 0, 0.8)'; // 약간 더 불투명하게
      highlight.style.borderRadius = '50%';
      highlight.style.border = '2px solid white'; // 경계선 추가로 가시성 향상
      highlight.style.top = `${snappedY - 12.5}px`;
      highlight.style.left = `${snappedX - 12.5}px`;
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

function handleClick(event) {
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
  const tolerance = 20; // 클릭 좌표와 격자 점 사이의 허용 오차

  // 클릭 좌표를 근접한 격자 점으로 스냅
  const snappedX = Math.round(clickX / gridSize) * gridSize;
  const snappedY = Math.round(clickY / gridSize) * gridSize;

  // 클릭 좌표가 격자 점과 충분히 가까운지 확인
  if (Math.abs(clickX - snappedX) <= tolerance && Math.abs(clickY - snappedY) <= tolerance) {
    const existingHighlight = document.querySelector(`.highlight[data-x="${snappedX}"][data-y="${snappedY}"]`);

    if (existingHighlight) {
      // 이미 강조 표시가 있으면 제거하고 points 배열에서도 제거
      existingHighlight.remove();
      points = points.filter(point => point.x !== snappedX || point.y !== snappedY);
      
      // 선분도 제거
      const existingLine = document.querySelector('div[style*="rgba(0, 0, 255, 0.7)"]');
      if (existingLine) {
        existingLine.remove();
      }
      
      // 버튼 초기 상태로 복원
      resetButtonsToInitial();
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

  // 1단계: 초기화, 거리 측정, 캡쳐만 활성화
  document.getElementById('resetButton').style.display = 'block';
  document.getElementById('lengthButton').style.display = 'block';
  document.getElementById('triangleButton').style.display = 'none';
  document.getElementById('captureButton').style.display = 'block';
  document.getElementById('increaseGridButton').style.display = 'none';
  document.getElementById('decreaseGridButton').style.display = 'none';
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

  // 3단계: 초기화, 캡쳐만 활성화
  document.getElementById('resetButton').style.display = 'block';
  document.getElementById('lengthButton').style.display = 'none';
  document.getElementById('triangleButton').style.display = 'none';
  document.getElementById('captureButton').style.display = 'block';
  document.getElementById('increaseGridButton').style.display = 'none';
  document.getElementById('decreaseGridButton').style.display = 'none';
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

  // 2단계: 초기화, 삼각형 그리기, 캡쳐만 활성화
  document.getElementById('resetButton').style.display = 'block';
  document.getElementById('lengthButton').style.display = 'none';
  document.getElementById('triangleButton').style.display = 'block';
  document.getElementById('captureButton').style.display = 'block';
  document.getElementById('increaseGridButton').style.display = 'none';
  document.getElementById('decreaseGridButton').style.display = 'none';
}

// 전체 화면 캡처
function captureScreenshot(event) {
  // 이벤트 전파 방지
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }
  
  // 전체 body 요소를 캡처
  html2canvas(document.body, {
    allowTaint: true,
    useCORS: true,
    scale: 1,
    width: window.innerWidth,
    height: window.innerHeight,
    scrollX: 0,
    scrollY: 0,
    backgroundColor: '#000000',
    foreignObjectRendering: true,
    logging: false
  }).then(canvas => {
    const dataURL = canvas.toDataURL('image/png', 1.0);
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = `slope_capture_${new Date().getTime()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log('캡쳐 완료');
  }).catch(error => {
    console.error('Screenshot capture failed:', error);
    // 대안: Canvas API 사용
    fallbackCapture();
  });
}

// 대안 캡쳐 방법
function fallbackCapture() {
  try {
    // video 요소 직접 캡쳐
    const videoElement = document.getElementById('video');
    if (videoElement && videoElement.videoWidth > 0) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      
      ctx.drawImage(videoElement, 0, 0);
      
      const dataURL = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = `video_capture_${new Date().getTime()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log('비디오 캡쳐 완료');
    } else {
      alert('캡쳐할 수 있는 비디오가 없습니다.');
    }
  } catch (error) {
    console.error('Fallback capture failed:', error);
    alert('캡쳐에 실패했습니다.');
  }
}

// 초기화, 직각삼각형, 길이 버튼 클릭 이벤트 리스너 추가
document.getElementById('resetButton').addEventListener('click', (e) => {
  e.stopPropagation();
  e.preventDefault();
  resetHighlights();
});

document.getElementById('triangleButton').addEventListener('click', (e) => {
  e.stopPropagation();
  e.preventDefault();
  drawTriangle(points[0], points[1]);
});

document.getElementById('lengthButton').addEventListener('click', (e) => {
  e.stopPropagation();
  e.preventDefault();
  displayDimensions(points[0], points[1]);
});

document.getElementById('captureButton').addEventListener('click', captureScreenshot);

document.getElementById('increaseGridButton').addEventListener('click', (e) => {
  e.stopPropagation();
  e.preventDefault();
  increaseGridSize();
});

document.getElementById('decreaseGridButton').addEventListener('click', (e) => {
  e.stopPropagation();
  e.preventDefault();
  decreaseGridSize();
});

function resetHighlights() {
  // 기존 요소들 제거
  document.querySelectorAll('.highlight, .triangle, div[style*="rgba(0, 255, 0, 0.5)"], div[style*="rgba(0, 0, 255, 0.7)"], .base-line, .height-line').forEach(el => el.remove());
  
  points = [];
  triangleCreated = false; // 초기화 시 삼각형 생성 상태도 리셋

  const display = document.getElementById('dimensionDisplay');
  if (display) {
    display.style.display = 'none';
  }

  // 버튼 초기 상태로 복원
  resetButtonsToInitial();
}

// 버튼 상태 관리 함수들
function resetButtonsToInitial() {
  // 초기 상태: 모든 버튼 표시
  document.getElementById('resetButton').style.display = 'block';
  document.getElementById('lengthButton').style.display = 'none';
  document.getElementById('triangleButton').style.display = 'none';
  document.getElementById('captureButton').style.display = 'block';
  document.getElementById('increaseGridButton').style.display = 'block';
  document.getElementById('decreaseGridButton').style.display = 'block';
}