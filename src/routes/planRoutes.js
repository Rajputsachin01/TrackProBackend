const express = require("express");
const router = express.Router();
const planController = require("../controller/planController");
const { isAuth ,isAdmin} = require("../utils/auth");

/*--------------------------------Plan Routes-------------------------------*/
router.post("/createPlan",isAuth, isAdmin,planController.createPlan)
router.post("/remove",isAuth, isAdmin,planController.removePlan)
router.post("/listing",isAuth, planController.listingPlans)
router.post("/update/:id",isAuth,isAdmin, planController.updatePlan)
router.post("/toggleIsPublished/:id",isAuth,isAdmin, planController.toggleIsPublished)
router.post("/delete/:id",isAuth, isAdmin,planController.deletePlan)
router.post("/fetchPlans", planController.fetchAllPlans)
router.post("/fetchComparePlans", planController.comparePlanFeatures)
module.exports = router;

