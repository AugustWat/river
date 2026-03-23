import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import app from "./firebase";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css"; 

function Login() {
  const login = "login";
  const signup = "signup";
  
  const auth = getAuth(app);
  const [mode, setMode] = useState(login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  
  const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

 const handleLogin = async () => {
  if (!email || !password) {
    alert("Please fill all fields");
    return;
  }

  if (!isValidEmail(email)) {
    alert("Invalid email format");
    return;
  }

  try {
    const userCred = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    console.log("Logged in:", userCred.user);

    localStorage.setItem("token", userCred.user.uid);
    localStorage.setItem("isLoggedIn", "true");
    // store username (displayName if available, otherwise email local-part)
    try {
      const uname = userCred.user.displayName || (userCred.user.email ? userCred.user.email.split('@')[0] : "");
      localStorage.setItem("username", uname);
    } catch (e) {
      localStorage.setItem("username", "");
    }
    navigate("/home");

  } catch (error) {
    alert(error.message);
  }
};

const handleSignup = async () => {
  if (!email || !password) {
    alert("Please fill all fields");
    return;
  }

  if (!isValidEmail(email)) {
    alert("Invalid email format");
    return;
  }

  try {
    const userCred = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    console.log("User created:", userCred.user);

    localStorage.setItem("token", userCred.user.uid);
    localStorage.setItem("isLoggedIn", "true");
    // store username (displayName if available, otherwise email local-part)
    try {
      const uname = userCred.user.displayName || (userCred.user.email ? userCred.user.email.split('@')[0] : "");
      localStorage.setItem("username", uname);
    } catch (e) {
      localStorage.setItem("username", "");
    }
    navigate("/Home");

  } catch (error) {
    alert(error.message);
  }
};

const handleGoogleSignIn = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log("Google sign-in:", user);

    localStorage.setItem("token", user.uid);
    localStorage.setItem("isLoggedIn", "true");
    // store username (displayName if available, otherwise email local-part)
    try {
      const uname = user.displayName || (user.email ? user.email.split('@')[0] : "");
      localStorage.setItem("username", uname);
    } catch (e) {
      localStorage.setItem("username", "");
    }

    navigate("/Home");
  } catch (error) {
    alert(error.message);
  }
};

  return (
    <div className="login-body">
      <div className="login-container">
        
        <div className="login-header">
          {mode === signup ? "StudyAlly Sign Up" : "StudyAlly Login"}
        </div>

        <div className="login-form">
          
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="login-btn" onClick={mode === signup ? handleSignup : handleLogin}>
            {mode === signup ? "Sign Up" : "Login"}
          </button>

          <button className="google-btn" onClick={handleGoogleSignIn}>
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="google"
              className="google-icon"
            />
            Continue with Google
          </button>

          <div className="extra">
            {mode === signup ? "Already have an account? " : "Don't have an account? "}
            <span
              className="link"
              onClick={() => {
                setMode(mode === signup ? login : signup);
                setEmail("");
                setPassword("");
              }}
            >
            {mode === signup ? "Login" : "Sign up"}
            </span>     
          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;