const BlogModel = require("../models/blogModel");
const Helper = require("../utils/helper");

// Create Blog
const createBlog = async (req, res) => {
  try {
    const { title, image, category, author, publishedDate, content } = req.body;

    if (!title) return Helper.fail(res, "Title is required");
    if (!category) return Helper.fail(res, "Category is required");
    if (!content) return Helper.fail(res, "Content is required");

    const blogCreated = await BlogModel.create({
      title,
      image,
      category,
      author,
      publishedDate,
      content,
    });

    return Helper.success(res, "Blog created successfully", blogCreated);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};

// Update Blog
const updateBlog = async (req, res) => {
  try {
    const blogId = req.params.id;
    const { title, image, category, author, publishedDate, content } = req.body;

    const isExist = await BlogModel.findById(blogId);
    if (!isExist || isExist.isDeleted) {
      return Helper.fail(res, "Blog does not exist");
    }

    const updatedBlog = {};
    if (title) updatedBlog.title = title;
    if (image) updatedBlog.image = image;
    if (category) updatedBlog.category = category;
    if (author) updatedBlog.author = author;
    if (publishedDate) updatedBlog.publishedDate = publishedDate;
    if (content) updatedBlog.content = content;

    const blogUpdate = await BlogModel.findByIdAndUpdate(blogId, updatedBlog, {
      new: true,
    });

    return Helper.success(res, "Blog updated successfully", blogUpdate);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, "Failed to update Blog");
  }
};

// Delete Blog permanently
const deleteBlog = async (req, res) => {
  try {
    const blogId = req.params.id;
    if (!blogId) {
      return Helper.fail(res, "Blog ID is required");
    }

    const isDelete = await BlogModel.findByIdAndDelete(blogId);
    if (!isDelete) {
      return Helper.fail(res, "Blog could not be deleted");
    }

    return Helper.success(res, "Blog deleted successfully");
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};

// Soft Delete Blog
const removeBlog = async (req, res) => {
  try {
    const { blogId } = req.body;
    if (!blogId) {
      return Helper.fail(res, "Blog ID is required");
    }

    const isRemoved = await BlogModel.findOneAndUpdate(
      { _id: blogId },
      { isDeleted: true },
      { new: true }
    );

    if (!isRemoved) {
      return Helper.fail(res, "Blog not found");
    }

    return Helper.success(res, "Blog removed successfully");
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};

// List Blogs with pagination + search
const listingBlog = async (req, res) => {
  try {
    const { search, category, limit = 3, page = 1 } = req.body;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let matchStage = { isDeleted: false };

    // Search filter
    if (search) {
      matchStage.$or = [
        { title: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
      ];
    }

    // Category filter
    if (category) {
      matchStage.category = { $in: [category] };
    }

    const BlogList = await BlogModel.find(matchStage)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalBlogs = await BlogModel.countDocuments(matchStage);

    if (BlogList.length === 0) {
      return Helper.fail(res, "No Blogs found");
    }

    const pagination = {
      totalBlogs,
      totalPages: Math.ceil(totalBlogs / limit),
      currentPage: parseInt(page),
      limit: parseInt(limit),
    };

    return Helper.success(res, "Blog listing fetched", {
      Blogs: BlogList,
      pagination,
    });
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};

// Fetch All Blogs with pagination
const fetchAllBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, category } = req.body;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitVal = parseInt(limit);

    let query = { isDeleted: false, isPublished: true };

    // Category filter
    if (category) {
      query.category = { $in: [category] };
    }

    const BlogList = await BlogModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitVal);

    const total = await BlogModel.countDocuments(query);

    if (BlogList.length === 0) {
      return Helper.fail(res, "No Blogs found");
    }

    return Helper.success(res, "Blogs fetched successfully", {
      Blogs: BlogList,
      pagination: {
        total,
        totalPages: Math.ceil(total / limitVal),
        currentPage: parseInt(page),
        limit: limitVal,
      },
    });
  } catch (error) {
    console.error(error);
    return Helper.fail(res, error.message);
  }
};

const toggleIsPublished = async (req, res) => {
  try {
    const blogId = req.params.id;
    if (!blogId) return Helper.fail(res, "blogId is required");

    const blog = await BlogModel.findById(blogId);
    if (!blog || blog.isDeleted) {
      return Helper.fail(res, "blog not found or deleted");
    }

    blog.isPublished = !blog.isPublished;
    await blog.save();

    return Helper.success(
      res,
      `blog is now ${blog.isPublished ? "published" : "unpublished"}`,
      blog
    );
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};

module.exports = {
  createBlog,
  updateBlog,
  deleteBlog,
  removeBlog,
  listingBlog,
  fetchAllBlogs,
  toggleIsPublished,
};
