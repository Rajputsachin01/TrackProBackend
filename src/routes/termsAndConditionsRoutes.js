const express = require("express");
const router = express.Router();
const termsAndConditionController = require("../controller/termsAndConditionController");
const { isAuth,isAdmin } = require("../utils/auth");

router.post("/createTerms",isAuth,isAdmin,termsAndConditionController.createTerms);
router.post("/updateTerms/:id",isAuth,isAdmin,termsAndConditionController.updateTerms);
router.post("/removeTerms/:id",isAuth,isAdmin,termsAndConditionController.removeTerms);
router.post("/terms", termsAndConditionController.fetchTerms);

module.exports = router;
