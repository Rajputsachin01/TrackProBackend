const FaqModel = require("../models/faqModel");
const Helper = require("../utils/helper");

const createFaq = async (req, res) => {
  try {
    const { question, answer, type } = req.body;

    if (!question) return Helper.fail(res, "Question is required");
    if (!answer) return Helper.fail(res, "Answer is required");
    // if (!type) return Helper.fail(res, "Type is required");

    const createdFaq = await FaqModel.create({
      question,
      answer,
      type,
    });

    return Helper.success(res, "FAQ created successfully", createdFaq);
  } catch (err) {
    console.error(err);
    return Helper.fail(res, err.message);
  }
};

const updateFaq = async (req, res) => {
  try {
    const faqId = req.params.id;
    const { question, answer, type } = req.body;

    const faq = await FaqModel.findById(faqId);
    if (!faq || faq.isDeleted) return Helper.fail(res, "FAQ not found");

    const updatedFaq = await FaqModel.findByIdAndUpdate(
      faqId,
      { question, answer, type },
      { new: true }
    );

    return Helper.success(res, "FAQ updated", updatedFaq);
  } catch (err) {
    console.error(err);
    return Helper.fail(res, err.message);
  }
};

const removeFaq = async (req, res) => {
  try {
    const { faqId } = req.body;
    if (!faqId) return Helper.fail(res, "FAQ ID is required");

    const faq = await FaqModel.findByIdAndUpdate(
      faqId,
      { isDeleted: true },
      { new: true }
    );

    if (!faq) return Helper.fail(res, "FAQ not found");

    return Helper.success(res, "FAQ removed (soft delete)");
  } catch (err) {
    console.error(err);
    return Helper.fail(res, err.message);
  }
};

const deleteFaq = async (req, res) => {
  try {
    const faqId = req.params.id;

    const deleted = await FaqModel.findByIdAndDelete(faqId);
    if (!deleted) return Helper.fail(res, "FAQ not found");

    return Helper.success(res, "FAQ deleted permanently");
  } catch (err) {
    console.error(err);
    return Helper.fail(res, err.message);
  }
};

const listFaqs = async (req, res) => {
  try {
    const {
      search = "",
      limit = 10,
      page = 1,
      type,
    } = req.body;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {
      isDeleted: false,
      $or: [
        { question: { $regex: search, $options: "i" } },
        { answer: { $regex: search, $options: "i" } },
      ],
    };

    if (type) {
      query.type = type;
    }

    const faqs = await FaqModel.find(query)
      .sort({ createdAt: -1 }) // 👈 Always latest first
      .skip(skip)
      .limit(parseInt(limit));

    const total = await FaqModel.countDocuments(query);

    return Helper.success(res, "FAQ list fetched", {
      faqs,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    console.error(err);
    return Helper.fail(res, err.message);
  }
};






const fetchAllFaqs = async (req, res) => {
  try {
    const { type, limit = 10, page = 1, search = "", } = req.body;

    const skip = (parseInt(page) - 1) * parseInt(limit);

   let filter = {
      isDeleted: false,
      $or: [
        { question: { $regex: search, $options: "i" } },
        { answer: { $regex: search, $options: "i" } },
      ],
    };

    if (type) {
      filter.type = type;
    }

    const faqs = await FaqModel.find(filter)
      .sort({ createdAt: -1 }) // latest first
      .skip(skip)
      .limit(parseInt(limit));

    const total = await FaqModel.countDocuments(filter);

    return Helper.success(res, "FAQs fetched", {
      faqs,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    console.error(err);
    return Helper.fail(res, err.message);
  }
};
const toggleIsPublished = async (req, res) => {
  try {
    const faqId = req.params.id;
    if (!faqId) return Helper.fail(res, "Faq ID is required");

    const faq = await FaqModel.findById(faqId);
    if (!faq || faq.isDeleted) {
      return Helper.fail(res, "Faq not found or deleted");
    }

    faq.isPublished = !faq.isPublished; // toggle
    await faq.save();

    return Helper.success(res, `Faq is now ${faq.isPublished ? "published" : "unpublished"}`, faq);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};


module.exports = {
  createFaq,
  updateFaq,
  deleteFaq,
  removeFaq,
  listFaqs,
  fetchAllFaqs,
  toggleIsPublished
};
