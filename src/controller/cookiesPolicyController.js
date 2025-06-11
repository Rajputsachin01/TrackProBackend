const CookiesPolicyModel = require("../models/cookiesPolicyModel");
const Helper = require("../utils/helper");

// CREATE
const createCookiesPolicy = async (req, res) => {
  try {
    const {
      productName,
      companyName,
      effectiveDate,
      sections,
      contact,
    } = req.body;

    if (!productName) return Helper.fail(res, "productName is required");
    if (!companyName) return Helper.fail(res, "companyName is required");

    if (!sections || !Array.isArray(sections) || sections.length === 0) {
      return Helper.fail(res, "sections must be a non-empty array");
    }

    for (let i = 0; i < sections.length; i++) {
      const { title, content } = sections[i];
      if (!title || !content) {
        return Helper.fail(res, `title and content required in section ${i + 1}`);
      }
    }

    if (contact) {
      const { name, location, email, phone } = contact;
      if (!name || !location || !email || !phone) {
        return Helper.fail(res, "All contact fields (name, location, email, phone) are required");
      }
    }

    const createdPolicy = await CookiesPolicyModel.create({
      productName,
      companyName,
      effectiveDate,
      sections,
      contact,
    });

    return Helper.success(res, "CookiesPolicy created successfully", createdPolicy);
  } catch (error) {
    console.error(error);
    return Helper.fail(res, error.message);
  }
};

// UPDATE
const updateCookiesPolicy = async (req, res) => {
  try {
    const cookiesPolicyId = req.params.id;
    const {
      productName,
      companyName,
      effectiveDate,
      sections,
      contact,
      isActive,
    } = req.body;

    const existingPolicy = await CookiesPolicyModel.findById(cookiesPolicyId);
    if (!existingPolicy || existingPolicy.isDeleted) {
      return Helper.fail(res, "CookiesPolicy not found or has been deleted");
    }

    if (sections && Array.isArray(sections)) {
      for (let i = 0; i < sections.length; i++) {
        const { title, content } = sections[i];
        if (!title || !content) {
          return Helper.fail(res, `title and content required in section ${i + 1}`);
        }
      }
    }

    const updatedPolicy = await CookiesPolicyModel.findByIdAndUpdate(
      cookiesPolicyId,
      {
        productName,
        companyName,
        effectiveDate,
        sections,
        contact,
        isActive,
      },
      { new: true }
    );

    if (!updatedPolicy) return Helper.fail(res, "CookiesPolicy not updated");

    return Helper.success(res, "CookiesPolicy updated successfully", updatedPolicy);
  } catch (error) {
    console.error(error);
    return Helper.fail(res, "Failed to update CookiesPolicy");
  }
};

// DELETE (Soft Delete)
const removeCookiesPolicy = async (req, res) => {
  try {
    const cookiesPolicyId = req.params.id;
    const deleted = await CookiesPolicyModel.findByIdAndUpdate(
      cookiesPolicyId,
      { isDeleted: true },
      { new: true }
    );

    if (!deleted) return Helper.fail(res, "Failed to delete CookiesPolicy");

    return Helper.success(res, "CookiesPolicy deleted successfully", deleted);
  } catch (error) {
    console.error(error);
    return Helper.fail(res, error.message);
  }
};

// FETCH (latest non-deleted)
const fetchCookiesPolicy = async (req, res) => {
  try {
    const latestPolicy = await CookiesPolicyModel.findOne({ isDeleted: false })
      .sort({ createdAt: -1 });

    if (!latestPolicy) return Helper.fail(res, "No active CookiePolicies found");

    return Helper.success(res, "CookiesPolicy fetched successfully", latestPolicy);
  } catch (error) {
    console.error(error);
    return Helper.fail(res, error.message);
  }
};

module.exports = {
  createCookiesPolicy,
  updateCookiesPolicy,
  removeCookiesPolicy,
  fetchCookiesPolicy,
};
