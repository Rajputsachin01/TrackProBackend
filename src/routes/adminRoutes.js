const express = require("express");
const router = express.Router();
const { registerAdmin, loginAdmin, verifyOTP, updateAdmin, removeAdmin,fetchProfile,fetchAnalytics } = require("../controller/adminController");
const { isAuth,isAdmin } = require("../utils/auth");

/*--------------------------------Admin Routes-------------------------------*/
router.post("/register", registerAdmin)
router.post("/login", loginAdmin)
router.post("/verifyotp", verifyOTP)
router.post("/update", isAuth,isAdmin, updateAdmin)
router.post("/remove", isAuth,isAdmin, removeAdmin)
router.post("/fetchProfile", isAuth,isAdmin, fetchProfile)
router.post("/fetchAnalytics", isAuth,isAdmin, fetchAnalytics)

module.exports = router;
