const express = require("express");
const router = express.Router();
const featuresController = require("../controller/featuresController");
const { isAuth ,isAdmin} = require("../utils/auth");

/*--------------------------------Features Routes-------------------------------*/
router.post("/createFeature",isAuth, isAdmin,featuresController.createFeature)
router.post("/remove",isAuth, isAdmin,featuresController.removeFeature)
router.post("/listing",isAuth, featuresController.listingFeatures)
router.post("/fetchFeatures", featuresController.fetchAllFeatures)
router.post("/update/:id",isAuth,isAdmin, featuresController.updateFeature)
router.post("/delete/:id",isAuth, isAdmin,featuresController.deleteFeature)

module.exports = router;

