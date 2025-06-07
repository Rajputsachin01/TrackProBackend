const express = require("express");
const router = express.Router();
const brandController = require("../controller/brandController");
const { isAuth ,isAdmin} = require("../utils/auth");

/*--------------------------------AssociatedBrand Routes-------------------------------*/
router.post("/createBrand",isAuth, isAdmin,brandController.createBrand)
router.post("/update/:id",isAuth,isAdmin, brandController.updateBrand)
router.post("/remove",isAuth, isAdmin,brandController.removeBrand)
router.post("/delete/:id",isAuth, isAdmin,brandController.deleteBrand)
router.post("/listing",isAuth, brandController.listingBrand)
router.post("/fetchBrands", brandController.fetchAllBrands)

module.exports = router;

