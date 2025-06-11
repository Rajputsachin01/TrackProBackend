const express = require("express");
const router = express.Router();
const cookiesPolicyController = require("../controller/cookiesPolicyController");
const { isAuth,isAdmin } = require("../utils/auth");

router.post("/createCookiesPolicy",isAuth,isAdmin,cookiesPolicyController.createCookiesPolicy);
router.post("/updateCookiesPolicy/:id",isAuth,isAdmin,cookiesPolicyController.updateCookiesPolicy);
router.post("/removeCookiesPolicy/:id",isAuth,isAdmin,cookiesPolicyController.removeCookiesPolicy);
router.post("/fetchPolicies", cookiesPolicyController.fetchCookiesPolicy);
// router.post("/fetchData", cookiesPolicyController.getCurrentStockPrice);

module.exports = router;
