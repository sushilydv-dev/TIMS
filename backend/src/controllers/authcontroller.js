import bcrypt from "bcryptjs"
import User from "../models/user.js"
import OTP from "../models/otp.js"
import generateToken from "../utils/generatetoken.js"
import { Op } from "sequelize"
import { asyncHandler } from "../utils/asyncHandler.js"
import { sendTemplateEmail } from "../utils/emailService.js"
import InviteToken from "../models/inviteToken.js"
import { isAdminEmail } from "../config/adminEmails.js"
import { getCanonicalRoleByName, getUserRoleForClient } from "../utils/roleHelpers.js"
import { normalizeRoleName } from "../config/roles.js"
import { ensureRoleProfile } from "../utils/ensureRoleProfile.js"
import Student from "../models/student.js"
import { handleFileUpload } from "../utils/fileUpload.js"

export const sendOTP = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
        res.status(400);
        throw new Error("User already exists");
    }
    
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 60 * 5000); 

    await OTP.destroy({ where: { email } });
    await OTP.create({ email, otp: otpCode, expiresAt });

    try {
        await sendTemplateEmail(process.env.EMAILJS_TEMPLATE_ID, {
            to_email: email,
            otp: otpCode,
        });
    } catch (emailErr) {
        console.error("Failed to send OTP email via EmailJS:", emailErr.message);
        console.log(`[FALLBACK] OTP for ${email} is: ${otpCode}`);
    }

    res.status(200).json({ message: "OTP sent successfully" });
});

export const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, otp, role } = req.body;

    const validOTP = await OTP.findOne({
        where: {
            email,
            otp,
            expiresAt: { [Op.gt]: new Date() }
        }
    });

    if (!validOTP) {
        res.status(400);
        throw new Error("Invalid or expired OTP");
    }

    const userExists = await User.findOne({
        where: { email }
    });

    if (userExists) {
        res.status(400);
        throw new Error("User already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const signupRole = isAdminEmail(email)
        ? "ADMIN"
        : normalizeRoleName(role);
    const roleRecord = await getCanonicalRoleByName(signupRole);

    const user = await User.create({
        name: username,
        email,
        password: hashedPassword,
        role_id: roleRecord.id,
        status: "active",
    });

    await ensureRoleProfile(user, signupRole);

    await OTP.destroy({ where: { email } });

    if (user) {
        const clientRole = await getUserRoleForClient(user, email);
        res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: clientRole,
            token: generateToken(user.id)
        });
    } else {
        res.status(400);
        throw new Error("Invalid user data");
    }
});

export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (user && (await bcrypt.compare(password, user.password))) {
        if (user.status === "inactive") {
            res.status(403);
            throw new Error(
                "Account not activated. Please use the activation link from your invitation email.",
            );
        }

        if (user.status === "suspended") {
            res.status(403);
            throw new Error("Your account has been suspended. Contact support.");
        }

        const userRole = await getUserRoleForClient(user, email);
        const student = await Student.findOne({ where: { user_id: user.id } });

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: userRole,
            token: generateToken(user.id),
            Student: student ? { id: student.id } : null
        });

    } else {
        res.status(401);
        throw new Error("Invalid email or password");
    }
});

export const getProfile = asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password'] },
        include: [{ model: Student, required: false }]
    });

    if (user) {
        const userRole = await getUserRoleForClient(user);

        const userJson = user.toJSON();
        userJson.role = userRole;
        userJson.Student = user.Student ? { id: user.Student.id } : null;

        res.json(userJson);
    } else {
        res.status(404);
        throw new Error("User not found");
    }
});

export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        res.status(400);
        throw new Error("Email is required");
    }

    const userExists = await User.findOne({ where: { email } });
    if (!userExists) {
        res.status(404);
        throw new Error("User with this email does not exist");
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 60 * 5000); 

    await OTP.destroy({ where: { email } });
    await OTP.create({ email, otp: otpCode, expiresAt });

    try {
        await sendTemplateEmail(process.env.EMAILJS_TEMPLATE_ID, {
            to_email: email,
            otp: otpCode,
        });
    } catch (emailErr) {
        console.error("Failed to send OTP email via EmailJS:", emailErr.message);
        console.log(`[FALLBACK] OTP for ${email} is: ${otpCode}`);
    }

    res.status(200).json({ message: "Reset OTP sent successfully" });
});

export const getActivationInfo = asyncHandler(async (req, res) => {
    const { token } = req.params;

    if (!token) {
        res.status(400);
        throw new Error("Activation token is required");
    }

    const invite = await InviteToken.findOne({
        where: {
            token,
            expiresAt: { [Op.gt]: new Date() },
        },
        include: [{ model: User, attributes: { exclude: ["password"] } }],
    });

    if (!invite?.User) {
        res.status(400);
        throw new Error("Invalid or expired activation link");
    }

    const userRole = await getUserRoleForClient(invite.User);

    res.json({
        email: invite.User.email,
        name: invite.User.name,
        role: userRole,
    });
});

export const activateAccount = asyncHandler(async (req, res) => {
    const { token, password } = req.body;

    if (!token || !password) {
        res.status(400);
        throw new Error("Token and password are required");
    }

    if (String(password).length < 8) {
        res.status(400);
        throw new Error("Password must be at least 8 characters");
    }

    const invite = await InviteToken.findOne({
        where: {
            token,
            expiresAt: { [Op.gt]: new Date() },
        },
        include: [{ model: User }],
    });

    if (!invite?.User) {
        res.status(400);
        throw new Error("Invalid or expired activation link");
    }

    const user = invite.User;
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.status = "active";
    await user.save();

    await ensureRoleProfile(user);

    await InviteToken.destroy({ where: { user_id: user.id } });

    const userRole = await getUserRoleForClient(user);
    const student = await Student.findOne({ where: { user_id: user.id } });

    res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: userRole,
        token: generateToken(user.id),
        Student: student ? { id: student.id } : null,
        message: "Account activated successfully",
    });

});

export const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
        res.status(400);
        throw new Error("All fields are required");
    }

    const validOTP = await OTP.findOne({
        where: {
            email,
            otp,
            expiresAt: { [Op.gt]: new Date() }
        }
    });

    if (!validOTP) {
        res.status(400);
        throw new Error("Invalid or expired OTP");
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    await OTP.destroy({ where: { email } });

    res.status(200).json({ message: "Password reset successfully" });
});

export const updateProfile = asyncHandler(async (req, res) => {
    const { name, email, profile_img } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (profile_img !== undefined) {
        user.profile_img = handleFileUpload(profile_img, "profile");
    }

    await user.save();

    const userRole = await getUserRoleForClient(user);
    const student = await Student.findOne({ where: { user_id: user.id } });

    res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: userRole,
        profile_img: user.profile_img,
        Student: student ? { id: student.id } : null,
    });
});

export const changePassword = asyncHandler(async (req, res) => {
    const { current_password, new_password } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    const isMatch = await bcrypt.compare(current_password, user.password);
    if (!isMatch) {
        res.status(400);
        throw new Error("Current password is incorrect");
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(new_password, salt);
    await user.save();

    res.json({ message: "Password changed successfully" });
});