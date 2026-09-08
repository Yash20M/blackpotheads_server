import { v2 as cloudinary } from 'cloudinary';
import { v4 as uuid } from "uuid";
import dotenv from "dotenv";

dotenv.config();


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
  });


const getBase64 = (file) => {
    return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  };
  
  const getResourceType = (mimetype) => {
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.startsWith('video/')) return 'video';
    return 'raw';
  };
  

  
  export const uploadFileToCloudinary = async (files = []) => {
    const uploadPromise = files.map(async (file) => {
      try {
        const base64File = getBase64(file); // Now using buffer
        const resourceType = getResourceType(file.mimetype);
  
        return new Promise((resolve, reject) => {
          cloudinary.uploader.upload(
            base64File,
            {
              resource_type: resourceType,
              public_id: uuid(),
            },
            (error, result) => {
              if (error) return reject(error);
              resolve({
                public_id: result.public_id,
                url: result.secure_url,
              });
            }
          );
        });
      } catch (err) {
        throw new Error(`Failed to process file: ${err.message}`);
      }
    });
  
    try {
      return await Promise.all(uploadPromise);
    } catch (error) {
      console.error("Error uploading files to Cloudinary:", error);
      throw new Error("Error uploading files to Cloudinary");
    }
  };
  


// Calculate discount based on total items quantity
export const calculateBulkDiscount = (totalQuantity) => {
    if (totalQuantity >= 5) return 20;  // 20% off
    if (totalQuantity >= 4) return 15;  // 15% off
    if (totalQuantity >= 3) return 10;  // 10% off
    if (totalQuantity >= 2) return 5;   // 5% off
    return 0;
};

export const calculateTotalAmount = (items=[]) => {
    // Calculate raw subtotal
    const subtotal = items.reduce((acc, item) => {
        const price = item?.priceSnapshot || item?.product?.price || 0;
        return acc + price * item?.quantity;
    }, 0);

    // Calculate total quantity for bulk discount
    const totalQuantity = items.reduce((acc, item) => acc + (item?.quantity || 0), 0);
    
    // Apply discount
    const discountPct = calculateBulkDiscount(totalQuantity);
    const discountAmount = Math.round(subtotal * discountPct / 100);
    const finalAmount = subtotal - discountAmount;

    return finalAmount;
}




export const deleteFromCloudinary = async (publicId) => {
  try {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    });
  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error);
    throw new Error("Error deleting file from Cloudinary");
  }
};
