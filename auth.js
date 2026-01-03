import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    setDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 1. YOUR FIREBASE CONFIG
// Replace these placeholders with your actual keys from Firebase Console
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase Services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const authForm = document.getElementById('authForm');
const authTitle = document.getElementById('authTitle');
const submitBtn = document.getElementById('submitBtn');
const toggleAuth = document.getElementById('toggleAuth');
const signUpFields = document.getElementById('signUpFields');
const toggleText = document.getElementById('toggleText');

let isLogin = true;

// --- TOGGLE LOGIC ---
toggleAuth.addEventListener('click', (e) => {
    e.preventDefault();
    isLogin = !isLogin;

    if (isLogin) {
        authTitle.innerText = "Welcome Back";
        submitBtn.innerText = "Sign In";
        toggleText.innerText = "Don't have an account?";
        toggleAuth.innerText = "Sign Up";
        signUpFields.classList.add('hidden'); // Hide profile fields
    } else {
        authTitle.innerText = "Create Student Profile";
        submitBtn.innerText = "Register & Start";
        toggleText.innerText = "Already have an account?";
        toggleAuth.innerText = "Login";
        signUpFields.classList.remove('hidden'); // Show Name, Enrollment, Mobile
    }
});

// --- SUBMISSION LOGIC ---
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Show loading state on button
    const originalBtnText = submitBtn.innerText;
    submitBtn.innerText = "Processing...";
    submitBtn.disabled = true;

    try {
        if (isLogin) {
            // LOGIN FLOW
            await signInWithEmailAndPassword(auth, email, password);
            console.log("Login Successful");
        } else {
            // SIGNUP FLOW
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Save Extra Student Details to Firestore
            const name = document.getElementById('userName').value;
            const enrollment = document.getElementById('enrollment').value;
            const mobile = document.getElementById('mobile').value;

            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                name: name,
                enrollment: enrollment,
                mobile: mobile,
                email: email,
                role: "student",
                createdAt: new Date().toISOString()
            });
            console.log("Account and Profile Created");
        }

        // Redirect to reporting page after success
        window.location.href = "report.html";

    } catch (error) {
        console.error("Auth Error:", error.code, error.message);
        alert("Error: " + error.message);
    } finally {
        // Reset button state
        submitBtn.innerText = originalBtnText;
        submitBtn.disabled = false;
    }
});