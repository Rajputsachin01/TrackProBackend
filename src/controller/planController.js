const PlanModel = require("../models/planModel");
const Helper = require("../utils/helper");

// Create a Plan
const createPlan = async (req, res) => {
  try {
    const { name, type, pricing, durationInDays, features } = req.body;

    if (!name) return Helper.fail(res, "Name field is required");
    if (!type) return Helper.fail(res, "Type field is required");
    if (!["Free", "Paid"].includes(type)) return Helper.fail(res, "Type must be 'Free' or 'Paid'");

    // Features validation (optional)
    if (features && !Array.isArray(features)) {
      return Helper.fail(res, "Features must be an array");
    }

    const planCreated = await PlanModel.create({
      name,
      type,
      pricing,
      durationInDays,
      features,
    });

    if (!planCreated) {
      return Helper.fail(res, "Plan not created");
    }

    return Helper.success(res, "Plan created successfully", planCreated);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};

// Update a Plan
const updatePlan = async (req, res) => {
  try {
    const planId = req.params.id;
    const { name, type, pricing, durationInDays, features } = req.body;

    const existingPlan = await PlanModel.findById(planId);
    if (!existingPlan || existingPlan.isDeleted) {
      return Helper.fail(res, "Plan does not exist");
    }

    let updatedData = {};
    if (name) updatedData.name = name;
    if (type) {
      if (!["Free", "Paid"].includes(type)) {
        return Helper.fail(res, "Type must be 'Free' or 'Paid'");
      }
      updatedData.type = type;
    }
    if (pricing !== undefined) updatedData.pricing = pricing;
    if (durationInDays !== undefined) updatedData.durationInDays = durationInDays;
    if (features !== undefined) {
      if (!Array.isArray(features)) {
        return Helper.fail(res, "Features must be an array");
      }
      updatedData.features = features;
    }

    const updatedPlan = await PlanModel.findByIdAndUpdate(planId, updatedData, { new: true });

    if (!updatedPlan) {
      return Helper.fail(res, "Plan not updated");
    }

    return Helper.success(res, "Plan updated successfully", updatedPlan);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, "Failed to update plan");
  }
};

// Hard delete Plan (permanent delete)
const deletePlan = async (req, res) => {
  try {
    const planId = req.params.id;

    if (!planId) return Helper.fail(res, "Plan ID is required");

    const deletedPlan = await PlanModel.findByIdAndDelete(planId);

    if (!deletedPlan) return Helper.fail(res, "Plan not found or already deleted");

    return Helper.success(res, "Plan deleted successfully");
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};

// Soft delete Plan (mark isDeleted = true)
const removePlan = async (req, res) => {
  try {
    const { planId } = req.body;

    if (!planId) return Helper.fail(res, "Plan ID is required");

    const removedPlan = await PlanModel.findOneAndUpdate(
      { _id: planId },
      { isDeleted: true },
      { new: true }
    );

    if (!removedPlan) return Helper.fail(res, "Plan not found");

    return Helper.success(res, "Plan removed successfully");
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};

// List Plans with pagination & search
const listingPlans = async (req, res) => {
  try {
    const { search, limit = 10, page = 1 } = req.body;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    let query = { isDeleted: false };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { type: { $regex: search, $options: "i" } },
        // You can add more fields to search on if needed
      ];
    }

    const plans = await PlanModel.find(query)
      .skip(skip)
      .limit(parseInt(limit));

    const totalPlans = await PlanModel.countDocuments(query);

    if (plans.length === 0) {
      return Helper.fail(res, "No plans found matching criteria");
    }

    const pagination = {
      totalPlans,
      totalPages: Math.ceil(totalPlans / limit),
      currentPage: parseInt(page),
      limit: parseInt(limit),
    };

    const data = { plans, pagination };

    return Helper.success(res, "Plans listing fetched", data);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};

// Fetch all Plans (no pagination)
const fetchAllPlans = async (req, res) => {
  try {
    const plans = await PlanModel.find({ isDeleted: false, isPublished: true });

    if (plans.length === 0) return Helper.fail(res, "No plans found");

    return Helper.success(res, "Plans fetched successfully", plans);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};
const toggleIsPublished = async (req, res) => {
  try {
    const planId = req.params.id;
    if (!planId) return Helper.fail(res, "Plan ID is required");

    const plan = await PlanModel.findById(planId);
    if (!plan || plan.isDeleted) {
      return Helper.fail(res, "Plan not found or deleted");
    }

    plan.isPublished = !plan.isPublished; // toggle
    await plan.save();

    return Helper.success(res, `Plan is now ${plan.isPublished ? "published" : "unpublished"}`, plan);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};



const comparePlanFeatures = async (req, res) => {
  try {
    const plans = await PlanModel.find({ isDeleted: false, isPublished: true });

    if (!plans.length) {
      return Helper.fail(res, "No plans found");
    }

    // Step 1: Collect all unique feature names
    const allFeatureNames = new Set();
    plans.forEach(plan => {
      plan.features.forEach(feature => {
        allFeatureNames.add(feature.name);
      });
    });

    const featureList = Array.from(allFeatureNames);

    // Step 2: Build comparison result
    const comparison = featureList.map(featureName => {
      const row = { feature: featureName };

      plans.forEach(plan => {
        const matched = plan.features.find(f => f.name === featureName);
        row[plan.name] = matched ? matched.isIncluded : false;
      });

      return row;
    });

    return Helper.success(res, "Feature comparison generated", comparison);
  } catch (err) {
    console.error(err);
    return Helper.fail(res, err.message);
  }
};


const getFeatureComparison = async (req, res) => {
  try {
    const plans = await PlanModel.find({ isDeleted: false });

    // Set of unique feature names
    const allFeaturesSet = new Set();
    plans.forEach(plan => {
      plan.features.forEach(f => {
        allFeaturesSet.add(f.name);
      });
    });

    const allFeatures = Array.from(allFeaturesSet);

    // Prepare comparison data
    const featureComparison = allFeatures.map(featureName => {
      const planSupportMap = {};

      plans.forEach(plan => {
        const matchedFeature = plan.features.find(f => f.name === featureName);
        planSupportMap[plan.name] = matchedFeature ? matchedFeature.isIncluded : false;
      });

      return {
        name: featureName,
        plans: planSupportMap
      };
    });

    return res.json({
      status: true,
      message: "Feature comparison fetched successfully",
      data: {
        features: featureComparison
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: error.message });
  }
};



module.exports = {
  createPlan,
  updatePlan,
  deletePlan,
  removePlan,
  listingPlans,
  fetchAllPlans,
  toggleIsPublished,
  comparePlanFeatures,
  getFeatureComparison
};
