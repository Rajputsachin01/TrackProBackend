const express = require("express");
const router = express.Router();
const demoVideoController = require("../controller/demoVideoController.js");
const { isAuth,isAdmin } = require("../utils/auth");

/*--------------------------------DemoVideo Routes-------------------------------*/
router.post("/createDemoVideo",isAuth,isAdmin, demoVideoController.createDemoVideo)
router.post("/remove",isAuth,isAdmin, demoVideoController.removeDemoVideo)
router.post("/listing",isAuth,isAdmin, demoVideoController.listingDemoVideo)
router.post("/update/:id",isAuth,isAdmin, demoVideoController.updateDemoVideo)
router.post("/delete/:id",isAuth,isAdmin, demoVideoController.deleteDemoVideo)
router.post("/toggleIsPublished",isAuth,isAdmin, demoVideoController.toggleIsPublished)
router.post("/fetchDemoVideos", demoVideoController.fetchAllDemoVideos)


module.exports = router;

