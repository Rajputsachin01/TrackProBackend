const CareerContentModel = require("../models/careerContentModel");
const Helper = require("../utils/helper");

// Create Career Content
const createCareerContent = async (req, res) => {
  try {
    const { sections } = req.body;

    if (!sections || !Array.isArray(sections) || sections.length === 0) {
      return Helper.fail(res, "Sections must be a non-empty array");
    }

    for (const sec of sections) {
      if (!sec.title || !sec.content) {
        return Helper.fail(res, "Each section must have a title and content");
      }
    }

    const created = await CareerContentModel.create({
      sections,
    });

    return Helper.success(res, "Career content created successfully", created);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};

// Update Career Content
const updateCareerContent = async (req, res) => {
  try {
    const id = req.params.id;
    const { sections } = req.body;

    const existing = await CareerContentModel.findById(id);
    if (!existing || existing.isDeleted) {
      return Helper.fail(res, "Career content does not exist");
    }

    if (!sections || !Array.isArray(sections) || sections.length === 0) {
      return Helper.fail(res, "Sections must be a non-empty array");
    }

    for (const sec of sections) {
      if (!sec.title || !sec.content) {
        return Helper.fail(res, "Each section must have a title and content");
      }
    }

    existing.sections = sections;
    const updated = await existing.save();

    return Helper.success(res, "Career content updated successfully", updated);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};

// Soft Delete Career Content
const removeCareerContent = async (req, res) => {
  try {
    const { careerContentId } = req.body;

    if (!careerContentId) return Helper.fail(res, "careerContentId is required");

    const removed = await CareerContentModel.findOneAndUpdate(
      { _id: careerContentId },
      { isDeleted: true },
      { new: true }
    );

    if (!removed) return Helper.fail(res, "Content not found");

    return Helper.success(res, "Career content removed successfully");
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};

// List Career Content with pagination & search
const listingCareerContent = async (req, res) => {
  try {
    const { search, limit = 10, page = 1 } = req.body;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = { isDeleted: false };

    if (search) {
      query["sections.title"] = { $regex: search, $options: "i" };
    }

    const contents = await CareerContentModel.find(query).skip(skip).limit(parseInt(limit));
    const total = await CareerContentModel.countDocuments(query);

    const pagination = {
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      limit: parseInt(limit),
    };

    return Helper.success(res, "Career content list fetched", { contents, pagination });
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};

// Fetch all published content (no pagination)
const fetchAllCareerContent = async (req, res) => {
  try {
    const contents = await CareerContentModel.find({
      isDeleted: false,
      isPublished: true,
    });

    if (contents.length === 0) return Helper.fail(res, "No content found");

    return Helper.success(res, "Career content fetched", contents);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};

// Toggle Publish Status
const toggleIsPublished = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return Helper.fail(res, "Content ID is required");

    const content = await CareerContentModel.findById(id);
    if (!content || content.isDeleted) {
      return Helper.fail(res, "Content not found");
    }

    content.isPublished = !content.isPublished;
    await content.save();

    return Helper.success(res, `Content is now ${content.isPublished ? "published" : "unpublished"}`, content);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};

module.exports = {
  createCareerContent,
  updateCareerContent,
  removeCareerContent,
  listingCareerContent,
  fetchAllCareerContent,
  toggleIsPublished,
};
