import sequelize from "./db.js";
import User from "../models/user.js";
import Role from "../models/role.js";
import OTP from "../models/otp.js";

async function runTest() {
  console.log("Starting authentication flow test...");
  const email = "test-user-" + Date.now() + "@tims.com";
  const password = "Password123!";
  const username = "Test User";
  const role = "TRAINER";

  try {
    const otpCode = "123456";
    const expiresAt = new Date(Date.now() + 60 * 5000);
    await OTP.destroy({ where: { email } });
    await OTP.create({ email, otp: otpCode, expiresAt });
    console.log("OTP successfully placed in database:", otpCode);

    
    console.log("Registering user via API...");
    const regRes = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        email,
        password,
        otp: otpCode,
        role
      })
    });
    const regData = await regRes.json();
    if (!regRes.ok) {
      throw new Error(`Register failed: ${JSON.stringify(regData)}`);
    }
    console.log("User registered successfully. Token length:", regData.token.length);
    console.log("Role assigned in response:", regData.role);

    const token = regData.token;

    // 3. Login user
    console.log("Logging in via API...");
    const loginRes = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) {
      throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
    }
    console.log("Login response success. Role:", loginData.role);

    // 4. Get profile
    console.log("Fetching profile via API...");
    const profileRes = await fetch("http://localhost:3000/api/auth/profile", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    const profileData = await profileRes.json();
    if (!profileRes.ok) {
      throw new Error(`Profile fetch failed: ${JSON.stringify(profileData)}`);
    }
    console.log("Profile details: name =", profileData.name, ", role =", profileData.role);

    console.log("All authentication flow tests passed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Test failed:", error.message);
    process.exit(1);
  }
}

runTest();
