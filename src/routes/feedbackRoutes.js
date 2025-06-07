const express = require("express");
const router = express.Router();
const feedbackController = require("../controller/feedbackController");
const { isAuth ,isAdmin} = require("../utils/auth");

/*--------------------------------Faq Routes-------------------------------*/
router.post("/createfeedback",isAuth, isAdmin,feedbackController.createFeedback)
router.post("/update/:id",isAuth,isAdmin, feedbackController.updateFeedback)
router.post("/remove",isAuth, isAdmin,feedbackController.removeFeedback)
router.post("/toggleIsPublished/:id",isAuth,isAdmin, feedbackController.toggleIsPublished)
router.post("/listing",isAuth, feedbackController.listFeedbacks)
router.post("/fetchAllFeedbacks", feedbackController.fetchAllFeedbacks)

module.exports = router;