const DemoVideoModel = require("../models/demoVideoModel");
const Helper = require("../utils/helper");
const createDemoVideo = async (req, res) => {
  try {
    const { title, fileUrl } = req.body;

    if (!title) return Helper.fail(res, "title field is required");
    if (!fileUrl) return Helper.fail(res, "file  is required");

    const demoVideoCreated = await DemoVideoModel.create({
      title,
      fileUrl,
    });
    if (!demoVideoCreated) {
      return Helper.fail(res, "demoVideo not created");
    }
    return Helper.success(
      res,
      "demoVideo created successfully",
      demoVideoCreated
    );
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};
const updateDemoVideo = async (req, res) => {
  try {
    const demoVideoId = req.params.id;
    const { title, fileUrl } = req.body;
    const isExist = await DemoVideoModel.findById(demoVideoId);
    if (isExist && isExist.isDeleted == true) {
      return Helper.fail(res, "DemoVideo no longer exist");
    }
    if (!isExist) {
      return Helper.fail(res, "DemoVideo not exist");
    }
    let updatedDemoVideo = {};
    if (title) {
      updatedDemoVideo.title = title;
    }
    if (fileUrl) {
      updatedDemoVideo.fileUrl = fileUrl;
    }
    // console.log(updatedDemoVideo)
    const demoVideoUpdate = await DemoVideoModel.findByIdAndUpdate(
      demoVideoId,
      updatedDemoVideo,
      {
        new: true,
      }
    );
    if (!demoVideoUpdate) {
      return Helper.fail(res, "DemoVideo not updated");
    }
    return Helper.success(
      res,
      "DemoVideo updated successfully",
      demoVideoUpdate
    );
  } catch (error) {
    console.log(error);
    return Helper.fail(res, "failed to update DemoVideo");
  }
};
const deleteDemoVideo = async (req, res) => {
  try {
    const demoVideoId = req.params.id;
    if (!demoVideoId) {
      return Helper.fail(res, "DemoVideo id required");
    }
    const isDelete = await DemoVideoModel.findByIdAndDelete(demoVideoId);
    if (!isDelete) {
      return Helper.fail(res, "DemoVideo does not delete");
    }
    return Helper.success(res, "DemoVideo deleted successfully");
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};
const removeDemoVideo = async (req, res) => {
  try {
    const { demoVideoId } = req.body;
    if (!demoVideoId) {
      return Helper.fail(res, "DemoVideo id required");
    }
    let id = { _id: demoVideoId };
    const isRemoved = await DemoVideoModel.findOneAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );
    if (!isRemoved) {
      return Helper.fail(res, "DemoVideo not found");
    }
    return Helper.success(res, "DemoVideo removed successfully");
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};
const listingDemoVideo = async (req, res) => {
  try {
    const { search, limit = 3, page = 1 } = req.body;
    console.log(search);
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Building the query with search and isDeleted filter
    let matchStage = { isDeleted: false };
    if (search) {
      matchStage.$or = [{ title: { $regex: search, $options: "i" } }];
    }

    // Fetch paginated banners matching the search criteria
    const demoVideoList = await DemoVideoModel.find(matchStage)
      .skip(skip)
      .limit(parseInt(limit));

    // Fetch total count for pagination info
    const totalDemoVideos = await DemoVideoModel.countDocuments(matchStage);

    if (demoVideoList.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No DemoVideo found for matching the criteria",
      });
    }

    // Pagination metadata
    const pagination = {
      totalDemoVideos,
      totalPages: Math.ceil(totalDemoVideos / limit),
      currentPage: parseInt(page),
      limit: parseInt(limit),
    };
    const data = {
      demoVideos: demoVideoList,
      pagination,
    };
    return Helper.success(res, "DemoVideo listing fetched", data);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};
const fetchAllDemoVideos = async (req, res) => {
  try {
    const demoVideoList = await DemoVideoModel.find({
      isDeleted: false,
      isPublished: true,
    });
    if (demoVideoList.length === 0) {
      return Helper.fail(res, "No DemoVideo found");
    }
    return Helper.success(
      res,
      "DemoVideos fetched successfully",
      demoVideoList
    );
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};
const toggleIsPublished = async (req, res) => {
  try {
    const { demoVideoId } = req.body;
    if (!demoVideoId) {
      return Helper.fail(res, "DemoVideoId is Required");
    }
    const demoVideo = await DemoVideoModel.findById(demoVideoId);
    if (!demoVideo) {
      return Helper.fail(Res, "demoVideo not found");
    }
    const newStatus = !demoVideo.isPublished;
    demoVideo.isPublished = newStatus;
    await demoVideo.save();
    return Helper.success(
      res,
      `DemoVideo is Now ${newStatus ? "Published" : "UnPublished"}`,
      { demoVideoId: demoVideo._id, isPublished: demoVideo.isPublished }
    );
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};
module.exports = {
  createDemoVideo,
  deleteDemoVideo,
  removeDemoVideo,
  listingDemoVideo,
  updateDemoVideo,
  fetchAllDemoVideos,
  toggleIsPublished
};
