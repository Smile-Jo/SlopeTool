// 카메라 관련 기능 모듈

// 카메라 시작 - 모바일 최적화
export async function startCamera() {
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
