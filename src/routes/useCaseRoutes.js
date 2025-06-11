const express = require("express");
const router = express.Router();
const useCaseController = require("../controller/useCaseController");
const { isAuth ,isAdmin} = require("../utils/auth");

/*--------------------------------UseCase Routes-------------------------------*/
router.post("/createUseCase",isAuth, isAdmin,useCaseController.createUseCase)
router.post("/remove",isAuth, isAdmin,useCaseController.removeUseCase)
router.post("/listing", useCaseController.listingUseCases)
router.post("/update/:id",isAuth,isAdmin, useCaseController.updateUseCase)
router.post("/delete/:id",isAuth, isAdmin,useCaseController.deleteUseCase)
router.post("/fetchUseCases", useCaseController.fetchAllUseCases)
module.exports = router;

