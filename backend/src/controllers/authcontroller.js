import bcrypt from "bcryptjs"
import User from "../models/user.js"
import OTP from "../models/otp.js"
import Role from "../models/role.js"
import generateToken from "../utils/generatetoken.js"
import emailjs from "@emailjs/nodejs"
import { Op } from "sequelize"

export const sendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 60 * 5000); 

        await OTP.destroy({ where: { email } });
        await OTP.create({ email, otp: otpCode, expiresAt });

        await emailjs.send(
            process.env.EMAILJS_SERVICE_ID,
            process.env.EMAILJS_TEMPLATE_ID,
            {
                to_email: email,
                otp: otpCode,
            },
            {
                publicKey: process.env.EMAILJS_PUBLIC_KEY,
                privateKey: process.env.EMAILJS_PRIVATE_KEY,
            }
        );

        res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
        console.error("SEND OTP ERROR:", error);
        res.status(500).json({ message: "Failed to send OTP", error: error?.message || error });
    }
};

export const registerUser = async (req, res) => {
    try {
        const { username, email, password, otp, role } = req.body;

        const validOTP = await OTP.findOne({
            where: {
                email,
                otp,
                expiresAt: { [Op.gt]: new Date() }
            }
        });

        if (!validOTP) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        const userExists = await User.findOne({
            where: { email }
        });

        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name: username,
            email,
            password: hashedPassword
        });

        const createdRole = await Role.create({
            userId: user.id,
            role: role || "STUDENT"
        });

        await OTP.destroy({ where: { email } });

        if (user) {
            res.status(201).json({
                id: user.id,
                name: user.name,
                email: user.email,
                role: createdRole.role,
                token: generateToken(user.id)
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });

        if (user && (await bcrypt.compare(password, user.password))) {
            const roleRecord = await Role.findOne({ where: { userId: user.id } });
            const userRole = roleRecord ? roleRecord.role : "STUDENT";

            res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                role: userRole,
                token: generateToken(user.id)
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });

        if (user) {
            const roleRecord = await Role.findOne({ where: { userId: user.id } });
            const userRole = roleRecord ? roleRecord.role : "STUDENT";

            const userJson = user.toJSON();
            userJson.role = userRole;

            res.json(userJson);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};