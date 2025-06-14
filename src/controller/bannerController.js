const BannerModel = require("../models/bannerModel") 
const Helper = require("../utils/helper")
//For creating banner
const createBanner = async (req, res) =>{
    try{
      const { title,  description, fileUrl } = req.body

      if(!title) return Helper.fail(res, "title field is required")
      if(!description) return Helper.fail(res, "description field is required")
      if(!fileUrl) return Helper.fail(res, "file  is required")
  
      const bannerCreated = await BannerModel.create({
          title,
          description,
          fileUrl  
      })
      if(!bannerCreated){
          return Helper.fail(res, "banner not created")
      }
      return Helper.success(res, "banner created successfully",  bannerCreated )

    } catch(error){
        console.log(error);
        return Helper.fail(res, error.message);

    }
};
// update Banner details
const updateBanner = async(req, res)=>{
  try {
    const bannerId = req.params.id
    const { title, description, fileUrl } = req.body
    const isExist = await BannerModel.findById(bannerId)
    if(isExist && isExist.isDeleted == true){
        return Helper.fail(res, "Banner no longer exist")
    }
    if(!isExist){
        return Helper.fail(res, "Banner not exist")
    }
    let updatedBanner ={}
    if(title){
        updatedBanner.title = title
    }
    if(description){
        updatedBanner.description = description
    }
    if(fileUrl){
        updatedBanner.fileUrl = fileUrl
    }
    // console.log(updatedBanner)
    const bannerUpdate = await BannerModel.findByIdAndUpdate(
        bannerId,
        updatedBanner,
        {
            new: true
        }
    )
    if(!bannerUpdate){
        return  Helper.fail(res, "banner not updated")
    }
    return  Helper.success(res, "Banner updated successfully", bannerUpdate)
  } 
  catch (error) {
    console.log(error);
        return Helper.fail(res, "failed to update banner");
  }
}
// Delete banner permanantly
const deleteBanner = async (req,res) =>{
  try {
    const bannerId = req.params.id
    if(!bannerId){
        return Helper.fail(res, "banner id required")
    }
    const isDelete = await BannerModel.findByIdAndDelete(bannerId)
    if(!isDelete){
        return Helper.fail(res, "banner does not delete") 
    }
    return Helper.success(res, "banner deleted successfully")
} catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
}
};
// Banner soft delete
const removeBanner = async (req,res) =>{
    try{
      const {bannerId} = req.body;
      // console.log(bannerId)
      if(!bannerId){
          return Helper.fail(res, "banner id required")
      }
      let id = { _id: bannerId };
      const isRemoved = await BannerModel.findOneAndUpdate(
        id,
          {isDeleted : true},
          { new: true }
      )
      if(!isRemoved){
            return Helper.fail(res, "banner not found")
        }
      return Helper.success(res, "Banner removed successfully")
    } 
    catch(error){
        console.log(error);
        return Helper.fail(res, error.message);

    }
};
// listing banner 
const listingBanner = async (req, res) => {
  try {
      const { search, limit = 3, page = 1 } = req.body;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      let matchStage = {};
      if (search) {
          matchStage.$or = [
              { title: { $regex: search, $options: "i" } }     
          ];
      }
      
      // Fetch paginated banners matching the search criteria
      const bannerList = await BannerModel.find(matchStage)
          .skip(skip)
          .limit(parseInt(limit));

      // Fetch total count for pagination info
      const totalBanners = await BannerModel.countDocuments(matchStage);

      if (bannerList.length === 0) {
          return res.status(404).json({
              success: false,
              message: "No banners found for matching the criteria"
          });
      }

      // Pagination metadata
      const pagination = {
          totalBanners,
          totalPages: Math.ceil(totalBanners / limit),
          currentPage: parseInt(page),
          limit: parseInt(limit),
      };
      const data = {
                banners: bannerList,
                pagination
            }
      return Helper.success(res, "banner listing fetched", data)

  } 
  catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};
// fetch all banners
const fetchAllBanners = async (req, res) => {
    try {     
        const bannerList = await BannerModel.find({ isDeleted: false });
        if (bannerList.length === 0) {
            return Helper.fail(res, "No banners found");
        }
        return Helper.success(res, "Banners fetched successfully", bannerList);
    } 
    catch (error) {
      console.log(error);
      return Helper.fail(res, error.message);
    }
};
module.exports = {  
    createBanner,
    deleteBanner,
    removeBanner,
    listingBanner,
    updateBanner,
    fetchAllBanners
};


