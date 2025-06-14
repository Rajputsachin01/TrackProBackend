const express = require("express");
const router = express.Router();
const caseController = require("../controller/caseStudyController");
const { isAuth ,isAdmin} = require("../utils/auth");

//--------------------Case study Routes---------------------------

router.post("/createCase", caseController.createCaseStudy);
router.post("/update", caseController.updateCaseStudy);
router.post("/delete", caseController.deleteCaseStudy);
router.post("/listing", caseController.getAllCaseStudies);
router.post("/get-by-id", caseController.getCaseStudyById)



//--------------------Solution Routes---------------------------


router.post("/createSolution",  caseController.createSolution);
router.post("/updateSolution",  caseController.updateSolution);
router.post("/deleteSolution",  caseController.deleteSolution);
router.post("/listingSolution", caseController.listSolutions);
router.post("/fetchSolutions", caseController.fetchAllSolutions);

//--------------------Query Routes---------------------------


router.post("/createQuery",  caseController.createQuery);
router.post("/updateQuery",  caseController.markQueryAsRead);
router.post("/deleteQuery",  caseController.deleteQuery);
router.post("/listingQuery", caseController.listQueries);

module.exports = router;