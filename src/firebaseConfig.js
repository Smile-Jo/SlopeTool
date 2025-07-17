// Firebase 설정 및 초기화
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut, getRedirectResult } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, listAll } from "firebase/storage";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";

// Firebase 설정 객체
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Firebase 서비스 초기화
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);

// 언어 설정 (사용자 기기 언어 사용)
auth.useDeviceLanguage();

// Google 인증 제공자 (사파리 캐시 문제 해결)
export const googleProvider = new GoogleAuthProvider();
// 매번 계정 선택 화면 표시 (사파리 자동 로그인 방지)
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// 인증 관련 함수들
export const signInWithGooglePopup = () => signInWithPopup(auth, googleProvider);
export const signInWithGoogleRedirect = () => signInWithRedirect(auth, googleProvider);
export const getRedirectResultHandler = () => getRedirectResult(auth);
export const logOut = () => signOut(auth);

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
