const SubscriberModel = require("../models/subscriberModel");
const createSubscriber = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return Helper.fail(res, "email  is required");
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailRegex.test(email)) {
      return Helper.fail(res, "Email is not valid!");
    }
    const subscriberCreated = await SubscriberModel.create({
      email,
    });
    if (!subscriberCreated) {
      return Helper.fail(res, "Not Subscibed");
    }
    return Helper.success(res, "Subscibed successfully", subscriberCreated);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};
module.exports= {createSubscriber}
