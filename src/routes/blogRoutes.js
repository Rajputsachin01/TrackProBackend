const express = require("express");
const router = express.Router();
const blogController = require("../controller/blogController");
const { isAuth ,isAdmin} = require("../utils/auth");

/*--------------------------------Blog Routes-------------------------------*/
router.post("/createBlog",isAuth, isAdmin,blogController.createBlog)
router.post("/update/:id",isAuth,isAdmin, blogController.updateBlog)
router.post("/remove",isAuth, isAdmin,blogController.removeBlog)
router.post("/delete/:id",isAuth, isAdmin,blogController.deleteBlog)
router.post("/toggleIsPublished/:id", blogController.toggleIsPublished)
router.post("/listing", blogController.listingBlog)
router.post("/fetchBlogs", blogController.fetchAllBlogs)
router.post("/get-all-category", blogController.getBlogsAndCategories)
module.exports = router;

