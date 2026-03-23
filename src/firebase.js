import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBL6XP8xExm5rhpyVot9ujUebiLUcU-iOk",
  authDomain: "studyally-7a86a.firebaseapp.com",
  projectId: "studyally-7a86a",
  storageBucket: "studyally-7a86a.firebasestorage.app",
  messagingSenderId: "611199159939",
  appId: "1:611199159939:web:fdcf1d74f1dffd9e8555b6",
  measurementId: "G-97CZVT3CWS"
};

const app = initializeApp(firebaseConfig);

export default app;