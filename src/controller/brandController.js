const BrandModel = require("../models/brandModel");
const Helper = require("../utils/helper");
const createBrand = async (req, res) => {
  try {
    const { logo } = req.body;

    if (!logo) return Helper.fail(res, "logo  is required");

    const brandCreated = await BrandModel.create({
      logo,
    });
    if (!brandCreated) {
      return Helper.fail(res, "Brand not created");
    }
    return Helper.success(res, "Brand created successfully", brandCreated);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};
const updateBrand = async (req, res) => {
  try {
    const brandId = req.params.id;
    const { logo } = req.body;
    const isExist = await BrandModel.findById(brandId);
    if (isExist && isExist.isDeleted == true) {
      return Helper.fail(res, "Brand no longer exist");
    }
    if (!isExist) {
      return Helper.fail(res, "Brand not exist");
    }
    let updatedBrand = {};

    if (logo) {
      updatedBrand.logo = logo;
    }
    // console.log(updatedBrand)
    const BrandUpdate = await BrandModel.findByIdAndUpdate(
      brandId,
      updatedBrand,
      {
        new: true,
      }
    );
    if (!BrandUpdate) {
      return Helper.fail(res, "Brand not updated");
    }
    return Helper.success(res, "Brand updated successfully", BrandUpdate);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, "failed to update Brand");
  }
};
// Delete Brand permanantly
const deleteBrand = async (req, res) => {
  try {
    const brandId = req.params.id;
    if (!brandId) {
      return Helper.fail(res, "Brand id required");
    }
    const isDelete = await BrandModel.findByIdAndDelete(brandId);
    if (!isDelete) {
      return Helper.fail(res, "Brand does not delete");
    }
    return Helper.success(res, "Brand deleted successfully");
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};
// Brand soft delete
const removeBrand = async (req, res) => {
  try {
    const { brandId } = req.body;
    // console.log(brandId)
    if (!brandId) {
      return Helper.fail(res, "Brand id required");
    }
    let id = { _id: brandId };
    const isRemoved = await BrandModel.findOneAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );
    if (!isRemoved) {
      return Helper.fail(res, "Brand not found");
    }
    return Helper.success(res, "Brand removed successfully");
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};
// listing Brand
const listingBrand = async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.body;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    // Fetch paginated Brands matching the search criteria
    const brandList = await BrandModel.find().skip(skip).limit(parseInt(limit));

    const totalBrands = await BrandModel.countDocuments();

    if (brandList.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Brands found for matching the criteria",
      });
    }

    // Pagination metadata
    const pagination = {
      totalBrands,
      totalPages: Math.ceil(totalBrands / limit),
      currentPage: parseInt(page),
      limit: parseInt(limit),
    };
    const data = {
      Brands: brandList,
      pagination,
    };
    return Helper.success(res, "Brand listing fetched", data);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};
// fetch all Brands
const fetchAllBrands = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.body;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitVal = parseInt(limit);
    const query = { isDeleted: false };

    const brandList = await BrandModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitVal);

    const total = await BrandModel.countDocuments(query);

    if (brandList.length === 0) {
      return Helper.fail(res, "No Brands found");
    }

    return Helper.success(res, "Brands fetched successfully", {
      brands: brandList,
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

module.exports = {
  createBrand,
  deleteBrand,
  removeBrand,
  listingBrand,
  updateBrand,
  fetchAllBrands,
};
