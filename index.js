
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
app.use(bodyParser.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const userRoutes = require("./src/routes/userRoutes");
const termsAndConditionRoutes = require("./src/routes/termsAndConditionsRoutes");
const privacyPolicyRoutes = require("./src/routes/privacyPolicyRoutes");
const cookiesPolicyRoutes = require("./src/routes/cookiesPolicyRoutes");
const bannerRoutes = require("./src/routes/bannerRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const featureRoutes = require("./src/routes/featureRoutes");
const uploadRoutes = require("./src/routes/uploadRoutes");
const faqRoutes = require("./src/routes/faqRoutes");
const feedbackRoutes = require("./src/routes/feedbackRoutes");
const planRoutes = require("./src/routes/planRoutes");
const brandRoutes = require("./src/routes/brandRoutes");
const blogRoutes = require("./src/routes/blogRoutes");
const caseRoutes = require("./src/routes/caseStudyRoutes");
const careerContentRoutes = require("./src/routes/careerContentRoutes");
const useCaseRoutes = require("./src/routes/useCaseRoutes");



app.use("/v1/upload", uploadRoutes);
app.use("/v1/admin", adminRoutes);
app.use("/v1/user", userRoutes);
app.use("/v1/banner", bannerRoutes);
app.use("/v1/termsAndCondition", termsAndConditionRoutes);
app.use("/v1/privacyPolicy", privacyPolicyRoutes);
app.use("/v1/cookiePolicy", cookiesPolicyRoutes);
app.use("/v1/careerContent", careerContentRoutes);
app.use("/v1/faq", faqRoutes);
app.use("/v1/feedback", feedbackRoutes);
app.use("/v1/feature", featureRoutes);
app.use("/v1/plan", planRoutes);
app.use("/v1/brand", brandRoutes);
app.use("/v1/blog", blogRoutes);
app.use("/v1/case", caseRoutes);
app.use("/v1/useCase", useCaseRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
app.get("/", (req, res) => {
  res.send("Server is Active");
});







