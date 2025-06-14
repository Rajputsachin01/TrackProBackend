const SubscriberModel = require("../models/subscriberModel");
const Helper = require("../utils/helper");

const createSubscriber = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return Helper.fail(res, "Email is required");

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailRegex.test(email)) {
      return Helper.fail(res, "Email is not valid!");
    }

    const existingSubscriber = await SubscriberModel.findOne({ email });
    if (existingSubscriber) {
      return Helper.fail(res, "Email already subscribed, please use another email.");
    }

    const subscriberCreated = await SubscriberModel.create({ email });

    if (!subscriberCreated) {
      return Helper.fail(res, "Subscription failed");
    }

    return Helper.success(res, "Subscribed successfully", subscriberCreated);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};

module.exports= {createSubscriber}
