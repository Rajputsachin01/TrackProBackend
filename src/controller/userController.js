const UserModel = require("../models/userModel");
const { signInToken } = require("../utils/auth");
const Helper = require("../utils/helper");
const bcrypt = require("bcrypt");
const saltRounds = 10;
async function getUserWithToken(userId, type) {
  try {
    let userDetail = await userProfile(userId);
    const token = signInToken(userId, type);
    return { token: token, userDetail: userDetail };
  } catch (error) {
    console.log(error);
    return {};
  }
}
const userProfile = async (userId) => {
  try {
    let userProfile = await UserModel.findById(userId).select({
      password: 0,
      __v: 0,
      createdAt: 0,
      updatedAt: 0,
    });
    return userProfile;
  } catch (error) {
    return false;
  }
};
//for generating 4 digit random otp
const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();
//For creating user

const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phoneNo,
    } = req.body;
    if (!name) return Helper.fail(res, "name is required");
    if (!email) return Helper.fail(res, "email is required");
    if (!password) return Helper.fail(res, "password is required");
    if (!phoneNo) return Helper.fail(res, "phoneNo is required");
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailRegex.test(email)) return Helper.fail(res, "Email is not valid!");
    const phoneRegex = /^\d{6,14}$/;
    if (!phoneRegex.test(phoneNo))
      return Helper.fail(res, "Phone number is not valid!");
    const existingUser = await UserModel.findOne({
      $or: [{ email }, { phoneNo }],
      isDeleted: false, 
    });

    if (existingUser) {
      return Helper.fail(
        res,
        "User already exists with this email or phone number!"
      );
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    let baseName = name.toLowerCase().replace(/\s+/g, "");
    let lastThree = String(phoneNo).slice(-3);
    let userName = `${baseName}${lastThree}`;
    let usernameExists = await UserModel.findOne({ userName });
    while (usernameExists) {
      const rand = Math.floor(100 + Math.random() * 900); 
      userName = `${baseName}${rand}`;
      usernameExists = await UserModel.findOne({ userName });
    }

    const otp = "1234"; // For dev only, replace with actual generation
    const userObj = {
      userName,
      name,
      email,
      phoneNo,
      password: hashedPassword,
      otp,
    };

    const createdUser = await UserModel.create(userObj);

    return Helper.success(res, "OTP successfully sent", createdUser);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

//for updating User
const updateUser = async (req, res) => {
  try {
    const userId = req.userId;
    const {  name, email, phoneNo } = req.body;

    if (!userId) {
      return Helper.fail(res, "User ID is missing from request");
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return Helper.fail(res, "User not found");
    }

    let objToUpdate = {};

    if (name && name !== user.name) {
      objToUpdate.name = name;
    }

    if (email && email !== user.email) {
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
      if (!emailRegex.test(email)) {
        return Helper.fail(res, "Email is not valid!");
      }

      const existingEmailUser = await UserModel.findOne({
        email: new RegExp(`^${email}$`, "i"),
        _id: { $ne: userId },
      });
      if (existingEmailUser) {
        return Helper.fail(res, "Email is already used in another account");
      }

      objToUpdate.email = email;
    }

    if (phoneNo && phoneNo !== user.phoneNo) {
      const phoneRegex = /^\d{6,14}$/;
      if (!phoneRegex.test(phoneNo)) {
        return Helper.fail(res, "Phone number is not valid!");
      }

      const existingPhoneUser = await UserModel.findOne({
        phoneNo,
        _id: { $ne: userId },
      });
      if (existingPhoneUser) {
        return Helper.fail(res, "Phone number is already used in another account");
      }

      objToUpdate.phoneNo = phoneNo;
    }
    if (Object.keys(objToUpdate).length === 0) {
      return Helper.success(res, "No changes detected in profile", user);
    }

    const updatedProfile = await UserModel.findByIdAndUpdate(userId, objToUpdate, {
      new: true,
    });

    return Helper.success(res, "User updated successfully!", updatedProfile);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};

//for soft delete User
const removeUser = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return Helper.fail(res, "Please provide User Id ");
    }
    let i = { _id: userId };
    let deleted = await UserModel.findOneAndUpdate(
      i,
      { isDeleted: true },
      { new: true }
    );
    if (!deleted) {
      return Helper.fail(res, "No user found!");
    }
    return Helper.success(res, " User deleted successfully", deleted);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};
//for fetching user profile
const fetchProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await UserModel.findById(userId).select({
      password: 0,
      __v: 0,
      createdAt: 0,
      updatedAt: 0,
    });
    if (!user) {
      return Helper.fail(res, "user not found");
    }
    return Helper.success(res, "Profile fetched successfully", user);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, "Failed to fetch profile");
  }
};
//for finding user By UserId
const findUserById = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return Helper.fail(res, "userId is required");
    }
    const user = await UserModel.findOne({ _id: userId, isDeleted: false });
    if (!user) {
      return Helper.fail(res, "User not found");
    }
    return Helper.success(res, "User found", user);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, "Failed to fetch user");
  }
};
//for verifying OTP
const verifyOTP = async (req, res) => {
  try {
    const { number, email, otp } = req.body;

    if (!otp) {
      return Helper.fail(res, "OTP is required");
    }

    if (!number && !email) {
      return Helper.fail(res, "Either phone number or email is required");
    }

    if (number) {
      const phoneRegex = /^\d{6,14}$/;
      if (!phoneRegex.test(number)) {
        return Helper.fail(res, "Phone number is not valid!");
      }
    }

    const query = {
      otp,
      ...(number ? { phoneNo: number } : {}),
      ...(email ? { email } : {}),
    };

    const user = await UserModel.findOne(query);

    if (!user) {
      return Helper.fail(res, "Invalid OTP");
    }

    const newOtp = "1234";
    await UserModel.updateOne({ _id: user._id }, { $set: { otp: newOtp } });

    const type = "user";
    const { token, userDetail } = await getUserWithToken(user._id, type);
    if (!token || !userDetail) {
      return Helper.error("Failed to generate token or get user profile");
    }

    res.cookie("token", token);
    return Helper.success(res, "Token generated successfully.", {
      token,
      userDetail,
    });
  } catch (error) {
    console.error("OTP Verification Error:", error);
    return Helper.fail(res, error.message);
  }
};

// resend OTP
const resendOTP = async (req, res) => {
  try {
    const { number } = req.body;

    if (!number) {
      return Helper.fail(res, "Please provide phone number.");
    }
    const user = await UserModel.findOne({ phoneNo: number });

    if (!user) {
      return Helper.fail(res, "User not found!");
    }
    // Generate new OTP and set expiry
    // generateOTP();
    const otp = "1234";
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await UserModel.updateOne({ _id: user._id }, { $set: { otp, otpExpires } });
    return Helper.success(res, "OTP resent successfully.");
  } catch (error) {
    console.error(error);
    return Helper.fail(res, error.message);
  }
};
// login using only phone number
const loginUser = async (req, res) => {
  try {
    const { phoneNo, email } = req.body;

    if (!phoneNo && !email) {
      return Helper.fail(res, "Either phone number or email is required");
    }

    const query = {
      isDeleted: false,
      ...(phoneNo ? { phoneNo } : {}),
      ...(email ? { email } : {})
    };

    const user = await UserModel.findOne(query);

    if (!user) {
      return Helper.fail(res, "User not found");
    }

    const newOtp = "1234"; 
    user.otp = newOtp;
    await user.save();
    return Helper.success(res, "OTP sent successfully",user.email);
  } catch (error) {
    console.error("Login Error:", error);
    return Helper.fail(res, "Failed to send OTP");
  }
};


const listingUser = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", } = req.body;

    const query = {
      isDeleted: { $ne: true },
    };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await UserModel.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    const users = await UserModel.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    return Helper.success(res, "User list fetched successfully", {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages,
      users,
    });
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};

module.exports = {
  registerUser,
  updateUser,
  removeUser,
  fetchProfile,
  findUserById,
  loginUser,
  verifyOTP,
  resendOTP,
  listingUser,
};
