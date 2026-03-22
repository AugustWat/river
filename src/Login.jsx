import { useState } from "react";
import { useNavigate } from 'react-router-dom';  // added

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
const navigate = useNavigate();               //added

  const handleLogin = () => {
    console.log("Email:", email);
    console.log("Password:", password);

    //TODO:  connect Firebase here


localStorage.setItem('token', 'dummy_token');
navigate('/home');                                                                             //added

  };

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        
        <div style={styles.header}>
          CollegeStudyBuddy
        </div>

        <div style={styles.form}>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button style={styles.button} onClick={handleLogin}>
            Login
          </button>

          <div style={styles.extra}>
            Don't have an account?{" "}
            <span style={styles.link}>Sign up</span>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;