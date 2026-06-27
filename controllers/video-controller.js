import Video from "../models/Video.js";
import { uploadFileToCloudinary, deleteFromCloudinary } from "../utils/utility.js";

/**
 * Upload or update the featured video (Admin only)
 * Only one video can exist at a time
 */
const uploadFeaturedVideo = async (req, res) => {
    try {
        const { title, description } = req.body;
        const adminId = req.admin._id;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Video file is required"
            });
        }

        // Check if video file
        if (!req.file.mimetype.startsWith('video/')) {
            return res.status(400).json({
                success: false,
                message: "Only video files are allowed"
            });
        }

        console.log("📹 Uploading video to Cloudinary...");

        // Upload video to Cloudinary
        const uploadResult = await uploadFileToCloudinary([req.file]);
        const { url: videoUrl, public_id: publicId } = uploadResult[0];

        console.log("✅ Video uploaded:", { videoUrl, publicId });

        // Check if a video already exists
        const existingVideo = await Video.findOne();

        if (existingVideo) {
            // Delete old video from Cloudinary
            try {
                await deleteFromCloudinary(existingVideo.publicId);
                console.log("🗑️ Old video deleted from Cloudinary");
            } catch (error) {
                console.warn("⚠️ Failed to delete old video from Cloudinary:", error.message);
            }

            // Update existing video
            existingVideo.title = title || existingVideo.title;
            existingVideo.description = description || existingVideo.description;
            existingVideo.videoUrl = videoUrl;
            existingVideo.publicId = publicId;
            existingVideo.uploadedBy = adminId;
            existingVideo.updatedAt = new Date();

            await existingVideo.save();

            return res.status(200).json({
                success: true,
                message: "Featured video updated successfully",
                video: {
                    _id: existingVideo._id,
                    title: existingVideo.title,
                    description: existingVideo.description,
                    videoUrl: existingVideo.videoUrl,
                    isActive: existingVideo.isActive,
                    createdAt: existingVideo.createdAt,
                    updatedAt: existingVideo.updatedAt
                }
            });
        } else {
            // Create new video
            const newVideo = new Video({
                title: title || "Featured Video",
                description: description || "",
                videoUrl,
                publicId,
                uploadedBy: adminId
            });

            await newVideo.save();

            return res.status(201).json({
                success: true,
                message: "Featured video uploaded successfully",
                video: {
                    _id: newVideo._id,
                    title: newVideo.title,
                    description: newVideo.description,
                    videoUrl: newVideo.videoUrl,
                    isActive: newVideo.isActive,
                    createdAt: newVideo.createdAt,
                    updatedAt: newVideo.updatedAt
                }
            });
        }

    } catch (error) {
        console.error("❌ Video upload failed:", error);
        res.status(500).json({
            success: false,
            message: "Failed to upload video",
            error: error.message
        });
    }
};

/**
 * Get the current featured video (Public - no auth required)
 */
const getFeaturedVideo = async (req, res) => {
    try {
        const video = await Video.findOne({ isActive: true })
            .select('title description videoUrl createdAt updatedAt');

        if (!video) {
            return res.status(404).json({
                success: false,
                message: "No featured video found"
            });
        }

        res.status(200).json({
            success: true,
            video: {
                _id: video._id,
                title: video.title,
                description: video.description,
                videoUrl: video.videoUrl,
                createdAt: video.createdAt,
                updatedAt: video.updatedAt
            }
        });

    } catch (error) {
        console.error("❌ Error fetching featured video:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch featured video",
            error: error.message
        });
    }
};

/**
 * Get video details for admin (Admin only)
 */
const getVideoForAdmin = async (req, res) => {
    try {
        const video = await Video.findOne()
            .populate('uploadedBy', 'name email');

        if (!video) {
            return res.status(404).json({
                success: false,
                message: "No video found"
            });
        }

        res.status(200).json({
            success: true,
            video: {
                _id: video._id,
                title: video.title,
                description: video.description,
                videoUrl: video.videoUrl,
                isActive: video.isActive,
                uploadedBy: video.uploadedBy,
                createdAt: video.createdAt,
                updatedAt: video.updatedAt
            }
        });

    } catch (error) {
        console.error("❌ Error fetching video for admin:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch video",
            error: error.message
        });
    }
};

/**
 * Toggle video active status (Admin only)
 */
const toggleVideoStatus = async (req, res) => {
    try {
        const video = await Video.findOne();

        if (!video) {
            return res.status(404).json({
                success: false,
                message: "No video found"
            });
        }

        video.isActive = !video.isActive;
        await video.save();

        res.status(200).json({
            success: true,
            message: `Video ${video.isActive ? 'activated' : 'deactivated'} successfully`,
            video: {
                _id: video._id,
                title: video.title,
                isActive: video.isActive,
                updatedAt: video.updatedAt
            }
        });

    } catch (error) {
        console.error("❌ Error toggling video status:", error);
        res.status(500).json({
            success: false,
            message: "Failed to toggle video status",
            error: error.message
        });
    }
};

/**
 * Delete the featured video (Admin only)
 */
const deleteFeaturedVideo = async (req, res) => {
    try {
        const video = await Video.findOne();

        if (!video) {
            return res.status(404).json({
                success: false,
                message: "No video found to delete"
            });
        }

        // Delete from Cloudinary
        try {
            await deleteFromCloudinary(video.publicId);
            console.log("🗑️ Video deleted from Cloudinary");
        } catch (error) {
            console.warn("⚠️ Failed to delete video from Cloudinary:", error.message);
        }

        // Delete from database
        await Video.deleteOne({ _id: video._id });

        res.status(200).json({
            success: true,
            message: "Featured video deleted successfully"
        });

    } catch (error) {
        console.error("❌ Error deleting video:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete video",
            error: error.message
        });
    }
};

export {
    uploadFeaturedVideo,
    getFeaturedVideo,
    getVideoForAdmin,
    toggleVideoStatus,
    deleteFeaturedVideo
};