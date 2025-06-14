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
    const page = parseInt(req.body.page) || 1;
    const limit = parseInt(req.body.limit) || 10; 
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

// const listSolutions = async (req, res) => {
//   try {
//     const page = parseInt(req.body.page) || 1;
//     const limit = parseInt(req.body.limit) || 10;
//     const skip = (page - 1) * limit;
//     let query = {};
//     if (req.body.type) {
//       query.type = req.body.type;
//     }

//     const [data, total] = await Promise.all([
//       SolutionModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
//       SolutionModel.countDocuments(),
//     ]);

//     return Helper.success(res, "Solutions fetched", {
//       total,
//       page,
//       limit,
//       totalPages: Math.ceil(total / limit),
//       data,
//     });
//   } catch (error) {
//     console.error(error);
//     return Helper.fail(res, error.message);
//   }
// };

const listingSolutions = async (req, res) => {
  try {
    const { search, type, limit = 3, page = 1 } = req.body;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let matchStage = { isDeleted: false };

    if (search) {
      matchStage.$or = [
        { title: { $regex: search, $options: "i" } },
      ];
    }

    if (type) {
      matchStage.type = { $in: [type] };
    }

    const solutionsList = await SolutionModel.find(matchStage)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalSolutions = await SolutionModel.countDocuments(matchStage);

    if (solutionsList.length === 0) {
      return Helper.fail(res, "No Solutions found");
    }

    const pagination = {
      totalSolutions,
      totalPages: Math.ceil(totalSolutions / limit),
      currentPage: parseInt(page),
      limit: parseInt(limit),
    };

    return Helper.success(res, "Blog listing fetched", {
      solutions: solutionsList,
      pagination,
    });
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};

const fetchAllSolutions = async (req, res) => {
  try {
    const { page = 1, limit = 10, type } = req.body;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitVal = parseInt(limit);

    let query = { isDeleted: false, isPublished: true };

    if (type) {
      query.type = { $in: [type] };
    }

    const solutionList = await SolutionModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitVal);

    const total = await SolutionModel.countDocuments(query);

    if (solutionList.length === 0) {
      return Helper.fail(res, "No Solutions found");
    }

    return Helper.success(res, "Solutions fetched successfully", {
      Solutions: solutionList,
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
    const solutionId = req.params.id;
    if (!solutionId) return Helper.fail(res, "solutionId is required");

    const solution = await SolutionModel.findById(solutionId);
    if (!solution || solution.isDeleted) {
      return Helper.fail(res, "solution not found or deleted");
    }

    solution.isPublished = !solution.isPublished;
    await solution.save();

    return Helper.success(
      res,
      `solution is now ${solution.isPublished ? "published" : "unpublished"}`,
      solution
    );
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};



const fetchAllSolutionTypes = async (req, res) => {
  try {
    const result = await SolutionModel.aggregate([
      { $match: { isDeleted: false } },
      { $unwind: "$type" },
      { $group: { _id: "$type" } },
      { $sort: { _id: 1 } }
    ]);

    const uniqueTypes = result.map(item => item._id);

    return Helper.success(res,"Unique types fetched", uniqueTypes);
  } catch (error) {
    console.error("Error fetching unique types:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};





const createQuery = async (req, res) => {
  try {
    const { type, name, email, phoneNo, companyName, message,isDemo } = req.body;

    if (!type || !name || !email ) {
      return Helper.fail(res, "type, name, and email are required");
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
    const { type, page = 1, limit = 10, search = "" } = req.body;

    const query = {};

    // Apply type filter if provided
    if (type) query.type = type;

    // Apply search filter on name or email (case-insensitive)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { type: { $regex: search, $options: "i" } }, // optional: to allow searching by type as well
      ];
    }

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
  listingSolutions,
  toggleIsPublished,
  fetchAllSolutionTypes,
  deleteSolution,
  fetchAllSolutions,
  createQuery,
  listQueries,
  deleteQuery,
  markQueryAsRead,
};
