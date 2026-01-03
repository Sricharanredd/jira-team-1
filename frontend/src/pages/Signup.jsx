import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
    const [form, setForm] = useState({
        email: "",
        full_name: "",
        password: "",
        role: "VIEWER"
    });
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const { register } = useAuth();
    const navigate = useNavigate();

    // Password Rules
    const rules = [
        { label: "At least 8 characters", valid: form.password.length >= 8 },
        { label: "One uppercase letter", valid: /[A-Z]/.test(form.password) },
        { label: "One lowercase letter", valid: /[a-z]/.test(form.password) },
        { label: "One number", valid: /\d/.test(form.password) },
        { label: "One special character", valid: /[!@#$%^&*(),.?":{}|<>]/.test(form.password) },
    ];

    const allRulesMet = rules.every(r => r.valid);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setPasswordError("");

        if (!allRulesMet) {
            setPasswordError("Password does not meet complexity requirements");
            return;
        }

        if (form.password !== confirmPassword) {
            setPasswordError("Passwords do not match");
            return;
        }

        try {
            // Register and auto-login
            await register(form.full_name, form.email, form.password, confirmPassword, form.role);
            navigate("/dashboard"); // Redirect to workspace
        } catch (err) {
            console.error(err);
            const errorMessage = err.response?.data?.detail || err.message || "Unknown error";
            alert("Signup failed: " + errorMessage);
        }
    };

    const handleConfirmChange = (e) => {
        const val = e.target.value;
        setConfirmPassword(val);
        if (form.password && val && form.password !== val) {
            setPasswordError("Passwords do not match");
        } else {
            setPasswordError("");
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

            {/* Main Content Area */}
            <div style={contentWrapper}>

                {/* Left Side: Marketing Info */}
                <div style={marketingCol}>
                    <div style={illustrationPlaceholder}>
                        {/* Simple CSS Illustration representing the 'Teams' graphic */}
                        <div style={{ width: 60, height: 100, background: "#0052cc", margin: "0 10px", borderRadius: 4 }}></div>
                        <div style={{ width: 60, height: 140, background: "#2684ff", margin: "0 10px", borderRadius: 4, marginTop: -40 }}></div>
                        <div style={{ width: 60, height: 80, background: "#00C7E6", margin: "0 10px", borderRadius: 4, alignSelf: "flex-end" }}></div>
                    </div>

                    <h3 style={marketingTitle}>Trusted by over 65,000 teams worldwide</h3>

                    <div style={logosRow}>
                        <span style={logoText}>Square</span>
                        <span style={logoText}>VISA</span>
                        <span style={logoText}>CISCO</span>
                        <span style={logoText}>Pfizer</span>
                    </div>

                    <div style={checklist}>
                        <div style={checkItem}>✓ Scale agile practices</div>
                        <div style={checkItem}>✓ Consolidate workflows</div>
                        <div style={checkItem}>✓ Expand visibility</div>
                        <div style={checkItem}>✓ Plan, track, and release</div>
                    </div>
                </div>

                {/* Right Side: Signup Form Card */}
                <div style={formCard}>
                    <h2 style={cardHeader}>Get started</h2>
                    <p style={cardSubHeader}>Free for up to 10 users</p>

                    <form onSubmit={handleSubmit} style={formStack}>
                        {/* Full Name */}
                        <div style={fieldGroup}>
                            <label style={label}>Full Name</label>
                            <input
                                type="text"
                                style={input}
                                placeholder="Enter full name"
                                value={form.full_name}
                                onChange={e => setForm({ ...form, full_name: e.target.value })}
                                required
                            />
                        </div>

                        {/* Work Email */}
                        <div style={fieldGroup}>
                            <label style={label}>Work Email</label>
                            <input
                                type="email"
                                style={input}
                                placeholder="name@company.com"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                required
                            />
                        </div>

                        {/* Role Selection - REPLACED JOB TITLE */}
                        <div style={fieldGroup}>
                            <label style={label}>Role</label>
                            <select
                                style={input}
                                value={form.role}
                                onChange={e => setForm({ ...form, role: e.target.value })}
                            >
                                <option value="VIEWER">Viewer (Read Only)</option>
                                <option value="DEVELOPER">Developer</option>
                                <option value="TESTER">Tester</option>
                            </select>
                        </div>

                        {/* Password */}
                        <div style={fieldGroup}>
                            <label style={label}>Password</label>
                            <input
                                type="password"
                                style={input}
                                placeholder="Create password"
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                required
                            />
                        </div>

                        {/* Confirm Password */}
                        <div style={fieldGroup}>
                            <label style={label}>Confirm Password</label>
                            <input
                                type="password"
                                style={{
                                    ...input,
                                    borderColor: passwordError ? "#de350b" : "#dfe1e6"
                                }}
                                placeholder="Confirm password"
                                value={confirmPassword}
                                onChange={handleConfirmChange}
                                required
                            />
                            {passwordError && <span style={errorText}>{passwordError}</span>}
                        </div>

                        {/* Password Requirements Checklist */}
                        {form.password && (
                            <div style={{ marginTop: "10px", background: "#f4f5f7", padding: "10px", borderRadius: "3px" }}>
                                <p style={{ fontSize: "11px", fontWeight: "600", color: "#6b778c", marginBottom: "5px", textTransform: "uppercase" }}>Password Requirements</p>
                                {rules.map((rule, idx) => (
                                    <div key={idx} style={{ display: "flex", alignItems: "center", fontSize: "12px", marginBottom: "2px", color: rule.valid ? "#006644" : "#42526e" }}>
                                        <span style={{ marginRight: "6px", color: rule.valid ? "#36b37e" : "#dfe1e6" }}>
                                            {rule.valid ? "✓" : "○"}
                                        </span>
                                        {rule.label}
                                    </div>
                                ))}
                            </div>
                        )}

                        <p style={termsText}>
                            By clicking below, you agree to the Atlassian Cloud Terms of Service and Privacy Policy.
                        </p>

                        <button type="submit" style={submitBtn}>Agree & Sign up</button>
                    </form>

                    <div style={loginLinkContainer}>
                        <span style={{ color: "#42526e" }}>Already have an account? </span>
                        <span style={link} onClick={() => navigate("/login")}>Log in</span>
                    </div>

                    <div style={noCreditCard}>NO CREDIT CARD REQUIRED</div>
                </div>

            </div>
        </div>
    );
}

// ----- STYLES -----
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
    margin: "-200px auto 40px", // pull up over header
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

const logosRow = {
    display: "flex",
    gap: "20px",
    marginBottom: "40px",
    opacity: 0.6
};

const logoText = {
    fontSize: "18px",
    fontWeight: "700",
    color: "#42526e",
    textTransform: "uppercase"
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

// Form Card
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

const errorText = {
    color: "#de350b",
    fontSize: "12px",
    marginTop: "2px"
};

const termsText = {
    fontSize: "11px",
    color: "#6b778c",
    lineHeight: "1.4",
    marginTop: "10px",
    textAlign: "center"
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
