const TermsAndConditionModel = require("../models/termsAndConditionModel");
const Helper = require("../utils/helper");
const createTerms = async (req, res) => {
  try {
    const { heading,sections,contact } = req.body;

    if (!heading) {
      return Helper.fail(res, "heading field is required");
    }
    if (!sections || !Array.isArray(sections) || sections.length === 0) {
      return Helper.fail(res, "sections field is required and must be a non-empty array");
    }

    for (let i = 0; i < sections.length; i++) {
      const { term, condition } = sections[i];
      if (!term || !condition) {
        return Helper.fail(res, `terms and conditions required in section ${i + 1}`);
      }
    }

    const createdTerms = await TermsAndConditionModel.create({heading, sections,contact });

    if (!createdTerms) return Helper.fail(res, "Terms not created");

    return Helper.success(res, "Terms created successfully", createdTerms);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};
const updateTerms = async (req, res) => {
  try {
    const termsId = req.params.id;
    const {heading, sections,contact } = req.body;
    const isExist = await TermsAndConditionModel.findById(termsId);
    if (!isExist || isExist.isDeleted === true) {
      return Helper.fail(res, "Terms entry not found or has been deleted");
    }
    let updatedData = {};
    if (sections && Array.isArray(sections)) {
      for (let i = 0; i < sections.length; i++) {
        const { term, condition } = sections[i];
        if (!term || !condition) {
          return Helper.fail(res, `terms and conditions required in section ${i + 1}`);
        }
      }
      updatedData.sections = sections;
      updatedData.heading = heading;
      updatedData.contact = contact;
    }

    const updatedTerms = await TermsAndConditionModel.findByIdAndUpdate(termsId, updatedData, {
      new: true,
    });

    if (!updatedTerms) return Helper.fail(res, "Terms not updated");

    return Helper.success(res, "Terms updated successfully", updatedTerms);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, "Failed to update terms");
  }
};
const removeTerms = async (req, res) => {
  try {
    const termsId = req.params.id;
    const deleted = await TermsAndConditionModel.findByIdAndUpdate(
      termsId,
      { isDeleted: true },
      { new: true }
    );

    if (!deleted) return Helper.fail(res, "Failed to delete terms");

    return Helper.success(res, "Terms deleted successfully", deleted);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};
const fetchTerms = async (req, res) => {
  try {
    const terms = await TermsAndConditionModel.findOne({ isDeleted: false }).sort({ createdAt: -1 });

    if (!terms) return Helper.fail(res, "No terms found");

    return Helper.success(res, "Terms fetched successfully", terms);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};

module.exports = {
  createTerms,
  updateTerms,
  removeTerms,
  fetchTerms,
};
