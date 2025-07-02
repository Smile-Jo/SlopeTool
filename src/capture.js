// 캡처 관련 기능 모듈

// 캔버스에 격자선 그리기
function drawGridOnCanvas(ctx, width, height, gridSize) {
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.lineWidth = 1;
  
  // 세로 격자선
  for (let x = 0; x <= width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  
  // 가로 격자선
  for (let y = 0; y <= height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

// 캔버스에 점과 선 그리기
function drawPointsAndLinesOnCanvas(ctx, points, triangleCreated) {
  // 점들 그리기
  points.forEach(point => {
    ctx.fillStyle = 'rgba(255, 0, 0, 0.9)';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  });
  
  // 선분 그리기
  if (points.length >= 2) {
    ctx.strokeStyle = 'rgba(0, 0, 255, 0.8)';
    ctx.lineWidth = 3;
    
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    ctx.lineTo(points[1].x, points[1].y);
    ctx.stroke();
    
    // 삼각형이 있다면 그리기
    if (triangleCreated) {
      // 밑변 (노란색)
      ctx.strokeStyle = 'yellow';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(Math.min(points[0].x, points[1].x), Math.max(points[0].y, points[1].y));
      ctx.lineTo(Math.max(points[0].x, points[1].x), Math.max(points[0].y, points[1].y));
      ctx.stroke();
      
      // 높이 (빨간색)
      ctx.strokeStyle = 'red';
      ctx.beginPath();
      const lowerYPointX = points[0].y < points[1].y ? points[0].x : points[1].x;
      ctx.moveTo(lowerYPointX, Math.min(points[0].y, points[1].y));
      ctx.lineTo(lowerYPointX, Math.max(points[0].y, points[1].y));
      ctx.stroke();
      
      // 삼각형 영역 (초록색 반투명)
      ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      ctx.lineTo(points[1].x, points[1].y);
      ctx.lineTo(Math.min(points[0].x, points[1].x), Math.max(points[0].y, points[1].y));
      ctx.lineTo(Math.max(points[0].x, points[1].x), Math.max(points[0].y, points[1].y));
      ctx.closePath();
      ctx.fill();
    }
  }
}

// 대안 캡쳐 방법 - 비디오와 요소들을 직접 그리기
function fallbackCapture(points, triangleCreated, gridSize) {
  console.log('대안 캡처 방법 시도...');
  
  try {
    const videoElement = document.getElementById('video');
    if (videoElement && videoElement.videoWidth > 0) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // 현재 화면 비율에 맞춰 캔버스 크기 설정
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // 비디오를 화면 전체에 맞춰 그리기
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      
      // 격자선 직접 그리기
      drawGridOnCanvas(ctx, canvas.width, canvas.height, gridSize);
      
      // 점과 선 그리기
      drawPointsAndLinesOnCanvas(ctx, points, triangleCreated);
      
      const dataURL = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = `video_capture_${new Date().getTime()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log('대안 캡쳐 완료');
    } else {
      alert('캡쳐할 수 있는 비디오가 없습니다.');
    }
  } catch (error) {
    console.error('Fallback capture failed:', error);
    alert('캡쳐에 실패했습니다.');
  }
}

// 전체 화면 캡처 - 비디오와 웹 요소 모두 포함
export function captureScreenshot(points, triangleCreated, gridSize) {
  console.log('캡처 시작...');
  
  try {
    const videoElement = document.getElementById('video');
    if (!videoElement || videoElement.videoWidth === 0) {
      alert('비디오가 준비되지 않았습니다.');
      return;
    }

    // 캔버스 생성
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 화면 크기에 맞춰 캔버스 설정
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // 1단계: 비디오 배경 그리기
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    // 2단계: 웹 요소들을 html2canvas로 캡처해서 위에 오버레이
    html2canvas(document.body, {
      allowTaint: true,
      useCORS: true,
      scale: 1,
      width: window.innerWidth,
      height: window.innerHeight,
      scrollX: 0,
      scrollY: 0,
      backgroundColor: null, // 투명 배경
      foreignObjectRendering: true,
      logging: false,
      ignoreElements: (element) => {
        // 비디오 요소는 무시 (이미 그렸으므로)
        return element.tagName === 'VIDEO';
      }
    }).then(overlayCanvas => {
      // 웹 요소들을 비디오 위에 합성
      ctx.drawImage(overlayCanvas, 0, 0);
      
      // 최종 이미지 다운로드
      const dataURL = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = `slope_capture_${new Date().getTime()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log('캡쳐 완료');
    }).catch(error => {
      console.error('웹 요소 캡처 실패:', error);
      // 대안: 비디오와 요소들을 직접 그리기
      fallbackCapture(points, triangleCreated, gridSize);
    });
    
  } catch (error) {
    console.error('캡처 실패:', error);
    fallbackCapture(points, triangleCreated, gridSize);
  }
}
