const express = require("express");
const router = express.Router();
const { createBanner, removeBanner, listingBanner, updateBanner, deleteBanner,fetchAllBanners } = require("../controller/bannerController");
const { isAuth } = require("../utils/auth");

/*--------------------------------user Routes-------------------------------*/
router.post("/createbanner", createBanner)
router.post("/remove", removeBanner)
router.post("/listing",isAuth, listingBanner)
router.post("/fetchBanners", fetchAllBanners)
router.post("/update/:id", updateBanner)
router.post("/delete/:id", deleteBanner)



module.exports = router;

