const express = require("express");
const router = express.Router();
const faqController = require("../controller/faqController");
const { isAuth ,isAdmin} = require("../utils/auth");

/*--------------------------------Faq Routes-------------------------------*/
router.post("/createFaq",isAuth, isAdmin,faqController.createFaq)
router.post("/remove",isAuth, isAdmin,faqController.removeFaq)
router.post("/listing",isAuth, faqController.listFaqs)
router.post("/update/:id",isAuth,isAdmin, faqController.updateFaq)
router.post("/toggleIsPublished/:id",isAuth,isAdmin, faqController.toggleIsPublished)
router.post("/delete/:id",isAuth, isAdmin,faqController.deleteFaq)
router.post("/fetchFaqs", faqController.fetchAllFaqs)

module.exports = router;