import Offer from "../models/Offer.js";
import { TSHIRT_CATEGORIES } from "../models/Product.js";
import { uploadFileToCloudinary, deleteFromCloudinary } from "../utils/utility.js";

/**
 * Create new offer (Admin only)
 */
const createOffer = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      category, 
      originalPrice, 
      discountPercentage,
      validFrom,
      validUntil,
      termsAndConditions,
      isActive
    } = req.body;


    // Validate category
    if (!Object.values(TSHIRT_CATEGORIES).includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${Object.values(TSHIRT_CATEGORIES).join(", ")}`
      });
    }

    // Validate dates
    const fromDate = new Date(validFrom);
    const untilDate = new Date(validUntil);

    if (fromDate >= untilDate) {
      return res.status(400).json({
        success: false,
        message: "validFrom must be before validUntil"
      });
    }

    // Upload image to Cloudinary
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Offer image is required"
      });
    }

    const cloudinaryResult = await uploadFileToCloudinary([req.file]);
    
    if (!cloudinaryResult || cloudinaryResult.length === 0) {
      return res.status(500).json({
        success: false,
        message: "Failed to upload image"
      });
    }

    // Calculate discounted price
    const discountedPrice = originalPrice - (originalPrice * discountPercentage / 100);

    const offer = await Offer.create({
      name,
      description,
      image: cloudinaryResult[0],
      category,
      originalPrice,
      discountPercentage,
      discountedPrice,
      validFrom: fromDate,
      validUntil: untilDate,
      termsAndConditions,
      isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json({
      success: true,
      message: "Offer created successfully",
      offer
    });
  } catch (error) {
    console.error("Error creating offer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create offer",
      error: error.message
    });
  }
};

/**
 * Get all offers (Admin)
 */
const getAllOffersAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, isActive } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    
    if (category && Object.values(TSHIRT_CATEGORIES).includes(category)) {
      query.category = category;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const offers = await Offer.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const totalOffers = await Offer.countDocuments(query);

    res.status(200).json({
      success: true,
      offers,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalOffers / limit),
      totalOffers
    });
  } catch (error) {
    console.error("Error fetching offers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch offers",
      error: error.message
    });
  }
};

/**
 * Get active offers (Public - for users)
 */
const getActiveOffers = async (req, res) => {
  try {
    const { category } = req.query;
    const now = new Date();

    let query = {
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now }
    };

    if (category && Object.values(TSHIRT_CATEGORIES).includes(category)) {
      query.category = category;
    }

    const offers = await Offer.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      offers,
      totalOffers: offers.length
    });
  } catch (error) {
    console.error("Error fetching active offers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch offers",
      error: error.message
    });
  }
};

/**
 * Get offer by ID
 */
const getOfferById = async (req, res) => {
  try {
    const { offerId } = req.params;

    const offer = await Offer.findById(offerId);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found"
      });
    }

    res.status(200).json({
      success: true,
      offer
    });
  } catch (error) {
    console.error("Error fetching offer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch offer",
      error: error.message
    });
  }
};

/**
 * Update offer (Admin only)
 */
const updateOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const updateData = { ...req.body };

    const offer = await Offer.findById(offerId);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found"
      });
    }

    // Validate category if provided
    if (updateData.category && !Object.values(TSHIRT_CATEGORIES).includes(updateData.category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${Object.values(TSHIRT_CATEGORIES).join(", ")}`
      });
    }

    // Validate dates if provided
    if (updateData.validFrom || updateData.validUntil) {
      const fromDate = new Date(updateData.validFrom || offer.validFrom);
      const untilDate = new Date(updateData.validUntil || offer.validUntil);

      if (fromDate >= untilDate) {
        return res.status(400).json({
          success: false,
          message: "validFrom must be before validUntil"
        });
      }

      updateData.validFrom = fromDate;
      updateData.validUntil = untilDate;
    }

    // Update image if provided
    if (req.file) {
      // Delete old image from Cloudinary
      if (offer.image && offer.image.public_id) {
        await deleteFromCloudinary(offer.image.public_id);
      }

      const cloudinaryResult = await uploadFileToCloudinary([req.file]);
      updateData.image = cloudinaryResult[0];
    }

    // Recalculate discounted price if needed
    if (updateData.originalPrice || updateData.discountPercentage) {
      const originalPrice = updateData.originalPrice || offer.originalPrice;
      const discountPercentage = updateData.discountPercentage || offer.discountPercentage;
      updateData.discountedPrice = originalPrice - (originalPrice * discountPercentage / 100);
    }

    const updatedOffer = await Offer.findByIdAndUpdate(
      offerId,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Offer updated successfully",
      offer: updatedOffer
    });
  } catch (error) {
    console.error("Error updating offer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update offer",
      error: error.message
    });
  }
};

/**
 * Delete offer (Admin only)
 */
const deleteOffer = async (req, res) => {
  try {
    const { offerId } = req.params;

    const offer = await Offer.findById(offerId);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found"
      });
    }

    // Delete image from Cloudinary
    if (offer.image && offer.image.public_id) {
      await deleteFromCloudinary(offer.image.public_id);
    }

    await Offer.findByIdAndDelete(offerId);

    res.status(200).json({
      success: true,
      message: "Offer deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting offer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete offer",
      error: error.message
    });
  }
};

/**
 * Toggle offer active status (Admin only)
 */
const toggleOfferStatus = async (req, res) => {
  try {
    const { offerId } = req.params;

    const offer = await Offer.findById(offerId);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found"
      });
    }

    offer.isActive = !offer.isActive;
    await offer.save();

    res.status(200).json({
      success: true,
      message: `Offer ${offer.isActive ? 'activated' : 'deactivated'} successfully`,
      offer
    });
  } catch (error) {
    console.error("Error toggling offer status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle offer status",
      error: error.message
    });
  }
};

export {
  createOffer,
  getAllOffersAdmin,
  getActiveOffers,
  getOfferById,
  updateOffer,
  deleteOffer,
  toggleOfferStatus
};
