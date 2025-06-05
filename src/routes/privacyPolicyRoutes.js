const express = require("express");
const router = express.Router();
const privacyPolicyController = require("../controller/privacyPolicyController");
const { isAuth,isAdmin } = require("../utils/auth");

router.post("/createPolicy",isAuth,isAdmin,privacyPolicyController.createPolicy);
router.post("/updatePolicy/:id",isAuth,isAdmin,privacyPolicyController.updatePolicy);
router.post("/removePolicy/:id",isAuth,isAdmin,privacyPolicyController.removePolicy);
router.post("/policies", privacyPolicyController.fetchPolicy);

module.exports = router;
