const PrivacyPolicyModel = require("../models/privacyPolicyModel");
const Helper = require("../utils/helper");
const createPolicy = async (req, res) => {
  try {
    const { heading,sections,contact } = req.body;

    if (!heading) {
      return Helper.fail(res, "heading field is required");
    }
    if (!sections || !Array.isArray(sections) || sections.length === 0) {
      return Helper.fail(res, "sections field is required and must be a non-empty array");
    }

    for (let i = 0; i < sections.length; i++) {
      const { title, description } = sections[i];
      if (!title || !description) {
        return Helper.fail(res, `title and description required in section ${i + 1}`);
      }
    }

    if (contact) {
          const { name, location, email, phone } = contact;
          if (!name || !location || !email || !phone) {
            return Helper.fail(res, "All contact fields (name, location, email, phone) are required");
          }
        }
    const createdPolicy = await PrivacyPolicyModel.create({heading, sections,contact });

    if (!createdPolicy) return Helper.fail(res, "PrivacyPolicy not created");

    return Helper.success(res, "PrivacyPolicy created successfully", createdPolicy);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};
const updatePolicy = async (req, res) => {
  try {
    const policyId = req.params.id;
    const {heading, sections,contact } = req.body;
    const isExist = await PrivacyPolicyModel.findById(policyId);
    if (!isExist || isExist.isDeleted === true) {
      return Helper.fail(res, "PrivacyPolicy entry not found or has been deleted");
    }
    let updatedData = {};
    if (sections && Array.isArray(sections)) {
      for (let i = 0; i < sections.length; i++) {
        const { title, description } = sections[i];
        if (!title || !description) {
          return Helper.fail(res, `title and description required in section ${i + 1}`);
        }
      }
      updatedData.sections = sections;
      updatedData.heading = heading;
      updatedData.contact = contact;
    }

    const updatedPolicy = await PrivacyPolicyModel.findByIdAndUpdate(policyId, updatedData, {
      new: true,
    });

    if (!updatedPolicy) return Helper.fail(res, "Terms not updated");

    return Helper.success(res, "PrivacyPolicy updated successfully", updatedPolicy);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, "Failed to update Policy");
  }
};
const removePolicy = async (req, res) => {
  try {
    const policyId = req.params.id;
    const deleted = await PrivacyPolicyModel.findByIdAndUpdate(
      policyId,
      { isDeleted: true },
      { new: true }
    );

    if (!deleted) return Helper.fail(res, "Failed to delete Policy");

    return Helper.success(res, "Policy deleted successfully", deleted);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};
const fetchPolicy = async (req, res) => {
  try {
    const policies = await PrivacyPolicyModel.findOne({ isDeleted: false }).sort({ createdAt: -1 });

    if (!policies) return Helper.fail(res, "No policies found");

    return Helper.success(res, "Policies fetched successfully", policies);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};

module.exports = {
  createPolicy,
  updatePolicy,
  removePolicy,
  fetchPolicy,
};
