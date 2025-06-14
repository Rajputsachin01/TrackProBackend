const express = require("express");
const router = express.Router();
const feedbackController = require("../controller/feedbackController");
const { isAuth ,isAdmin} = require("../utils/auth");

/*--------------------------------Feedback Routes-------------------------------*/
router.post("/createfeedback",isAuth, isAdmin,feedbackController.createFeedback)
router.post("/update/:id",isAuth,isAdmin, feedbackController.updateFeedback)
router.post("/remove/:id",isAuth, isAdmin,feedbackController.removeFeedback)
router.post("/toggleIsPublished/:id",isAuth,isAdmin, feedbackController.toggleIsPublished)
router.post("/listing",isAuth,isAdmin, feedbackController.listFeedbacks)
router.post("/fetchAllFeedbacks", feedbackController.fetchAllFeedbacks)

module.exports = router;