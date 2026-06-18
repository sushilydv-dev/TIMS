import { asyncHandler } from "../utils/asyncHandler.js";
import { getUserRoleForClient } from "../utils/roleHelpers.js";

export const requireAdminOrHR = asyncHandler(async (req, res, next) => {
  const role = await getUserRoleForClient(req.user);

  if (role !== "ADMIN" && role !== "HR_COORDINATOR" && role !== "HR") {
    res.status(403);
    throw new Error("Admin or HR access required");
  }

  next();
});
