import multer from "multer";
import path from "path";

console.log("🔄 Multer configuration loaded with variant_0_images support");

const storage = multer.memoryStorage()


// For single image upload
const uploadSingle = multer({ storage: storage }).single("image");

// For single video upload
const uploadVideo = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        // Accept only video files
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only video files are allowed'), false);
        }
    }
}).single("video");

// For multiple images upload
const uploadMultiple = multer({ storage: storage }).array("images", 10);

// For product creation - handles both main images and variant images
const uploadProductImages = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        // Only accept image files regardless of field name
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error(`Only image files are allowed. Received: ${file.mimetype}`), false);
        }
    }
}).any();

// For QR image upload (single image)
const uploadQR = multer({ storage: storage }).single("qrImage");

export { uploadSingle, uploadVideo, uploadMultiple, uploadProductImages, uploadQR };