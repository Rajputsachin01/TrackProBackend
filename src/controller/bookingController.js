const BookingModel = require("../models/bookingModel");
const PartnerModel = require("../models/partnerModel");
const UserModel = require("../models/userModel");
const CartModel = require("../models/categoryModel");
const Helper = require("../utils/helper");
const moment = require("moment");
const mongoose = require('mongoose')
const { autoAssignFromBookingId } = require("../utils/autoAssignPartner");
// helper function  for time slot
const generateTimeSlots = (startTime, endTime, duration) => {
  if (
    !moment(startTime, "HH:mm", true).isValid() ||
    !moment(endTime, "HH:mm", true).isValid()
  ) {
    throw new Error("Invalid time format. Use HH:mm format.");
  }
  if (duration <= 0) {
    throw new Error("Duration must be greater than 0.");
  }

  const slots = [];
  let start = moment(startTime, "HH:mm");
  const end = moment(endTime, "HH:mm");

  while (start.clone().add(duration, "minutes").isSameOrBefore(end)) {
    const slotStart = start.format("hh:mm A");
    const slotEnd = start.clone().add(duration, "minutes").format("hh:mm A");
    slots.push(`${slotStart} - ${slotEnd}`);
    start.add(duration, "minutes");
  }

  return slots;
};

const initiateBookingFromCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { cartId } = req.body;

    if (!userId) return Helper.fail(res, "User ID is required");
    if (!cartId) return Helper.fail(res, "Cart ID is required");

    const user = await UserModel.findById(userId).select("address location");
    if (!user || !user.address?.length) return Helper.fail(res, "Invalid user or address");

    const userLocation = user.location;
    if (
      !userLocation || userLocation.type !== "Point" ||
      !Array.isArray(userLocation.coordinates) || userLocation.coordinates.length !== 2
    ) return Helper.fail(res, "Invalid user location");

    const cart = await CartModel.findOne({ _id: cartId, userId, isPurchased: false }).populate("items.serviceId");
    if (!cart || cart.items.length === 0) return Helper.fail(res, "Cart not found or empty");

    let finalPrice = 0;
    for (const item of cart.items) {
      const unitPrice = item.serviceId?.price || 0;
      finalPrice += unitPrice * item.unitQuantity;
    }

    const booking = await BookingModel.create({
      userId,
      cartId,
      address: user.address[0],
      location: userLocation,
      price: finalPrice,
      totalPrice: finalPrice, // discount logic can be added
    });

    // cart.isPurchased = true;
    // await cart.save();

    return Helper.success(res, "Booking created successfully", booking);
  } catch (err) {
    console.error(err);
    return Helper.fail(res, "Failed to create booking");
  }
};
// get location and address
const getLocationAndAddress = async (req, res) => {
  try {
    const { location, address, bookingId } = req.body;
    if (!bookingId) {
      return Helper.fail(res, "bookingId is required");
    }
    if (!location) {
      return Helper.fail(res, "location is required");
    }
    if (!address) {
      return Helper.fail(res, "address is required");
    }
    const setLocation = await BookingModel.findOneAndUpdate(
      { _id: bookingId, isDeleted: false },
      { $set: { location, address } },
      { new: true }
    );
    if (!setLocation) {
      return Helper.fail(res, "Booking not found or already deleted");
    }
    return Helper.success(
      res,
      "Booking location and address updated",
      setLocation
    );
  } catch (error) {
    return Helper.fail(res, "failed to add location and address");
  }
};
//new one 
const fetchTimeSlots = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return Helper.fail(res, "Booking ID is required");
    }

    // Step 1: Get booking from bookingId
    const booking = await BookingModel.findOne({
      _id: bookingId,
      isDeleted: false,
    });

    if (!booking || !booking.cartId) {
      return Helper.fail(res, "Cart ID not found in booking");
    }

    const cartId = booking.cartId;

    // Step 2: Get cart and populate service time
    const cart = await CartModel.findOne({
      _id: cartId,
      isDeleted: false,
    }).populate("items.serviceId", "time");

    if (!cart || !cart.items || cart.items.length === 0) {
      return Helper.fail(res, "No services found in cart");
    }

    // Step 3: Calculate total service time
    let totalTime = 0;
    for (const item of cart.items) {
      const service = item.serviceId;
      const timeInMinutes = Number(service.time);

      if (!service || isNaN(timeInMinutes)) {
        return Helper.fail(res, "Service time missing or invalid for one or more items");
      }

      totalTime += timeInMinutes;
    }

    // Step 4: Time slot generation
    const businessStart = process.env.BUSINESS_START_TIME || "09:00";
    const businessEnd = process.env.BUSINESS_END_TIME || "18:00";

    const availableMinutes = moment(businessEnd, "HH:mm").diff(
      moment(businessStart, "HH:mm"),
      "minutes"
    );

    if (totalTime > availableMinutes) {
      return Helper.fail(res, "Total service time exceeds available business hours");
    }

    const timeSlots = generateTimeSlots(businessStart, businessEnd, totalTime);

    if (timeSlots.length === 0) {
      return Helper.success(res, "No available slots for the given service duration", []);
    }

    return Helper.success(res, "Time slots generated", timeSlots);
  } catch (error) {
    console.error("❌ Error in fetchTimeSlots:", error);
    return Helper.fail(res, "Failed to generate time slots");
  }
};
// select date and time slot and saved in booking

const selectDateAndTimeslot = async (req, res) => {
  try {
    const { date, timeSlot, bookingId } = req.body;
    if (!bookingId) return Helper.fail(res, "bookingId is required");
    if (!date) return Helper.fail(res, "date is required");
    if (!timeSlot) return Helper.fail(res, "timeSlot is required");

    const dateAndTime = await BookingModel.findOneAndUpdate(
      { _id: bookingId, isDeleted: false },
      { $set: { date, timeSlot } },
      { new: true }
    );

    if (!dateAndTime) {
      return Helper.fail(res, "Booking not found or already deleted");
    }
    const assignResult = await autoAssignFromBookingId(bookingId);

    if (!assignResult.success) {
      return Helper.fail(
        res,
        "Date/time updated but partner not assigned: " + assignResult.message,
        dateAndTime
      );
    }

    return Helper.success(
      res,
      "Booking date and time updated, partner auto-assigned",
      assignResult.data
    );
  } catch (error) {
    console.error(error);
    return Helper.fail(res, "Failed to add date and time slot");
  }
};
// find booking by id
const findBookingById = async (req, res) => {
  try {
    const bookingId = req.params.id;
    if (!bookingId) {
      return Helper.fail(res, "Booking ID is required");
    }
    const booking = await BookingModel.findOne({
      _id: bookingId,
      isDeleted: false,
    })
      .select("-userId -isDeleted -createdAt -updatedAt -__v")
      .populate({
        path: "cartId",
        select: "-_id name", // optional
        populate: [
          {
            path: "items.serviceId",
          },
          {
            path: "items.categoryId",
            select: "name", // 👈 category name
          },
          {
            path: "items.subCategoryId",
            select: "name", // 👈 subcategory name
          },
        ],
      });

    if (!booking) {
      return Helper.fail(res, "Booking not found");
    }

    return Helper.success(res, "Booking found successfully", booking);
  } catch (error) {
    console.error("findBookingById error:", error);
    return Helper.fail(res, error.message);
  }
};
// update booking
const updateBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { address, location, date, timeSlot } = req.body;
    const query = {};
    if (address) {
      query.address = address;
    }
    if (location) {
      query.location = location;
    }
    if (date) {
      query.date = date;
    }
    if (timeSlot) {
      query.timeSlot = timeSlot;
    }
    const update = await BookingModel.findByIdAndUpdate(bookingId, query, {
      new: true,
    });
    if (!update) {
      return Helper.fail(res, "failed to update");
    }
    return Helper.success(res, "booking updated successfull", update);
  } catch (error) {
    return Helper.fail(res, "failed to update");
  }
};
// soft delete booking
const removeBooking = async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) {
      return Helper.fail(res, "booking id is required");
    }
    const deleted = await BookingModel.findByIdAndUpdate(
      { _id: bookingId },
      { isDeleted: true },
      { new: true }
    );
    if (!deleted) {
      return Helper.fail(res, "booking not deleted");
    }
    return Helper.success(res, "booking deleted succesfully");
  } catch (error) {
    console.log(error);
    return Helper.fail(res, "failed to delete");
  }
};
// fetch the bookings for user
const fetchUserBooking = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return Helper.fail(res, "user id is required");
    }
    const userbookings = await BookingModel.find({
      userId,
      isDeleted: false,
    }).select(
      "-_id  -cartId -paymentMode -isDeleted -createdAt -updatedAt -paymentStatus -__v"
    );
    if (!userbookings) {
      return Helper.fail(res, "no booking for the user");
    }
    return Helper.success(res, "bookings fetched successfully", userbookings);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, "failed to fetch");
  }
};
// booking history and pending
const userBookingHistoryOrPending = async (req, res) => {
  try {
    const userId = req.userId;
    const { type } = req.body;
    if (!type) {
      return Helper.fail(res, "type is required");
    }
    if (!userId) {
      return Helper.fail(res, "user id is required");
    }
    let query;
    if (type === "history" || type === "History") {
      // query = { isDeleted: false, bookingStatus: "Cancelled" || "Completed" }
      query = {
        isDeleted: false,
        bookingStatus: { $in: ["Cancelled", "Completed"] },
      };
    }
    if (type === "pending" || type === "Pending") {
      query = {
        isDeleted: false,
        bookingStatus: { $in: ["Pending", "Cancelled", "Progress"] },
      };
    }
    const result = await BookingModel.find({ userId, ...query })
      .select("-createdAt -updatedAt -isDeleted -__v")
      .populate("userId", "email phoneNo -_id ")
      .populate("serviceId", "name price -_id")
      .populate("subCategoryId", "name price -_id")
      .populate("partnerId", "name phoneNo -_id");
    if (!result) {
      return Helper.fail(res, "no result available");
    }
    return Helper.success(res, "result fetched", result);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, "failed to fetch result");
  }
};
// cancel booking
const cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    if (!bookingId) {
      return Helper.fail(res, "booking id is required");
    }
    const updateBooking = await BookingModel.findByIdAndUpdate(
      bookingId,
      { bookingStatus: "Cancelled" },
      { new: true }
    );
    if (!updateBooking || updateBooking.length === 0) {
      return Helper.fail(res, "Failed to Cancel booking!");
    }
    return Helper.success(res, "booking cancelled successfully", updateBooking);
  } catch (error) {
    return Helper.fail(res, error.message);
  }
};
// fetch all users who have booking
const usersBookingListing = async (req, res) => {
  try {
    const { limit = 3, page = 1 } = req.body;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    let matchStage = { isDeleted: false };
    const userBookedList = await BookingModel.find(matchStage)
      .populate("userId", "name email phoneNo ")
      .skip(skip)
      .limit(parseInt(limit));
    const totalBookedUsers = await BookingModel.countDocuments(matchStage);
    if (userBookedList.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No users booking found matching the criteria",
      });
    }
    const data = {
      users: userBookedList,
      pagination: {
        totalBookedUsers,
        totalPages: Math.ceil(totalBookedUsers / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    };

    return Helper.success(res, "users listing fetched", data);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, "failed to fetch users booking listing");
  }
};
const autoAssignPartner = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const result = await autoAssignFromBookingId(bookingId);

    if (!result.success) {
      return Helper.fail(res, result.message);
    }

    return Helper.success(res, result.message, result.data);
  } catch (err) {
    console.error(err);
    return Helper.error(res, "Something went wrong");
  }
};
const getNearbyPartners = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await BookingModel.findById(bookingId).populate("cartId");
    if (!booking) return Helper.fail(res, "Booking not found");

    if (!booking.cartId?.items?.length) {
      return Helper.fail(res, "No services found in cart");
    }

    const serviceIds = booking.cartId.items.map(item => item.serviceId);

    if (!booking.location?.coordinates) {
      return Helper.fail(res, "Booking location not found");
    }

    // Full match
    const fullMatchPartners = await PartnerModel.find({
      isDeleted: false,
      isAvailable: true,
      services: { $all: serviceIds },
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: booking.location.coordinates,
          },
          $maxDistance: 20000,
        },
      },
    });

    if (fullMatchPartners.length > 0) {
      return Helper.success(res, "Partners providing all services found", {
        type: "fullMatch",
        partners: fullMatchPartners,
      });
    }

    // Partial match - service wise
    const serviceWise = [];

    for (let serviceId of serviceIds) {
      const partners = await PartnerModel.find({
        isDeleted: false,
        isAvailable: true,
        services: serviceId,
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: booking.location.coordinates,
            },
            $maxDistance: 20000,
          },
        },
      }).select("name services location");

      serviceWise.push({
        serviceId,
        partners,
      });
    }

    return Helper.success(res, "Partners per service fetched", {
      type: "serviceWise",
      partners: serviceWise,
    });
  } catch (error) {
    console.error(error);
    return Helper.fail(res, error.message);
  }
};
const assignPartnerManually = async (req, res) => {
  try {
    const { bookingId, assignments } = req.body;
    // assignments = [{ serviceId: "serviceId1", partnerId: "partnerId1" }, { serviceId: "serviceId2", partnerId: "partnerId2" }, ...]

    const booking = await BookingModel.findById(bookingId);
    if (!booking) return Helper.fail(res, "Booking not found");

    if (!Array.isArray(assignments) || assignments.length === 0) {
      return Helper.fail(res, "Assignments are required");
    }

    // Validate all partners and services
    for (const { serviceId, partnerId } of assignments) {
      if (!serviceId || !partnerId) {
        return Helper.fail(res, "serviceId and partnerId are required for all assignments");
      }

      const partner = await PartnerModel.findById(partnerId);
      if (!partner || partner.isDeleted) {
        return Helper.fail(res, `Invalid or deleted partner: ${partnerId}`);
      }

      // Optionally: Check if partner provides that service
      if (!partner.services.includes(serviceId)) {
        return Helper.fail(res, `Partner ${partnerId} does not provide service ${serviceId}`);
      }
    }

    // Assign partners per service
    booking.assignedPartners = assignments;
    booking.bookingStatus = "Progress";
    await booking.save();

    return Helper.success(res, "Partners assigned successfully", booking);
  } catch (err) {
    console.error(err);
    return Helper.error(res, "Failed to assign partners");
  }
};
const bookingListing = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", bookingStatus } = req.body;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitVal = parseInt(limit);
    const userId = req.userId;




    const matchStage = { isDeleted: false };
    if (userId) {
      matchStage.userId = new mongoose.Types.ObjectId(userId);
    }

    if (bookingStatus) matchStage.bookingStatus = bookingStatus;

    const pipeline = [
      { $match: matchStage },

      // Lookup user
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },

      // Lookup partner (main assigned)
      {
        $lookup: {
          from: "partners",
          localField: "assignedPartners",
          foreignField: "_id",
          as: "partner",
        },
      },
      { $unwind: { path: "$partner", preserveNullAndEmptyArrays: true } },

      // Lookup cart
      {
        $lookup: {
          from: "carts",
          localField: "cartId",
          foreignField: "_id",
          as: "cart",
        },
      },
      { $unwind: { path: "$cart", preserveNullAndEmptyArrays: true } },

      // Populate cart items with service, category, subCategory in separate stage
      {
        $addFields: {
          "cart.items": {
            $map: {
              input: "$cart.items",
              as: "item",
              in: {
                $mergeObjects: [
                  "$$item",
                  {
                    service: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$$ROOT.servicesData",
                            as: "svc",
                            cond: { $eq: ["$$svc._id", "$$item.serviceId"] },
                          },
                        },
                        0,
                      ],
                    },
                    category: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$$ROOT.categoriesData",
                            as: "cat",
                            cond: { $eq: ["$$cat._id", "$$item.categoryId"] },
                          },
                        },
                        0,
                      ],
                    },
                    subCategory: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$$ROOT.subCategoriesData",
                            as: "subcat",
                            cond: { $eq: ["$$subcat._id", "$$item.subCategoryId"] },
                          },
                        },
                        0,
                      ],
                    },
                  },
                ],
              },
            },
          },
        },
      },

      // Preload services, categories, subcategories
      {
        $lookup: {
          from: "services",
          pipeline: [],
          as: "servicesData",
        },
      },
      {
        $lookup: {
          from: "categories",
          pipeline: [],
          as: "categoriesData",
        },
      },
      {
        $lookup: {
          from: "subcategories",
          pipeline: [],
          as: "subCategoriesData",
        },
      },

      // Assigned Partners Lookup without creating duplicates
      {
        $addFields: {
          assignedPartners: {
            $map: {
              input: "$assignedPartners",
              as: "assigned",
              in: {
                $mergeObjects: [
                  "$$assigned",
                  {
                    partner: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$$ROOT.partnersData",
                            as: "p",
                            cond: { $eq: ["$$p._id", "$$assigned.partnerId"] },
                          },
                        },
                        0,
                      ],
                    },
                    service: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$$ROOT.servicesData",
                            as: "s",
                            cond: { $eq: ["$$s._id", "$$assigned.serviceId"] },
                          },
                        },
                        0,
                      ],
                    },
                  },
                ],
              },
            },
          },
        },
      },

      // Preload all partners once
      {
        $lookup: {
          from: "partners",
          pipeline: [],
          as: "partnersData",
        },
      },

      // Search filter
      ...(search
        ? [
            {
              $match: {
                $or: [
                  { "user.name": { $regex: search, $options: "i" } },
                  { "user.email": { $regex: search, $options: "i" } },
                  { "cart.items.service.name": { $regex: search, $options: "i" } },
                  { "cart.items.category.name": { $regex: search, $options: "i" } },
                  { "cart.items.subCategory.name": { $regex: search, $options: "i" } },
                  { "partner.name": { $regex: search, $options: "i" } },
                  { "assignedPartners.partner.name": { $regex: search, $options: "i" } },
                  { "assignedPartners.service.name": { $regex: search, $options: "i" } },
                ],
              },
            },
          ]
        : []),

      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limitVal },
    ];

    // Count pipeline
    const countPipeline = [...pipeline];
    countPipeline.push({ $count: "total" });
    const countResult = await BookingModel.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    const bookings = await BookingModel.aggregate(pipeline);

    return Helper.success(res, "Booking list fetched successfully", {
      total,
      page: parseInt(page),
      limit: limitVal,
      totalPages: Math.ceil(total / limitVal),
      bookings,
    });
  } catch (error) {
    console.error(error);
    return Helper.fail(res, error.message || "Something went wrong");
  }
};
module.exports = {
  initiateBookingFromCart,
  getLocationAndAddress,
  fetchTimeSlots,
  selectDateAndTimeslot,
  findBookingById,
  autoAssignPartner,
  getNearbyPartners,
  assignPartnerManually,
  removeBooking,
  updateBooking,
  fetchUserBooking,
  userBookingHistoryOrPending,
  cancelBooking,
  usersBookingListing,
  bookingListing
};
