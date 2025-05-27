
const CartModel = require("../models/categoryModel");
const BookingModel = require("../models/bookingModel");
const PartnerModel = require("../models/partnerModel");
const PartnerRequestModel = require("../models/partnerRequestModel");

const autoAssignFromBookingId = async (bookingId, maxDistanceInKm = 20000) => {
  try {
    const booking = await BookingModel.findById(bookingId);
    if (!booking) return { success: false, message: "Booking not found" };

    const location = booking.location?.coordinates;
    if (!location) return { success: false, message: "Booking location missing" };

    const cart = await CartModel.findById(booking.cartId).populate("items.serviceId", "name");
    if (!cart || !cart.items?.length) {
      return { success: false, message: "Cart not found or empty" };
    }

    const serviceIds = cart.items.map(item => item.serviceId._id.toString());

    // Step 1: Try to find ONE partner who can do all services
    const onePartnerForAll = await PartnerModel.findOne({
      isDeleted: false,
      isAvailable: true,
      services: { $all: serviceIds },
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: location },
          $maxDistance: maxDistanceInKm,
        },
      },
    });

    if (onePartnerForAll) {
      if (onePartnerForAll.autoAssign) {
        booking.partnerId = onePartnerForAll._id;
        booking.bookingStatus = "Progress";

        booking.assignedPartners = serviceIds.map(serviceId => ({
          serviceId,
          partnerId: onePartnerForAll._id,
        }));

        await booking.save();

        return {
          success: true,
          message: "All services assigned to one partner",
          data: booking,
        };
      } else {
        // Agar autoAssign false hai, ek hi request create karo
        await PartnerRequestModel.create({
          bookingId,
          partnerId: onePartnerForAll._id,
          // serviceId hata diya kyunki ek hi request me sab services cover hongi
          note: "One partner for multiple services - autoAssign false",
        });

        return {
          success: false,
          message: "Partner found but autoAssign is false — one request created for all services",
        };
      }
    }

    // Step 2: Assign nearest individual partners for each service
    const assignedPartners = [];
    for (const serviceId of serviceIds) {
      const partner = await PartnerModel.findOne({
        isDeleted: false,
        isAvailable: true,
        services: serviceId,
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: location },
            $maxDistance: maxDistanceInKm,
          },
        },
      });
      if (partner) {
        if (partner.autoAssign) {
          assignedPartners.push({ serviceId, partnerId: partner._id });
        } else {
          await PartnerRequestModel.create({
            bookingId,
            partnerId: partner._id,
            serviceId,
          });
        }
      } else {
        console.log(`No partner found for service ${serviceId} — skipping request`);
      }
    }

    if (assignedPartners.length === 0) {
      return {
        success: false,
        message: "No partners assigned. Requests have been created for available partners",
      };
    }

    booking.assignedPartners = assignedPartners;
    booking.bookingStatus = "Progress";
    await booking.save();

    return {
      success: true,
      message: "Some services auto-assigned. Others got partner requests",
      data: booking,
    };
  } catch (error) {
    console.error("autoAssignFromBookingId error:", error);
    return {
      success: false,
      message: "Something went wrong while assigning partners",
    };
  }
};


module.exports = { autoAssignFromBookingId };


