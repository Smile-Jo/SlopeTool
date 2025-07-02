let points = []; // 터치된 점들을 저장
let triangleCreated = false; // 삼각형 생성 여부 추적
let gridSize = 50; // 초기 격자 크기

// 카메라 시작 - 모바일 최적화
async function startCamera() {
  try {
    let stream;
    
    // 모바일 디바이스 확인
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    console.log('모바일 디바이스:', isMobile);
    
    // 사용자 미디어 지원 확인
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('이 브라우저는 카메라 기능을 지원하지 않습니다.');
    }
    
    try {
      // 1차 시도: 모바일에서 후면 카메라 강제 설정
      const constraints = {
        video: {
          facingMode: { exact: "environment" },
          width: { ideal: isMobile ? 1280 : 1920 },
          height: { ideal: isMobile ? 720 : 1080 }
        }
      };
      
      stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('후면 카메라 연결 성공 (exact environment)');
    } catch (error) {
      console.log('1차 시도 실패, 2차 시도 중...', error);
      
      try {
        // 2차 시도: ideal 모드로 시도
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: isMobile ? 1280 : 1920 },
            height: { ideal: isMobile ? 720 : 1080 }
          }
        });
        console.log('후면 카메라 연결 성공 (ideal environment)');
      } catch (error2) {
        console.log('2차 시도 실패, 디바이스 목록으로 시도 중...', error2);
        
        try {
          // 3차 시도: 기기 목록을 통한 후면 카메라 선택
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoDevices = devices.filter(device => device.kind === 'videoinput');
          console.log('사용 가능한 카메라 목록:', videoDevices);

          // 후면 카메라 찾기 (더 다양한 키워드로 검색)
          const backCamera = videoDevices.find(device => {
            const label = device.label.toLowerCase();
            return label.includes('back') || 
                   label.includes('rear') || 
                   label.includes('environment') ||
                   label.includes('camera2') ||
                   label.includes('0') ||
                   (!label.includes('front') && !label.includes('user') && !label.includes('facing'));
          }) || videoDevices[videoDevices.length - 1]; // 마지막 카메라 시도

          if (backCamera && backCamera.deviceId) {
            stream = await navigator.mediaDevices.getUserMedia({
              video: {
                deviceId: { exact: backCamera.deviceId },
                width: { ideal: isMobile ? 1280 : 1920 },
                height: { ideal: isMobile ? 720 : 1080 }
              }
            });
            console.log('후면 카메라 연결 성공 (deviceId):', backCamera.label);
          } else {
            throw new Error('후면 카메라를 찾을 수 없습니다');
          }
        } catch (error3) {
          console.log('3차 시도 실패, 기본 카메라 사용...', error3);
          
          // 4차 시도: 최소한의 설정으로 카메라 접근
          stream = await navigator.mediaDevices.getUserMedia({
            video: true
          });
          console.log('기본 카메라 연결 성공');
        }
      }
    }

    const videoElement = document.getElementById('video');
    if (videoElement) {
      videoElement.srcObject = stream;
      
      // 모바일 자동재생을 위한 속성 설정
      videoElement.setAttribute('playsinline', 'true');
      videoElement.setAttribute('autoplay', 'true');
      videoElement.setAttribute('muted', 'true');
      videoElement.muted = true; // 음소거로 자동재생 허용
      
      // 비디오 로드 완료를 기다린 후 재생 시도
      return new Promise((resolve, reject) => {
        const playVideo = async () => {
          try {
            await videoElement.play();
            console.log('비디오 재생 성공');
            resolve();
          } catch (e) {
            console.warn('비디오 자동 재생 실패 (사용자 상호작용 필요):', e);
            // 사용자 상호작용 후 재시도
            const userInteractionHandler = async () => {
              try {
                await videoElement.play();
                console.log('사용자 상호작용 후 비디오 재생 성공');
                resolve();
              } catch (retryError) {
                console.error('사용자 상호작용 후에도 재생 실패:', retryError);
                reject(retryError);
              }
            };

            document.body.addEventListener('touchstart', userInteractionHandler, { once: true });
            document.body.addEventListener('click', userInteractionHandler, { once: true });
          }
        };

        videoElement.addEventListener('loadedmetadata', () => {
          console.log('비디오 메타데이터 로드 완료');
          console.log('비디오 크기:', videoElement.videoWidth, 'x', videoElement.videoHeight);
          playVideo();
        }, { once: true });

        videoElement.addEventListener('canplay', () => {
          console.log('비디오 재생 준비 완료');
          playVideo();
        }, { once: true });

        // 즉시 재생 시도 (이미 로드된 경우를 위해)
        if (videoElement.readyState >= 3) { // HAVE_FUTURE_DATA
          playVideo();
        }
      });
    }
    
    // 카메라 정보 로그
    const track = stream.getVideoTracks()[0];
    if (track) {
      const settings = track.getSettings();
      console.log('현재 카메라 설정:', settings);
      console.log('카메라 라벨:', track.label);
      console.log('카메라 facing mode:', settings.facingMode);
    }
    
  } catch (error) {
    console.error('Error accessing camera:', error);
    alert('카메라에 접근할 수 없습니다. 브라우저 설정을 확인하고 카메라 권한을 허용해주세요.\n\n오류: ' + error.message);
  }
}

// 페이지 로드 시 카메라 시작 및 이벤트 리스너 등록
window.addEventListener('load', async () => {
  console.log('페이지 로드 완료');
  
  try {
    await startCamera();
    console.log('카메라 초기화 완료');
  } catch (error) {
    console.error('카메라 초기화 실패:', error);
  }
  
  updateGridOverlay();  // 초기 그리드 적용
  setupEventListeners(); // 이벤트 리스너 설정
});

// 이벤트 리스너 설정 함수
function setupEventListeners() {
  console.log('이벤트 리스너 설정 중...');
  
  // 각 버튼이 존재하는지 확인 후 이벤트 리스너 추가
  const resetButton = document.getElementById('resetButton');
  const triangleButton = document.getElementById('triangleButton');
  const lengthButton = document.getElementById('lengthButton');
  const captureButton = document.getElementById('captureButton');
  const increaseGridButton = document.getElementById('increaseGridButton');
  const decreaseGridButton = document.getElementById('decreaseGridButton');

  if (resetButton) {
    resetButton.addEventListener('click', (e) => {
      console.log('초기화 버튼 클릭');
      e.stopPropagation();
      e.preventDefault();
      resetHighlights();
    });
    resetButton.addEventListener('touchend', (e) => {
      console.log('초기화 버튼 터치');
      e.stopPropagation();
      e.preventDefault();
      resetHighlights();
    });
  }

  if (triangleButton) {
    triangleButton.addEventListener('click', (e) => {
      console.log('삼각형 버튼 클릭');
      e.stopPropagation();
      e.preventDefault();
      if (points.length >= 2) {
        drawTriangle(points[0], points[1]);
      }
    });
    triangleButton.addEventListener('touchend', (e) => {
      console.log('삼각형 버튼 터치');
      e.stopPropagation();
      e.preventDefault();
      if (points.length >= 2) {
        drawTriangle(points[0], points[1]);
      }
    });
  }

  if (lengthButton) {
    lengthButton.addEventListener('click', (e) => {
      console.log('거리 측정 버튼 클릭');
      e.stopPropagation();
      e.preventDefault();
      if (points.length >= 2) {
        displayDimensions(points[0], points[1]);
      }
    });
    lengthButton.addEventListener('touchend', (e) => {
      console.log('거리 측정 버튼 터치');
      e.stopPropagation();
      e.preventDefault();
      if (points.length >= 2) {
        displayDimensions(points[0], points[1]);
      }
    });
  }

  if (captureButton) {
    captureButton.addEventListener('click', (e) => {
      console.log('캡쳐 버튼 클릭');
      e.stopPropagation();
      e.preventDefault();
      captureScreenshot(e);
    });
    captureButton.addEventListener('touchend', (e) => {
      console.log('캡쳐 버튼 터치');
      e.stopPropagation();
      e.preventDefault();
      captureScreenshot(e);
    });
  }

  if (increaseGridButton) {
    increaseGridButton.addEventListener('click', (e) => {
      console.log('격자 증가 버튼 클릭');
      e.stopPropagation();
      e.preventDefault();
      increaseGridSize();
    });
    increaseGridButton.addEventListener('touchend', (e) => {
      console.log('격자 증가 버튼 터치');
      e.stopPropagation();
      e.preventDefault();
      increaseGridSize();
    });
  }

  if (decreaseGridButton) {
    decreaseGridButton.addEventListener('click', (e) => {
      console.log('격자 감소 버튼 클릭');
      e.stopPropagation();
      e.preventDefault();
      decreaseGridSize();
    });
    decreaseGridButton.addEventListener('touchend', (e) => {
      console.log('격자 감소 버튼 터치');
      e.stopPropagation();
      e.preventDefault();
      decreaseGridSize();
    });
  }

  console.log('이벤트 리스너 설정 완료');
}

// grid-overlay의 background-size 업데이트 함수
function updateGridOverlay() {
  const gridOverlay = document.querySelector('.grid-overlay');
  if (gridOverlay) {
      gridOverlay.style.backgroundSize = `${gridSize}px ${gridSize}px`;
      gridOverlay.style.backgroundPosition = '0 0'; // 격자가 정확히 0,0에서 시작
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

// 터치 이벤트 리스너 - 모바일 최적화
document.addEventListener('touchstart', handleTouch, { passive: false });
document.addEventListener('touchend', handleTouchEnd, { passive: false });
// 마우스 클릭 이벤트 리스너 추가 (데스크톱 지원)
document.addEventListener('click', handleClick);

let touchStartTime = 0;
let touchStartPoint = null;

function handleTouchEnd(event) {
  const touchEndTime = Date.now();
  const touchDuration = touchEndTime - touchStartTime;
  
  // 짧은 터치만 처리 (길게 누르면 무시)
  if (touchDuration < 300 && touchStartPoint) {
    handleTouchAction(touchStartPoint);
  }
}

function handleTouchAction(touchPoint) {
  // 두 점이 이미 추가된 경우 더 이상 추가하지 않음
  if (points.length >= 2) return;

  const { touchX, touchY } = touchPoint;

  // 컨트롤 영역에서 터치된 경우 무시
  if (isInControlArea(touchX, touchY)) {
    return;
  }

  // 격자 점 크기 및 간격
  const tolerance = 20; // 모바일용 허용 오차 줄임

  // 터치 좌표를 근접한 격자 점으로 스냅
  const snappedX = Math.round(touchX / gridSize) * gridSize + 0.5; // 0.5를 더해서 반올림의 정확성 향상
  const snappedY = Math.round(touchY / gridSize) * gridSize + 0.5; // 0.5를 더해서 반올림의 정확성 향상
  
  console.log(`터치 좌표: (${touchX}, ${touchY}), 스냅된 좌표: (${snappedX}, ${snappedY}), 격자 크기: ${gridSize}`);

  // 터치 좌표가 격자 점과 충분히 가까운지 확인
  if (Math.abs(touchX - snappedX) <= tolerance && Math.abs(touchY - snappedY) <= tolerance) {
    const existingHighlight = document.querySelector(`.highlight[data-x="${snappedX}"][data-y="${snappedY}"]`);

    if (existingHighlight) {
      // 점 제거
      removePoint(snappedX, snappedY);
    } else {
      // 점 추가
      addPoint(snappedX, snappedY);
    }
  }
}

function handleTouch(event) {
  // 기본 터치 동작 방지 (스크롤, 줌 등)
  event.preventDefault();
  
  touchStartTime = Date.now();
  
  // 터치된 위치 좌표 저장
  const touch = event.touches[0];
  touchStartPoint = {
    touchX: touch.clientX,
    touchY: touch.clientY
  };
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
  const tolerance = 15; // 클릭 좌표와 격자 점 사이의 허용 오차 (데스크톱용 더 정확하게)

  // 클릭 좌표를 근접한 격자 점으로 스냅
  const snappedX = Math.round(clickX / gridSize) * gridSize - 1;
  const snappedY = Math.round(clickY / gridSize) * gridSize - 1;

  console.log(`클릭 좌표: (${clickX}, ${clickY}), 스냅된 좌표: (${snappedX}, ${snappedY}), 격자 크기: ${gridSize}`);

  // 클릭 좌표가 격자 점과 충분히 가까운지 확인
  if (Math.abs(clickX - snappedX) <= tolerance && Math.abs(clickY - snappedY) <= tolerance) {
    const existingHighlight = document.querySelector(`.highlight[data-x="${snappedX}"][data-y="${snappedY}"]`);

    if (existingHighlight) {
      removePoint(snappedX, snappedY);
    } else {
      addPoint(snappedX, snappedY);
    }
  }
}

// 점 추가 함수
function addPoint(x, y) {
  console.log('점 추가:', x, y);
  
  const highlight = document.createElement('div');
  highlight.classList.add('highlight');
  highlight.style.position = 'absolute';
  highlight.style.width = '12px'; // 크기를 더 작게 조정
  highlight.style.height = '12px';
  highlight.style.backgroundColor = 'rgba(255, 0, 0, 0.9)';
  highlight.style.borderRadius = '50%';
  highlight.style.border = '2px solid white';
  highlight.style.boxShadow = '0 0 4px rgba(0,0,0,0.5)'; // 그림자 추가로 가시성 향상
  // 격자 교차점에 정확히 중심을 맞춤 (6px은 12px의 절반)
  highlight.style.top = `${y - 6}px`;
  highlight.style.left = `${x - 6}px`;
  highlight.style.pointerEvents = 'none';
  highlight.style.zIndex = '15';
  highlight.setAttribute('data-x', x);
  highlight.setAttribute('data-y', y);

  document.body.appendChild(highlight);
  points.push({ x, y });

  if (points.length === 2) {
    drawLine(points[0], points[1]);
  }
}

// 점 제거 함수
function removePoint(x, y) {
  console.log('점 제거:', x, y);
  
  const existingHighlight = document.querySelector(`.highlight[data-x="${x}"][data-y="${y}"]`);
  if (existingHighlight) {
    existingHighlight.remove();
  }
  
  points = points.filter(point => point.x !== x || point.y !== y);
  
  // 선분도 제거 (클래스와 스타일 둘 다 확인)
  const existingLines = document.querySelectorAll('.connection-line, div[style*="rgba(0, 0, 255"]');
  existingLines.forEach(line => line.remove());
  
  // 버튼 초기 상태로 복원
  resetButtonsToInitial();
}

function drawLine(point1, point2) {
  console.log('선분 그리기:', point1, point2);
  
  const line = document.createElement('div');
  line.classList.add('connection-line'); // 클래스 추가
  line.style.position = 'absolute';
  line.style.backgroundColor = 'rgba(0, 0, 255, 0.8)'; // 파란색 반투명
  line.style.zIndex = '14'; // 강조 표시 아래
  line.style.pointerEvents = 'none';

  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  line.style.width = `${length}px`;
  line.style.height = '3px';
  // 격자점 중심에서 정확히 시작하도록 위치 설정 (선 두께 고려)
  line.style.top = `${point1.y - 1.5}px`; // 선 두께(3px)의 절반만큼 위로
  line.style.left = `${point1.x}px`; // 격자점 중심에서 시작
  line.style.transformOrigin = '0 50%'; // 선의 시작점을 기준으로 회전
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

function resetHighlights() {
  console.log('초기화 함수 실행');
  // 기존 요소들 제거 - 모든 그래픽 요소 포함
  document.querySelectorAll('.highlight, .triangle, .connection-line, .base-line, .height-line, div[style*="rgba(0, 255, 0, 0.5)"], div[style*="rgba(0, 0, 255"]').forEach(el => el.remove());
  
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