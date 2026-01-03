import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const [form, setForm] = useState({ email: "", password: "" });
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(form.email, form.password);
            navigate("/dashboard"); // Redirect to workspace on success
        } catch (err) {
            console.error(err);
            alert("Login failed: " + (err.message || "Unknown error"));
        }
    };

    return (
        <div style={pageContainer}>
            {/* Header / Background Strip */}
            <div style={blueHeader}>
                <div style={headerContent}>
                    <div style={logoArea}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ marginRight: 10 }}>
                            <path fillRule="evenodd" clipRule="evenodd" d="M11.2 4H4V13.8C4 16.7823 6.41766 19.2 9.4 19.2C10.3941 19.2 11.2 18.3941 11.2 17.4V4ZM19.2 4H12V11.2H19.2V4ZM19.2 12H12V17.4C12 18.3941 12.8059 19.2 13.8 19.2C16.7823 19.2 19.2 16.7823 19.2 13.8V12Z" fill="white" />
                        </svg>
                        <span style={{ color: "white", fontWeight: "600", fontSize: "28px", letterSpacing: "-0.5px" }}>Jira Software</span>
                    </div>
                    <div style={subHeader}>Clone </div>
                </div>
            </div>

            <div style={contentWrapper}>
                {/* Left Side: Marketing Info */}
                <div style={marketingCol}>
                    <div style={illustrationPlaceholder}>
                        {/* Simple CSS Illustration */}
                        <div style={{ width: 60, height: 100, background: "#0052cc", margin: "0 10px", borderRadius: 4 }}></div>
                        <div style={{ width: 60, height: 140, background: "#2684ff", margin: "0 10px", borderRadius: 4, marginTop: -40 }}></div>
                        <div style={{ width: 60, height: 80, background: "#00C7E6", margin: "0 10px", borderRadius: 4, alignSelf: "flex-end" }}></div>
                    </div>

                    <h3 style={marketingTitle}>Welcome back to your team</h3>

                    <div style={checklist}>
                        <div style={checkItem}>✓ Continue where you left off</div>
                        <div style={checkItem}>✓ Check your latest tasks</div>
                        <div style={checkItem}>✓ Collaborate in real-time</div>
                    </div>
                </div>

                {/* Right Side: Login Card */}
                <div style={formCard}>
                    <h2 style={cardHeader}>Log in</h2>
                    <p style={cardSubHeader}>Continue to Jira Software</p>

                    <form onSubmit={handleSubmit} style={formStack}>
                        <div style={fieldGroup}>
                            <label style={label}>Email</label>
                            <input
                                type="email"
                                style={input}
                                placeholder="Enter your email"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                required
                            />
                        </div>

                        <div style={fieldGroup}>
                            <label style={label}>Password</label>
                            <input
                                type="password"
                                style={input}
                                placeholder="Enter password"
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                required
                            />
                        </div>

                        <button type="submit" style={submitBtn}>Log in</button>
                    </form>

                    <div style={loginLinkContainer}>
                        <span style={{ color: "#42526e" }}>Don't have an account? </span>
                        <span style={link} onClick={() => navigate("/signup")}>Sign up</span>
                    </div>

                    <div style={noCreditCard}>SECURE LOGIN</div>
                </div>
            </div>
        </div>
    );
}

// ----- STYLES (Reused from Signup for consistency) -----
const pageContainer = {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    background: "#f4f5f7"
};

const blueHeader = {
    height: "320px",
    background: "#0052cc",
    clipPath: "ellipse(150% 100% at 50% 0%)",
    display: "flex",
    justifyContent: "center",
    paddingTop: "60px",
    zIndex: 1
};

const headerContent = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
};

const logoArea = {
    display: "flex",
    alignItems: "center",
    marginBottom: "5px"
};

const subHeader = {
    color: "white",
    fontSize: "18px",
    fontWeight: "500",
    opacity: "0.9"
};

const contentWrapper = {
    display: "flex",
    justifyContent: "center",
    maxWidth: "1000px",
    width: "100%",
    margin: "-200px auto 40px",
    zIndex: 2,
    gap: "60px",
    padding: "0 20px"
};

const marketingCol = {
    flex: 1,
    paddingTop: "60px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center"
};

const illustrationPlaceholder = {
    height: "200px",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-end",
    marginBottom: "30px"
};

const marketingTitle = {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#172b4d",
    marginBottom: "20px"
};

const checklist = {
    textAlign: "left",
    color: "#42526e",
    fontSize: "16px",
    lineHeight: "2"
};

const checkItem = {
    display: "flex",
    alignItems: "center",
    gap: "10px"
};

const formCard = {
    flex: "0 0 450px",
    background: "white",
    borderRadius: "3px",
    boxShadow: "0 0 20px rgba(0,0,0,0.1)",
    padding: "40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
};

const cardHeader = {
    color: "#172b4d",
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "8px"
};

const cardSubHeader = {
    color: "#5e6c84",
    marginBottom: "30px",
    fontSize: "14px"
};

const formStack = {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "12px"
};

const fieldGroup = {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    textAlign: "left"
};

const label = {
    fontSize: "12px",
    color: "#6b778c",
    fontWeight: "600"
};

const input = {
    padding: "10px",
    fontSize: "14px",
    border: "2px solid #dfe1e6",
    borderRadius: "3px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    transition: "border-color 0.2s"
};

const submitBtn = {
    marginTop: "10px",
    background: "#0052cc",
    color: "white",
    border: "none",
    padding: "12px",
    fontSize: "14px",
    fontWeight: "bold",
    borderRadius: "3px",
    cursor: "pointer",
    width: "100%"
};

const loginLinkContainer = {
    marginTop: "20px",
    fontSize: "14px"
};

const link = {
    color: "#0052cc",
    cursor: "pointer",
    textDecoration: "none"
};

const noCreditCard = {
    marginTop: "30px",
    fontSize: "11px",
    fontWeight: "bold",
    color: "#42526e",
    letterSpacing: "0.5px"
};
