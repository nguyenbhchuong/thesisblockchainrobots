const { doc, getDoc } = require("firebase/firestore");
const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyA9qKXOVt5Nyc_hZ5hAqBBHf6EuStFm2Bc",
  authDomain: "location-service-6d88a.firebaseapp.com",
  projectId: "location-service-6d88a",
  storageBucket: "location-service-6d88a.appspot.com",
  messagingSenderId: "126038330312",
  appId: "1:126038330312:web:a0895b39c0fab0cda2cefd",
  measurementId: "G-Y4X5Y6WTPE",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and get a reference to the service
const db = getFirestore(app);

const getDocument = async () => {
  const docRef = doc(db, "location", "G1");
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    console.log("Document data:", docSnap.data());
  } else {
    // docSnap.data() will be undefined in this case
    console.log("No such document!");
  }
};

getDocument();
