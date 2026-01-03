import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div style={container}>
            {/* Navbar */}
            <nav style={nav}>
                <div style={logoContainer}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M11.2 4H4V13.8C4 16.7823 6.41766 19.2 9.4 19.2C10.3941 19.2 11.2 18.3941 11.2 17.4V4ZM19.2 4H12V11.2H19.2V4ZM19.2 12H12V17.4C12 18.3941 12.8059 19.2 13.8 19.2C16.7823 19.2 19.2 16.7823 19.2 13.8V12Z" fill="#0052CC" />
                    </svg>
                    <span style={logoText}>Jira</span>
                </div>
                <div style={navLinks}>
                    <button style={loginBtn} onClick={() => navigate("/login")}>Log In</button>
                    <button style={signupBtn} onClick={() => navigate("/signup")}>Get it free</button>
                </div>
            </nav>

            {/* Hero Section */}
            <header style={hero}>
                <div style={heroContent}>
                    <h1 style={heroTitle}>Move fast, stay aligned, and build better - together</h1>
                    <p style={heroSubtitle}>
                        The #1 software development tool used by agile teams. Plan, track, and release world-class software.
                    </p>
                    <div style={ctaGroup}>
                        <button style={ctaPrimary} onClick={() => navigate("/signup")}>Get it free</button>
                    </div>
                </div>
                <div style={heroImage}>
                    {/* Abstract UI Representation */}
                    <div style={abstractUi}>
                        <div style={uiHeader}>
                            <div style={dot}></div>
                            <div style={dot}></div>
                            <div style={dot}></div>
                        </div>
                        <div style={uiBody}>
                            <div style={uiSidebar}></div>
                            <div style={uiContent}>
                                <div style={uiRow}></div>
                                <div style={uiRow}></div>
                                <div style={uiCard}></div>
                                <div style={uiCard}></div>
                                <div style={{ ...uiCard, background: "#fffae6" }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Trusted By Section */}
            <section style={trustedSection}>
                <p style={trustedTitle}>TRUSTED BY 100,000+ TEAMS</p>
                <div style={logoGrid}>
                    <div style={companyLogo}>SQUARE</div>
                    <div style={companyLogo}>EBAY</div>
                    <div style={companyLogo}>SPOTIFY</div>
                    <div style={companyLogo}>CISCO</div>
                    <div style={companyLogo}>AIRBNB</div>
                </div>
            </section>

            {/* Features Section */}
            <section style={featuresSection}>
                <h2 style={featuresHeader}>All the features you need</h2>
                <div style={cardsGrid}>
                    <div style={featureCard}>
                        <div style={iconContainer}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="#0052cc" strokeWidth="2" /><path d="M9 3V21" stroke="#0052cc" strokeWidth="2" /></svg>
                        </div>
                        <h3 style={cardTitle}>Plan</h3>
                        <p style={cardText}>Create user stories and issues, plan sprints, and distribute tasks across your software team.</p>
                    </div>
                    <div style={featureCard}>
                        <div style={iconContainer}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M4 12H20" stroke="#0052cc" strokeWidth="2" /><path d="M15 7L20 12L15 17" stroke="#0052cc" strokeWidth="2" /></svg>
                        </div>
                        <h3 style={cardTitle}>Track </h3>
                        <p style={cardText}>Prioritize and discuss your team’s work in full context with complete visibility.</p>
                    </div>
                    <div style={featureCard}>
                        <div style={iconContainer}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M18 20V10" stroke="#0052cc" strokeWidth="2" /><path d="M12 20V4" stroke="#0052cc" strokeWidth="2" /><path d="M6 20V14" stroke="#0052cc" strokeWidth="2" /></svg>
                        </div>
                        <h3 style={cardTitle}>Report</h3>
                        <p style={cardText}>Improve team performance based on real-time, visual data that your team can put to use.</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={footer}>
                <div style={footerContent}>
                    <div style={footerLogo}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M11.2 4H4V13.8C4 16.7823 6.41766 19.2 9.4 19.2C10.3941 19.2 11.2 18.3941 11.2 17.4V4ZM19.2 4H12V11.2H19.2V4ZM19.2 12H12V17.4C12 18.3941 12.8059 19.2 13.8 19.2C16.7823 19.2 19.2 16.7823 19.2 13.8V12Z" fill="#0052CC" />
                        </svg>
                        <span style={footerLogoText}>Jira</span>
                    </div>
                    <div style={copyright}>
                        © 2026 Jira Copy. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;

/* Styles */
const container = {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    minHeight: "100vh",
    background: "white",
    color: "#172b4d"
};

const nav = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 40px",
    maxWidth: "1200px",
    margin: "0 auto"
};

const logoContainer = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "24px",
    fontWeight: "bold",
    color: "#0c2b5e"
};

const logoText = {
    letterSpacing: "-1px"
};

const navLinks = {
    display: "flex",
    gap: "16px"
};

const loginBtn = {
    background: "transparent",
    border: "none",
    color: "#0052cc",
    fontWeight: "600",
    fontSize: "16px",
    cursor: "pointer",
    padding: "8px 16px"
};

const signupBtn = {
    background: "#0052cc",
    color: "white",
    border: "none",
    borderRadius: "3px",
    fontWeight: "bold",
    fontSize: "14px",
    padding: "10px 20px",
    cursor: "pointer"
};

const hero = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    maxWidth: "1200px",
    margin: "60px auto 0",
    padding: "0 40px",
    gap: "60px",
    paddingBottom: "80px"
};

const heroContent = {
    flex: 1,
    maxWidth: "500px"
};

const heroTitle = {
    fontSize: "52px",
    fontWeight: "700",
    lineHeight: "1.1",
    marginBottom: "24px",
    color: "#091e42"
};

const heroSubtitle = {
    fontSize: "20px",
    fontWeight: "400",
    lineHeight: "1.4",
    marginBottom: "32px",
    color: "#42526e"
};

const ctaGroup = {
    display: "flex",
    gap: "16px"
};

const ctaPrimary = {
    background: "#0052cc",
    color: "white",
    border: "none",
    borderRadius: "3px",
    fontWeight: "bold",
    fontSize: "16px",
    padding: "12px 24px",
    cursor: "pointer",
    boxShadow: "0 4px 8px rgba(0, 82, 204, 0.2)"
};

const heroImage = {
    flex: 1,
    display: "flex",
    justifyContent: "center"
};

/* Abstract UI */
const abstractUi = {
    width: "440px",
    height: "320px",
    background: "white",
    borderRadius: "8px",
    boxShadow: "0 20px 40px rgba(9, 30, 66, 0.15)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    border: "1px solid #dfe1e6"
};

const uiHeader = {
    height: "12px",
    background: "#f4f5f7",
    borderBottom: "1px solid #dfe1e6",
    display: "flex",
    alignItems: "center",
    padding: "0 10px",
    gap: "6px"
};

const dot = { width: "6px", height: "6px", borderRadius: "50%", background: "#dfe1e6" };

const uiBody = { flex: 1, display: "flex" };
const uiSidebar = { width: "80px", background: "#fafbfc", borderRight: "1px solid #dfe1e6" };
const uiContent = { flex: 1, padding: "20px" };
const uiRow = { width: "100%", height: "12px", background: "#ebecf0", marginBottom: "12px", borderRadius: "2px" };
const uiCard = { width: "45%", height: "60px", background: "#deebff", marginBottom: "12px", borderRadius: "3px", display: "inline-block", marginRight: "5%" };

/* Trusted Section */
const trustedSection = {
    background: "#fafbfc",
    textAlign: "center",
    padding: "60px 20px"
};

const trustedTitle = {
    fontSize: "12px",
    fontWeight: "700",
    color: "#6b778c",
    letterSpacing: "1px",
    marginBottom: "30px"
};

const logoGrid = {
    display: "flex",
    justifyContent: "center",
    gap: "40px",
    flexWrap: "wrap",
    opacity: "0.6"
};

const companyLogo = {
    fontSize: "20px",
    fontWeight: "800",
    color: "#42526e",
    fontFamily: "Arial, sans-serif"
};

/* Features Section */
const featuresSection = {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "80px 40px",
    textAlign: "center"
};

const featuresHeader = {
    fontSize: "36px",
    fontWeight: "600",
    color: "#091e42",
    marginBottom: "60px"
};

const cardsGrid = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "40px"
};

const featureCard = {
    textAlign: "left"
};

const iconContainer = {
    marginBottom: "20px",
    background: "#deebff",
    width: "60px",
    height: "60px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
};

const cardTitle = {
    fontSize: "24px",
    fontWeight: "600",
    marginBottom: "12px",
    color: "#172b4d"
};

const cardText = {
    fontSize: "16px",
    color: "#42526e",
    lineHeight: "1.5"
};

/* Footer */
const footer = {
    borderTop: "1px solid #dfe1e6",
    padding: "40px 0",
    background: "#f4f5f7"
};

const footerContent = {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
};

const footerLogo = {
    display: "flex",
    alignItems: "center",
    gap: "8px"
};

const footerLogoText = {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#42526e"
};

const copyright = {
    fontSize: "14px",
    color: "#6b778c"
};
