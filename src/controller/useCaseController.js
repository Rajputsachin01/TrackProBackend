const UseCaseModel = require("../models/useCaseModel");
const Helper = require("../utils/helper");

const createUseCase = async (req, res) => {
  try {
    const { type, works } = req.body;

    if (!type) return Helper.fail(res, "type field is required");
    if (!works) return Helper.fail(res, "works field is required");

    const useCase = await UseCaseModel.create({ type, works });

    if (!useCase) return Helper.fail(res, "Use case not created");

    return Helper.success(res, "Use case created successfully", useCase);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};

const updateUseCase = async (req, res) => {
  try {
    const useCaseId = req.params.id;
    const { type, works } = req.body;

    const existing = await UseCaseModel.findById(useCaseId);
    if (!existing || existing.isDeleted) {
      return Helper.fail(res, "Use case not found or deleted");
    }

    const updatedData = {};
    if (type) updatedData.type = type;
    if (works) updatedData.works = works;

    const updated = await UseCaseModel.findByIdAndUpdate(
      useCaseId,
      updatedData,
      { new: true }
    );

    if (!updated) return Helper.fail(res, "Use case not updated");

    return Helper.success(res, "Use case updated successfully", updated);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};

const deleteUseCase = async (req, res) => {
  try {
    const useCaseId = req.params.id;

    if (!useCaseId) return Helper.fail(res, "Use case ID is required");

    const deleted = await UseCaseModel.findByIdAndDelete(useCaseId);

    if (!deleted) return Helper.fail(res, "Use case not found or already deleted");

    return Helper.success(res, "Use case deleted successfully");
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};

const removeUseCase = async (req, res) => {
  try {
    const { useCaseId } = req.body;

    if (!useCaseId) return Helper.fail(res, "Use case ID is required");

    const removed = await UseCaseModel.findOneAndUpdate(
      { _id: useCaseId },
      { isDeleted: true },
      { new: true }
    );

    if (!removed) return Helper.fail(res, "Use case not found");

    return Helper.success(res, "Use case removed successfully");
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};

const listingUseCases = async (req, res) => {
  try {
    const { search, type, limit = 10, page = 1 } = req.body;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query = { isDeleted: false };

    // Apply search filter
    if (search) {
      query.$or = [
        { type: { $regex: search, $options: "i" } },
        { works: { $regex: search, $options: "i" } },
      ];
    }

    // Apply type filter if provided
    if (type) {
      query.type = type;
    }

    const useCases = await UseCaseModel.find(query)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await UseCaseModel.countDocuments(query);

    if (useCases.length === 0) return Helper.fail(res, "No use cases found");

    const pagination = {
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      limit: parseInt(limit),
    };

    return Helper.success(res, "Use case listing fetched", {
      useCases,
      pagination,
    });
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};


const fetchAllUseCases = async (req, res) => {
  try {
    const { type } = req.body;

    const filter = { isDeleted: false };

    if (type) {
      filter.type = type;
    }

    const useCases = await UseCaseModel.find(filter);

    if (useCases.length === 0)
      return Helper.fail(res, "No use cases found");

    return Helper.success(res, "Use cases fetched successfully", useCases);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};


module.exports = {
  createUseCase,
  updateUseCase,
  deleteUseCase,
  removeUseCase,
  listingUseCases,
  fetchAllUseCases,
};
