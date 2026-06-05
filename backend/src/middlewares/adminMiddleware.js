import { asyncHandler } from "../utils/asyncHandler.js";
import { getUserRoleForClient } from "../utils/roleHelpers.js";

export const adminOnly = asyncHandler(async (req, res, next) => {
  const role = await getUserRoleForClient(req.user);

  if (role !== "ADMIN") {
    res.status(403);
    throw new Error("Admin access required");
  }

  next();
});
