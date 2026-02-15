import multer from "multer";
import path from "path";

console.log("🔄 Multer configuration loaded with variant_0_images support");

const storage = multer.memoryStorage()


// For single image upload
const uploadSingle = multer({ storage: storage }).single("image");

// For multiple images upload
const uploadMultiple = multer({ storage: storage }).array("images", 10);

// For product creation - handles both main images and variant images
const uploadProductImages = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        console.log("=== MULTER FILE FILTER ===");
        console.log("Received file field:", file.fieldname);
        console.log("File details:", {
            fieldname: file.fieldname,
            originalname: file.originalname,
            mimetype: file.mimetype
        });

        console.log("file>>>> in po=roduct", file);
        const fieldName = file.fieldname;

        // Accept main images field
        if (fieldName === 'images') {
            console.log("✅ Accepting images field");
            cb(null, true);
        }
        // Accept single image field
        else if (fieldName === 'image') {
            console.log("✅ Accepting single image field");
            cb(null, true);
        }
        // Accept legacy variantImages field
        else if (fieldName === 'variantImages') {
            console.log("✅ Accepting legacy variantImages field");
            cb(null, true);
        }
        // Accept specific variant fields
        else if (fieldName === 'variant_0_images') {
            console.log("✅ Accepting variant_0_images field");
            cb(null, true);
        }
        else if (fieldName === 'variant_1_images') {
            console.log("✅ Accepting variant_1_images field");
            cb(null, true);
        }
        else if (fieldName === 'variant_2_images') {
            console.log("✅ Accepting variant_2_images field");
            cb(null, true);
        }
        // Accept variant images fields with regex pattern
        else if (/^variant_\d+_images$/.test(fieldName)) {
            console.log("✅ Accepting variant images field via regex:", fieldName);
            cb(null, true);
        }
        // Accept any field that ends with _images (more flexible)
        else if (fieldName.endsWith('_images')) {
            console.log("✅ Accepting field ending with _images:", fieldName);
            cb(null, true);
        }
        else {
            console.log("❌ REJECTING field:", fieldName);
            console.log("Available patterns:");
            console.log("- images");
            console.log("- image");
            console.log("- variantImages");
            console.log("- variant_0_images, variant_1_images, etc.");
            console.log("- any field ending with _images");
            cb(new Error(`Unexpected field: ${fieldName}`), false);
        }
    }
}).any();

// For QR image upload (single image)
const uploadQR = multer({ storage: storage }).single("qrImage");

export { uploadSingle, uploadMultiple, uploadProductImages, uploadQR };