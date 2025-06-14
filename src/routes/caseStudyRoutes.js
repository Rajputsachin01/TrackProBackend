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
router.post("/createSolution", isAuth,isAdmin, caseController.createSolution);
router.post("/updateSolution",isAuth,isAdmin,  caseController.updateSolution);
router.post("/deleteSolution", isAuth,isAdmin, caseController.deleteSolution);
router.post("/toggleIsPublished/:id",isAuth,isAdmin,caseController.toggleIsPublished)
router.post("/listingSolution",isAuth,isAdmin, caseController.listingSolutions);
router.post("/fetchSolutions", caseController.fetchAllSolutions);
router.post("/get-all-types", caseController.fetchAllSolutionTypes)
//--------------------Query Routes---------------------------


router.post("/createQuery",  caseController.createQuery);
router.post("/updateQuery",  caseController.markQueryAsRead);
router.post("/deleteQuery",  caseController.deleteQuery);
router.post("/listingQuery", caseController.listQueries);

module.exports = router;