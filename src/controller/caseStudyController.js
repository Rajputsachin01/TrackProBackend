const CaseStudyModel = require("../models/caseStudyModel");
const SolutionModel = require("../models/solutionModel");
const QueryModel = require("../models/queriesModel");

const Helper = require("../utils/helper");

const createCaseStudy = async (req, res) => {
  try {
    const { title, problem, solution, outcome, pdf } = req.body;

    if (!title) return Helper.fail(res, "Title is required");

    const newCaseStudy = await CaseStudyModel.create({
      title,
      problem,
      solution,
      outcome,
      pdf,
    });

    return Helper.success(res, "Case study created successfully", newCaseStudy);
  } catch (error) {
    console.error(error);
    return Helper.fail(res, error.message);
  }
};

const getAllCaseStudies = async (req, res) => {
  try {
    const page = parseInt(req.body.page) || 1; // Default page = 1
    const limit = parseInt(req.body.limit) || 10; // Default limit = 10
    const skip = (page - 1) * limit;

    const [caseStudies, total] = await Promise.all([
      CaseStudyModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      CaseStudyModel.countDocuments(),
    ]);

    return Helper.success(res, "Case studies fetched successfully", {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: caseStudies,
    });
  } catch (error) {
    console.error(error);
    return Helper.fail(res, error.message);
  }
};

const getCaseStudyById = async (req, res) => {
  try {
    const { id } = req.body;
    const caseStudy = await CaseStudyModel.findById(id);

    if (!caseStudy) return Helper.fail(res, "Case study not found");

    return Helper.success(res, "Case study fetched successfully", caseStudy);
  } catch (error) {
    console.error(error);
    return Helper.fail(res, error.message);
  }
};

const updateCaseStudy = async (req, res) => {
  try {
    const { id } = req.body;
    const { title, problem, solution, outcome, pdf } = req.body;

    const updated = await CaseStudyModel.findByIdAndUpdate(
      id,
      { title, problem, solution, outcome, pdf },
      { new: true }
    );

    if (!updated) return Helper.fail(res, "Case study not updated");

    return Helper.success(res, "Case study updated successfully", updated);
  } catch (error) {
    console.error(error);
    return Helper.fail(res, error.message);
  }
};

const deleteCaseStudy = async (req, res) => {
  try {
    const { id } = req.body;

    const deleted = await CaseStudyModel.findByIdAndDelete(id);
    if (!deleted) return Helper.fail(res, "Case study not found");

    return Helper.success(res, "Case study deleted successfully", deleted);
  } catch (error) {
    console.error(error);
    return Helper.fail(res, error.message);
  }
};

const createSolution = async (req, res) => {
  try {
    const { type, title, description } = req.body;
    if (!type || !["template", "solution"].includes(type)) {
      return Helper.fail(res, "Invalid or missing type");
    }
    if (!title) return Helper.fail(res, "Title is required");

    const solution = await SolutionModel.create({ type, title, description });
    return Helper.success(res, "Solution created successfully", solution);
  } catch (error) {
    console.error(error);
    return Helper.fail(res, error.message);
  }
};

const updateSolution = async (req, res) => {
  try {
    const { id } = req.body;
    const { type, title, description } = req.body;

    const updated = await SolutionModel.findByIdAndUpdate(
      id,
      { type, title, description },
      { new: true }
    );

    if (!updated)
      return Helper.fail(res, "Solution not found or update failed");
    return Helper.success(res, "Solution updated", updated);
  } catch (error) {
    console.error(error);
    return Helper.fail(res, error.message);
  }
};

const deleteSolution = async (req, res) => {
  try {
    const { id } = req.body;

    const deleted = await SolutionModel.findByIdAndDelete(id);
    if (!deleted) return Helper.fail(res, "Solution not found");

    return Helper.success(res, "Solution deleted", deleted);
  } catch (error) {
    console.error(error);
    return Helper.fail(res, error.message);
  }
};

const listSolutions = async (req, res) => {
  try {
    const page = parseInt(req.body.page) || 1;
    const limit = parseInt(req.body.limit) || 10;
    const skip = (page - 1) * limit;
    let query = {};
    if (req.body.type) {
      query.type = req.body.type;
    }

    const [data, total] = await Promise.all([
      SolutionModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      SolutionModel.countDocuments(),
    ]);

    return Helper.success(res, "Solutions fetched", {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data,
    });
  } catch (error) {
    console.error(error);
    return Helper.fail(res, error.message);
  }
};

const fetchAllSolutions = async (req, res) => {
  try {
    const solutions = await SolutionModel.find().sort({ createdAt: -1 });
    return Helper.success(res, "All solutions fetched", solutions);
  } catch (error) {
    console.error(error);
    return Helper.fail(res, error.message);
  }
};

const createQuery = async (req, res) => {
  try {
    const { type, name, email, phoneNo, companyName, message,isDemo } = req.body;

    if (!type || !name || !email || !phoneNo) {
      return Helper.fail(res, "type, name, email, and phoneNo are required");
    }

    const query = await QueryModel.create({
      type,
      name,
      email,
      phoneNo,
      companyName,
      message,
      isDemo
    });

    return Helper.success(res, "Query submitted successfully", query);
  } catch (error) {
    console.error(error);
    return Helper.fail(res, error.message);
  }
};

const listQueries = async (req, res) => {
  try {
    const { type, page = 1, limit = 10 } = req.body;
    const query = {};
    if (type) query.type = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [data, total] = await Promise.all([
      QueryModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      QueryModel.countDocuments(query),
    ]);

    return Helper.success(res, "Queries fetched", {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
      data,
    });
  } catch (error) {
    console.error(error);
    return Helper.fail(res, error.message);
  }
};

const deleteQuery = async (req, res) => {
  try {
    const { id } = req.body;

    const deleted = await QueryModel.findByIdAndDelete(id);
    if (!deleted) return Helper.fail(res, "Query not found");

    return Helper.success(res, "Query deleted successfully", deleted);
  } catch (error) {
    console.error(error);
    return Helper.fail(res, error.message);
  }
};

const markQueryAsRead = async (req, res) => {
  try {
    const { id } = req.body;

    const updatedQuery = await QueryModel.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!updatedQuery) {
      return Helper.fail(res, "Query not found");
    }

    return Helper.success(res, "Query marked as read", updatedQuery);
  } catch (error) {
    console.error(error);
    return Helper.fail(res, error.message);
  }
};

module.exports = {
  createCaseStudy,
  getAllCaseStudies,
  getCaseStudyById,
  updateCaseStudy,
  deleteCaseStudy,
  createSolution,
  updateSolution,
  listSolutions,
  deleteSolution,
  fetchAllSolutions,
  createQuery,
  listQueries,
  deleteQuery,
  markQueryAsRead,
};
