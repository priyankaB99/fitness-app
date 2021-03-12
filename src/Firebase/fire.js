import firebase from "firebase";
import "firebase/auth";
// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyAWiFhRs7Z-OlZs_cMxhS5yoWndTIfmvBo",
  authDomain: "fitness-app-db861.firebaseapp.com",
  databaseURL: "https://fitness-app-db861-default-rtdb.firebaseio.com",
  projectId: "fitness-app-db861",
  storageBucket: "fitness-app-db861.appspot.com",
  messagingSenderId: "689354937083",
  appId: "1:689354937083:web:22a9cde88e4c1469a3965e",
};
// Initialize Firebase
var fire = firebase.initializeApp(firebaseConfig);
export default fire;
