import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

            req.user = await User.findByPk(decoded.id, {
                attributes: { exclude: ['password'] }
            });

            if (!req.user) {
                res.status(401);
                throw new Error("Not authorized, user not found");
            }

            return next();
        } catch (error) {
            res.status(401);
            throw new Error("Not authorized, token failed");
        }
    }

    if (!token) {
        res.status(401);
        throw new Error("Not authorized, no token");
    }
});

export default protect;

