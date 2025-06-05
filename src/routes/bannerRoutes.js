const express = require("express");
const router = express.Router();
const { createBanner, removeBanner, listingBanner, updateBanner, deleteBanner,fetchAllBanners } = require("../controller/bannerController");
const { isAuth ,isAdmin} = require("../utils/auth");

/*--------------------------------Banner Routes-------------------------------*/
router.post("/createbanner",isAuth, isAdmin,createBanner)
router.post("/remove",isAuth, isAdmin,removeBanner)
router.post("/listing",isAuth, listingBanner)
router.post("/fetchBanners", fetchAllBanners)
router.post("/update/:id",isAuth,isAdmin, updateBanner)
router.post("/delete/:id",isAuth, isAdmin,deleteBanner)

module.exports = router;

