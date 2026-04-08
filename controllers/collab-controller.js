import Collab from "../models/Collab.js";

/**
 * Submit collab form (Public endpoint)
 */
const submitCollabForm = async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;

        // Validate required fields
        if (!name || !email || !phone || !message) {
            return res.status(400).json({ 
                success: false, 
                message: "All fields are required" 
            });
        }

        // Validate email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ 
                success: false, 
                message: "Please enter a valid email address" 
            });
        }

        // Validate phone format (10 digits)
        if (!/^[0-9]{10}$/.test(phone)) {
            return res.status(400).json({ 
                success: false, 
                message: "Please enter a valid 10-digit phone number" 
            });
        }

        // Create collab submission
        const collab = new Collab({
            name,
            email,
            phone,
            message,
            status: 'pending'
        });

        await collab.save();

        res.status(201).json({ 
            success: true, 
            message: "Your collaboration request has been submitted successfully. We'll get back to you soon!",
            submission: {
                _id: collab._id,
                name: collab.name,
                email: collab.email,
                createdAt: collab.createdAt
            }
        });
    } catch (err) {
        console.error("Collab submission failed:", err);
        res.status(500).json({ 
            success: false, 
            message: "Failed to submit collaboration request", 
            error: err.message 
        });
    }
};

/**
 * Get all collab submissions (Admin only)
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

        // Search by name, email, or phone
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
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
        console.error("Get collabs failed:", err);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch collaboration requests", 
            error: err.message 
        });
    }
};

/**
 * Get single collab submission by ID (Admin only)
 */
const getCollabById = async (req, res) => {
    try {
        const { id } = req.params;

        const collab = await Collab.findById(id);

        if (!collab) {
            return res.status(404).json({ 
                success: false, 
                message: "Collaboration request not found" 
            });
        }

        res.status(200).json({ 
            success: true, 
            collab 
        });
    } catch (err) {
        console.error("Get collab failed:", err);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch collaboration request", 
            error: err.message 
        });
    }
};

/**
 * Update collab submission status (Admin only)
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
                message: "Collaboration request not found" 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: "Status updated successfully", 
            collab 
        });
    } catch (err) {
        console.error("Update collab status failed:", err);
        res.status(500).json({ 
            success: false, 
            message: "Failed to update status", 
            error: err.message 
        });
    }
};

/**
 * Delete collab submission (Admin only)
 */
const deleteCollab = async (req, res) => {
    try {
        const { id } = req.params;

        const collab = await Collab.findByIdAndDelete(id);

        if (!collab) {
            return res.status(404).json({ 
                success: false, 
                message: "Collaboration request not found" 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: "Collaboration request deleted successfully" 
        });
    } catch (err) {
        console.error("Delete collab failed:", err);
        res.status(500).json({ 
            success: false, 
            message: "Failed to delete collaboration request", 
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
