// Firebase 설정 및 초기화
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut, getRedirectResult } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, listAll } from "firebase/storage";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";

// Firebase 설정 객체
const firebaseConfig = {
  apiKey: "AIzaSyCZehGxQjGBXgrPjC-UezZO58H1WSH55d0",
  authDomain: "slopeimageupload.firebaseapp.com",
  projectId: "slopeimageupload",
  storageBucket: "slopeimageupload.firebasestorage.app",
  messagingSenderId: "26570564170",
  appId: "1:26570564170:web:f80409b0df0916d148bcb3",
  measurementId: "G-MXEG6TY1Y8"
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Firebase 서비스 초기화
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);

// Google 인증 제공자
export const googleProvider = new GoogleAuthProvider();
// 추가 스코프 설정 (선택사항)
googleProvider.addScope('profile');
googleProvider.addScope('email');
// 언어 설정
googleProvider.setCustomParameters({
  'display': 'popup'
});

// 인증 관련 함수들
export const signInWithGoogle = () => signInWithRedirect(auth, googleProvider);
export const signInWithGooglePopup = () => signInWithPopup(auth, googleProvider);
export const getRedirectResultHandler = () => getRedirectResult(auth);
export const logOut = () => signOut(auth);

// 사용자 환경에 따라 로그인 방식 자동 선택
export const signInWithGoogleAuto = () => {
  // 모바일 환경에서는 리다이렉트, 데스크톱에서는 팝업
  if (window.innerWidth <= 768 || /Mobi|Android/i.test(navigator.userAgent)) {
    return signInWithRedirect(auth, googleProvider);
  } else {
    return signInWithPopup(auth, googleProvider);
  }
};

// 스토리지 관련 함수들
export const uploadImage = async (file, path) => {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
};

export const deleteImage = async (path) => {
  const storageRef = ref(storage, path);
  return await deleteObject(storageRef);
};

// Firestore 관련 함수들
export const addImageData = async (imageData) => {
  return await addDoc(collection(db, 'images'), imageData);
};

export const getImageList = async () => {
  const q = query(collection(db, 'images'), orderBy('timestamp', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const deleteImageData = async (docId) => {
  return await deleteDoc(doc(db, 'images', docId));
};
