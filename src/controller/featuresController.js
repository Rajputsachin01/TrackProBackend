const FeatureModel = require("../models/featureModel") 
const Helper = require("../utils/helper")
//For creating features
const createFeature = async (req, res) =>{
    try{
      const { title,  description, icon } = req.body

      if(!title) return Helper.fail(res, "title field is required")
      if(!description) return Helper.fail(res, "description field is required")
      if(!icon) return Helper.fail(res, "icon  is required")
  
      const featureCreated = await FeatureModel.create({
          title,
          description,
          icon  
      })
      if(!featureCreated){
          return Helper.fail(res, "feature not created")
      }
      return Helper.success(res, "feature created successfully",  featureCreated )

    } catch(error){
        console.log(error);
        return Helper.fail(res, error.message);

    }
};
// update features details
const updateFeature = async(req, res)=>{
  try {
    const featureId = req.params.id
    const { title, description, icon } = req.body
    const isExist = await FeatureModel.findById(featureId)
    if(isExist && isExist.isDeleted == true){
        return Helper.fail(res, "Feature no longer exist")
    }
    if(!isExist){
        return Helper.fail(res, "Feature not exist")
    }
    let updatedFeature ={}
    if(title){
        updatedFeature.title = title
    }
    if(description){
        updatedFeature.description = description
    }
    if(icon){
        updatedFeature.icon = icon
    }
    const featureUpdate = await FeatureModel.findByIdAndUpdate(
        featureId,
        updatedFeature,
        {
            new: true
        }
    )
    if(!featureUpdate){
        return  Helper.fail(res, "feature not updated")
    }
    return  Helper.success(res, "Feature updated successfully", featureUpdate)
  } 
  catch (error) {
    console.log(error);
        return Helper.fail(res, "failed to update feature");
  }
}
// Delete features permanantly
const deleteFeature = async (req,res) =>{
  try {
    const featureId = req.params.id
    if(!bannerId){
        return Helper.fail(res, "feature id required")
    }
    const isDelete = await FeatureModel.findByIdAndDelete(featureId)
    if(!isDelete){
        return Helper.fail(res, "feature does not delete") 
    }
    return Helper.success(res, "feature deleted successfully")
} catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
}
};
// features soft delete
const removeFeature = async (req,res) =>{
    try{
      const {featureId} = req.body;
      if(!featureId){
          return Helper.fail(res, "feature id required")
      }
      let id = { _id: featureId };
      const isRemoved = await FeatureModel.findOneAndUpdate(
        id,
          {isDeleted : true},
          { new: true }
      )
      if(!isRemoved){
            return Helper.fail(res, "feature not found")
        }
      return Helper.success(res, "feature removed successfully")
    } 
    catch(error){
        console.log(error);
        return Helper.fail(res, error.message);

    }
};
// listing features 
const listingFeatures = async (req, res) => {
  try {
      const { search, limit = 3, page = 1 } = req.body;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Building the query with search and isDeleted filter
      let matchStage = { isDeleted: false };
      if (search) {
          matchStage.$or = [
              { title: { $regex: search, $options: "i" } }     
          ];
      }
      
      // Fetch paginated features matching the search criteria
      const featureList = await FeatureModel.find(matchStage)
          .skip(skip)
          .limit(parseInt(limit));

      // Fetch total count for pagination info
      const totalFeatures = await FeatureModel.countDocuments(matchStage);

      if (featureList.length === 0) {
          return res.status(404).json({
              success: false,
              message: "No features found for matching the criteria"
          });
      }

      // Pagination metadata
      const pagination = {
          totalFeatures,
          totalPages: Math.ceil(totalFeatures / limit),
          currentPage: parseInt(page),
          limit: parseInt(limit),
      };
      const data = {
                features: featureList,
                pagination
            }
      return Helper.success(res, "Features listing fetched", data)

  } 
  catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};
// fetch all features
const fetchAllFeatures = async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.body;

    const parsedLimit = parseInt(limit);
    const parsedPage = parseInt(page);
    const skip = (parsedPage - 1) * parsedLimit;

    const query = { isDeleted: false };

    const featureList = await FeatureModel.find(query)
      .skip(skip)
      .limit(parsedLimit);

    if (featureList.length === 0) {
      return Helper.fail(res, "No Features found");
    }

    const totalFeatures = await FeatureModel.countDocuments(query);

    const pagination = {
      total: totalFeatures,
      totalPages: Math.ceil(totalFeatures / parsedLimit),
      currentPage: parsedPage,
      limit: parsedLimit,
    };

    return Helper.success(res, "Features fetched successfully", {
      features: featureList,
      pagination,
    });
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};

module.exports = {  
    createFeature,
    deleteFeature,
    removeFeature,
    listingFeatures,
    updateFeature,
    fetchAllFeatures
};


