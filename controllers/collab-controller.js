import Collab from "../models/Collab.js";

/**
 * Submit "Join the Movement" form (Public endpoint - No login required)
 */
const submitCollabForm = async (req, res) => {
    try {
        const { name, mobile, email, instagram, vision } = req.body;

        // Validate required fields
        if (!name || !mobile || !instagram || !vision) {
            return res.status(400).json({ 
                success: false, 
                message: "Name, Mobile, Instagram, and Vision are required fields" 
            });
        }

        // Validate mobile format (10 digits)
        if (!/^[0-9]{10}$/.test(mobile)) {
            return res.status(400).json({ 
                success: false, 
                message: "Please enter a valid 10-digit mobile number" 
            });
        }

        // Validate email format if provided
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ 
                success: false, 
                message: "Please enter a valid email address" 
            });
        }

        // Validate vision length (max 100 words)
        const wordCount = vision.trim().split(/\s+/).length;
        if (wordCount > 100) {
            return res.status(400).json({ 
                success: false, 
                message: `Vision must be maximum 100 words. You have ${wordCount} words.` 
            });
        }

        // Validate Instagram handle format (remove @ if present)
        let instagramHandle = instagram.trim();
        if (instagramHandle.startsWith('@')) {
            instagramHandle = instagramHandle.substring(1);
        }

        // Create collab submission
        const collab = new Collab({
            name,
            mobile,
            email: email || undefined,
            instagram: instagramHandle,
            vision,
            status: 'pending'
        });

        await collab.save();

        res.status(201).json({ 
            success: true, 
            message: "Thank you for joining the movement! We'll get back to you soon.",
            submission: {
                _id: collab._id,
                name: collab.name,
                mobile: collab.mobile,
                instagram: collab.instagram,
                createdAt: collab.createdAt
            }
        });
    } catch (err) {
        console.error("Join the Movement submission failed:", err);
        res.status(500).json({ 
            success: false, 
            message: "Failed to submit your request. Please try again.", 
            error: err.message 
        });
    }
};

/**
 * Get all submissions (Admin only)
 */
const getAllCollabs = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            status, 
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;
        
        const skip = (page - 1) * limit;

        // Build query filters
        const query = {};

        // Filter by status
        if (status && status !== 'all') {
            query.status = status;
        }

        // Search by name, mobile, email, or instagram
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { mobile: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { instagram: { $regex: search, $options: 'i' } }
            ];
        }

        // Build sort object
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const collabs = await Collab.find(query)
            .skip(skip)
            .limit(parseInt(limit))
            .sort(sortOptions);
            
        const totalCollabs = await Collab.countDocuments(query);
        const totalPages = Math.ceil(totalCollabs / limit);

        // Get status counts
        const statusCounts = await Collab.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const counts = {
            all: totalCollabs,
            pending: 0,
            reviewed: 0,
            contacted: 0,
            rejected: 0
        };

        statusCounts.forEach(item => {
            counts[item._id] = item.count;
        });

        res.status(200).json({ 
            success: true, 
            collabs, 
            totalPages,
            currentPage: parseInt(page),
            totalCollabs,
            counts,
            filters: {
                status: status || 'all',
                search: search || '',
                sortBy,
                sortOrder
            }
        });
    } catch (err) {
        console.error("Get submissions failed:", err);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch submissions", 
            error: err.message 
        });
    }
};

/**
 * Get single submission by ID (Admin only)
 */
const getCollabById = async (req, res) => {
    try {
        const { id } = req.params;

        const collab = await Collab.findById(id);

        if (!collab) {
            return res.status(404).json({ 
                success: false, 
                message: "Submission not found" 
            });
        }

        res.status(200).json({ 
            success: true, 
            collab 
        });
    } catch (err) {
        console.error("Get submission failed:", err);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch submission", 
            error: err.message 
        });
    }
};

/**
 * Update submission status (Admin only)
 */
const updateCollabStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate status
        const validStatuses = ['pending', 'reviewed', 'contacted', 'rejected'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid status. Must be one of: pending, reviewed, contacted, rejected" 
            });
        }

        const collab = await Collab.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!collab) {
            return res.status(404).json({ 
                success: false, 
                message: "Submission not found" 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: "Status updated successfully", 
            collab 
        });
    } catch (err) {
        console.error("Update status failed:", err);
        res.status(500).json({ 
            success: false, 
            message: "Failed to update status", 
            error: err.message 
        });
    }
};

/**
 * Delete submission (Admin only)
 */
const deleteCollab = async (req, res) => {
    try {
        const { id } = req.params;

        const collab = await Collab.findByIdAndDelete(id);

        if (!collab) {
            return res.status(404).json({ 
                success: false, 
                message: "Submission not found" 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: "Submission deleted successfully" 
        });
    } catch (err) {
        console.error("Delete submission failed:", err);
        res.status(500).json({ 
            success: false, 
            message: "Failed to delete submission", 
            error: err.message 
        });
    }
};

export { 
    submitCollabForm,
    getAllCollabs,
    getCollabById,
    updateCollabStatus,
    deleteCollab
};
