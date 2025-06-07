
require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
require("./src/utils/db");
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

app.use(bodyParser.json()); // normal JSON parsing for other routes
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// const cron = require("node-cron");
// const expireAndReassign = require("./src/utils/expireAndReaasign");

// cron.schedule("*/1 * * * *", async () => {
//   console.log("Running partner request expiry check...");
//   await expireAndReassign();
// });


const userRoutes = require("./src/routes/userRoutes");
const termsAndConditionRoutes = require("./src/routes/termsAndConditionsRoutes");
const privacyPolicy = require("./src/routes/privacyPolicyRoutes");
const bannerRoutes = require("./src/routes/bannerRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const featureRoutes = require("./src/routes/featureRoutes");
const uploadRoutes = require("./src/routes/uploadRoutes");
const faqRoutes = require("./src/routes/faqRoutes");
const feedbackRoutes = require("./src/routes/feedbackRoutes");
const planRoutes = require("./src/routes/planRoutes");
const brandRoutes = require("./src/routes/brandRoutes");
const blogRoutes = require("./src/routes/blogRoutes");



app.use("/v1/admin", adminRoutes);
app.use("/v1/termsAndCondition", termsAndConditionRoutes);
app.use("/v1/privacyPolicy", privacyPolicy);
app.use("/v1/user", userRoutes);
app.use("/v1/banner", bannerRoutes);
app.use("/v1/upload", uploadRoutes);
app.use("/v1/faq", faqRoutes);
app.use("/v1/feedback", feedbackRoutes);
app.use("/v1/feature", featureRoutes);
app.use("/v1/plan", planRoutes);
app.use("/v1/brand", brandRoutes);
app.use("/v1/blog", blogRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
app.get("/", (req, res) => {
  res.send("Server is Active");
});







