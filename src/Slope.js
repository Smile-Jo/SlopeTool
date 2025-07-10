import * as THREE from 'three';
import { MindARThree } from 'https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-three.prod.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log("JavaScript 로드됨 및 DOM 준비 완료!");

  const startButton = document.getElementById('startButton');
  startButton.addEventListener('click', async () => {
    console.log("시작 버튼 클릭됨!");

    // AR 시작 시 입력 컨테이너 숨기기
    document.querySelector('.input-container').style.display = 'none';

    // 입력 값 가져오기
    const baseLength = parseFloat(document.getElementById('baseLength').value / 5);
    const heightLength = parseFloat(document.getElementById('heightLength').value / 5);

    // 입력 값 검증
    if (isNaN(baseLength) || isNaN(heightLength) || baseLength <= 0 || heightLength <= 0) {
      alert('유효한 밑변과 높이 값을 입력하세요.');
      return;
    }

    // 빗변 길이 계산
    const hypotenuseLength = Math.sqrt(baseLength * baseLength + heightLength * heightLength);

    // MindAR 초기화
    const mindarThree = new MindARThree({
      container: document.getElementById('container'),  // AR 렌더링 컨테이너
      imageTargetSrc: './Target.mind' // 이미지 인식을 위한 타겟 파일
    });
    
    const { renderer, scene, camera } = mindarThree;

    try {
      // AR 시작 및 카메라 피드를 배경으로 표시
      await mindarThree.start();
      console.log("MindAR 성공적으로 시작됨");
    } catch (error) {
      console.error("MindAR 시작 오류:", error);
      alert("AR 초기화에 실패했습니다. Target.mind 파일을 확인해주세요.");
      document.querySelector('.input-container').style.display = 'block';
      return;
    }

    // AR 객체들
    // 직각삼각형 모양 정의
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);  // 첫 번째 꼭짓점
    shape.lineTo(baseLength, 0);  // 두 번째 꼭짓점 (직각점)
    shape.lineTo(baseLength, heightLength);  // 세 번째 꼭짓점
    shape.lineTo(0, 0);  // 삼각형 닫기

    const geometry1 = new THREE.PlaneGeometry(baseLength, 1);
    const geometry2 = new THREE.PlaneGeometry(heightLength, 1);
    const geometry3 = new THREE.PlaneGeometry(hypotenuseLength, 1); // 빗변 평면
    const geometry4 = new THREE.ShapeGeometry(shape);

    const edge1 = new THREE.EdgesGeometry(geometry1); // 메쉬의 모서리 계산
    const edge2 = new THREE.EdgesGeometry(geometry2); // 메쉬의 모서리 계산
    const edge3 = new THREE.EdgesGeometry(geometry3); // 메쉬의 모서리 계산
    const edge4 = new THREE.EdgesGeometry(geometry4); // 메쉬의 모서리 계산
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000}); // 선 굵기 설정
    const edgeLine1 = new THREE.LineSegments(edge1, edgeMaterial); // 모서리 부분에 라인 추가
    const edgeLine2 = new THREE.LineSegments(edge2, edgeMaterial); // 모서리 부분에 라인 추가
    const edgeLine3 = new THREE.LineSegments(edge3, edgeMaterial); // 모서리 부분에 라인 추가
    const edgeLine4 = new THREE.LineSegments(edge4, edgeMaterial); // 모서리 부분에 라인 추가
    const edgeLine5 = new THREE.LineSegments(edge4, edgeMaterial); // 모서리 부분에 라인 추가

    const material = new THREE.MeshBasicMaterial({ 
      color: 0x00ffff, 
      opacity: 0.7,  // 더 높은 투명도를 위해 낮은 값 설정
      transparent: true // 투명도 적용을 위해 반드시 true로 설정
    });
    const plane1 = new THREE.Mesh(geometry1, material);
    const plane2 = new THREE.Mesh(geometry2, material);
    const plane3 = new THREE.Mesh(geometry3, material); // 빗변 평면
    const triangle1 = new THREE.Mesh(geometry4, material);
    const triangle2 = new THREE.Mesh(geometry4, material);

    // 평면 위치 설정
    plane2.position.set(baseLength / 2, 0, heightLength / 2); // plane1의 끝에서 시작, 수직으로 배치
    plane2.rotation.y = THREE.MathUtils.degToRad(90); // y축을 따라 90도 회전
    edgeLine2.position.set(baseLength / 2, 0, heightLength / 2); 
    edgeLine2.rotation.y = THREE.MathUtils.degToRad(90); 

    plane3.position.set(0, 0, heightLength / 2); // plane3을 올바르게 위치시킴
    plane3.rotation.y = -Math.atan2(heightLength, baseLength); // 빗변 회전
    edgeLine3.position.set(0, 0, heightLength / 2); 
    edgeLine3.rotation.y = -Math.atan2(heightLength, baseLength); 

    triangle1.rotation.x = THREE.MathUtils.degToRad(90);
    triangle1.position.set(- baseLength / 2, 1/2, 0);
    edgeLine4.rotation.x = THREE.MathUtils.degToRad(90);
    edgeLine4.position.set(- baseLength / 2, 1/2, 0);

    triangle2.rotation.x = THREE.MathUtils.degToRad(90);
    triangle2.position.set(- baseLength / 2, -1/2, 0);
    edgeLine5.rotation.x = THREE.MathUtils.degToRad(90);
    edgeLine5.position.set(- baseLength / 2, -1/2, 0);

    const anchor = mindarThree.addAnchor(0);
    anchor.group.add(plane1);
    anchor.group.add(plane2);
    anchor.group.add(plane3);
    anchor.group.add(triangle1);
    anchor.group.add(triangle2);
    anchor.group.add(edgeLine1);
    anchor.group.add(edgeLine2);
    anchor.group.add(edgeLine3);
    anchor.group.add(edgeLine4);
    anchor.group.add(edgeLine5);

    // 렌더링 루프 시작
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });
  });
});
