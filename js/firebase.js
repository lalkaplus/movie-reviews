import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyArs2HWc_mLpkJfqhm6aFmkl9_4wSbjqNA",
    authDomain: "filmp-aced7.firebaseapp.com",
    projectId: "filmp-aced7",
    storageBucket: "filmp-aced7.firebasestorage.app",
    messagingSenderId: "84762572851",
    appId: "1:84762572851:web:e623ac57ae0e415c308b46"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);