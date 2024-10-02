import { initializeApp, setLogLevel } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyArr5FmCvvFO2onC1eHWXplk7ZshavM6R8",
  authDomain: "exploreease-5ea15.firebaseapp.com",
  projectId: "exploreease-5ea15",
  storageBucket: "exploreease-5ea15.appspot.com",
  messagingSenderId: "774714874961",
  appId: "1:774714874961:web:40748954c00c961c4d6c70"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Enable verbose logging for debugging purposes
setLogLevel('debug');

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export { auth, db };