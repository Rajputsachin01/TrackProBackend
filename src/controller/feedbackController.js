const FeedbackModel = require("../models/feedbackModel");
const UserModel = require("../models/userModel");
const Helper = require("../utils/helper");

const createFeedback = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return Helper.fail(res, "userId is required!");
    }
    const { message} = req.body;
    if (!userId) {
      return Helper.fail(res, "userId is required!");
    }
    const data = { userId,  message};
    const create = await FeedbackModel.create(data);
    if (!create) {
      return Helper.fail({ error: "data not saved" });
    }
    return Helper.success(res, "feedback submitted successfully!", create);
  } catch (error) {
    console.error(error);
    return Helper.fail(res, error.message);
  }
};
const removeFeedback = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return Helper.fail(res, "feedback id required");
    }
    const isRemoved = await FeedbackModel.findByIdAndUpdate(id, {
      isDeleted: true,
    });
    return Helper.success(res, "feedback remove Successfully", isRemoved);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};

const updateFeedback = async (req, res) => {
  try {
    const feedbackId = req.params.id;
    const {  message } = req.body;
    const isExist = await FeedbackModel.findById(feedbackId);
    if (isExist && isExist.isDeleted == true) {
      return Helper.fail(res, "Feedback no longer exist");
    }
    if (!isExist) {
      return Helper.fail(res, "feedback not exist");
    }
    let updatedFeedback = {};
 
    if (message) {
      updatedFeedback.message = message;
    }
    console.log(updatedFeedback);
    const feedbackUpdate = await FeedbackModel.findByIdAndUpdate(
      feedbackId,
      updatedFeedback,
      {
        new: true,
      }
    );
    if (!feedbackUpdate) {
      return Helper.fail(res, "feedback not updated");
    }
    return Helper.success(res, "Feedback updated successfully", feedbackUpdate);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, "failed to update feedback");
  }
};
const listFeedbacks = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10, isPublished } = req.body;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitVal = parseInt(limit);

    const matchStage = {
      isDeleted: false,
    };

    if (typeof isPublished === "boolean") {
      matchStage.isPublished = isPublished;
    }

    // Search by user name/email or message
    const users = await UserModel.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    }).select("_id");

    if (search) {
      matchStage.$or = [
        { userId: { $in: users.map((u) => u._id) } },
        { message: { $regex: search, $options: "i" } },
      ];
    }

    const feedbacks = await FeedbackModel.find(matchStage)
      .populate("userId", "name email userName img")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitVal);

    const total = await FeedbackModel.countDocuments(matchStage);

    return Helper.success(res, "Feedback list fetched", {
      feedbacks,
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

const fetchAllFeedbacks = async (req, res) => {
  try {
    const { page = 1, limit = 6 } = req.body;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitVal = parseInt(limit);

    const feedbacks = await FeedbackModel.find({
      isDeleted: false,
      isPublished: true,
    })
      .populate("userId", "name email userName img")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitVal);

    const total = await FeedbackModel.countDocuments({
      isDeleted: false,
      isPublished: true,
    });

    return Helper.success(res, "Published feedbacks fetched", {
      feedbacks,
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
    const feedbackId = req.params.id;
    if (!feedbackId) return Helper.fail(res, "feedbackId is required");

    const feedback = await FeedbackModel.findById(feedbackId);
    if (!feedback || feedback.isDeleted) {
      return Helper.fail(res, "feedback not found or deleted");
    }

    feedback.isPublished = !feedback.isPublished; // toggle
    await feedback.save();

    return Helper.success(res, `feedback is now ${feedback.isPublished ? "published" : "unpublished"}`, feedback);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};



module.exports = {
    createFeedback,
    updateFeedback,
    removeFeedback,
    toggleIsPublished,
    listFeedbacks,
    fetchAllFeedbacks
  
};