const express = require("express");
const router = express.Router();
const subscriberController = require("../controller/subsciberController")

router.post("/create",subscriberController.createSubscriber)
module.exports = router 