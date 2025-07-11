// SweetAlert2를 사용한 사용자 친화적인 알림 메시지 모듈
import Swal from 'sweetalert2';

// 공통 설정
const commonConfig = {
  heightAuto: false,
  customClass: {
    container: 'swal-container-fixed'
  }
};

// 성공 메시지
export function showSuccess(title, text = '') {
  return Swal.fire({
    ...commonConfig,
    icon: 'success',
    title: title,
    text: text,
    confirmButtonText: '확인',
    confirmButtonColor: '#4CAF50',
    timer: 3000,
    timerProgressBar: true
  });
}

// 에러 메시지
export function showError(title, text = '') {
  return Swal.fire({
    ...commonConfig,
    icon: 'error',
    title: title,
    text: text,
    confirmButtonText: '확인',
    confirmButtonColor: '#f44336'
  });
}

// 경고 메시지
export function showWarning(title, text = '') {
  return Swal.fire({
    ...commonConfig,
    icon: 'warning',
    title: title,
    text: text,
    confirmButtonText: '확인',
    confirmButtonColor: '#ff9800'
  });
}

// 정보 메시지
export function showInfo(title, text = '') {
  return Swal.fire({
    icon: 'info',
    title: title,
    text: text,
    confirmButtonText: '확인',
    confirmButtonColor: '#2196F3'
  });
}

// 확인 대화상자
export function showConfirm(title, text = '', confirmText = '확인', cancelText = '취소') {
  return Swal.fire({
    icon: 'question',
    title: title,
    text: text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: '#2196F3',
    cancelButtonColor: '#6c757d'
  });
}

// 로딩 메시지
export function showLoading(title = '처리 중...') {
  return Swal.fire({
    title: title,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
}

// 토스트 메시지 (작은 알림)
export function showToast(title, icon = 'success') {
  return Swal.fire({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    icon: icon,
    title: title
  });
}
