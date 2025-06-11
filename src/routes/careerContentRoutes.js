const express = require("express");
const router = express.Router();
const careerController = require("../controller/careerContentController");
const { isAuth, isAdmin } = require("../utils/auth");

/*-------------------------------Career Content Routes-------------------------------*/

router.post("/createCareer", isAuth, isAdmin, careerController.createCareerContent);
router.post("/remove", isAuth, isAdmin, careerController.removeCareerContent);
router.post("/listing", careerController.listingCareerContent);
router.post("/update/:id", isAuth, isAdmin, careerController.updateCareerContent);
router.post("/toggleIsPublished/:id", isAuth, isAdmin, careerController.toggleIsPublished);
router.post("/fetchCareerContent", careerController.fetchAllCareerContent);

module.exports = router;
