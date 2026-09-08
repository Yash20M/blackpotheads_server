import Blog from "../models/Blog.js";
import { uploadFileToCloudinary, deleteFromCloudinary } from "../utils/utility.js";

// ─── PUBLIC ───────────────────────────────────────────────────────────────────

// GET /api/v1/blogs?page=1&limit=9
export const getAllBlogs = async (req, res) => {
    try {
        let { page = 1, limit = 9 } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);
        const skip = (page - 1) * limit;

        const total = await Blog.countDocuments({ published: true });
        const blogs = await Blog.find({ published: true })
            .select('title slug excerpt coverImage tags readTime createdAt')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            blogs,
            page,
            totalPages: Math.ceil(total / limit),
            totalBlogs: total,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/v1/blogs/:slug
export const getBlogBySlug = async (req, res) => {
    try {
        const blog = await Blog.findOne({ slug: req.params.slug, published: true });
        if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });
        res.status(200).json({ success: true, blog });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── ADMIN ────────────────────────────────────────────────────────────────────

// GET /api/admin/blogs?page=1&limit=10
export const adminGetAllBlogs = async (req, res) => {
    try {
        let { page = 1, limit = 10 } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);
        const skip = (page - 1) * limit;

        const total = await Blog.countDocuments();
        const blogs = await Blog.find()
            .select('title slug excerpt coverImage tags published readTime createdAt')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            blogs,
            page,
            totalPages: Math.ceil(total / limit),
            totalBlogs: total,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/admin/blogs/:id
export const adminGetBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });
        res.status(200).json({ success: true, blog });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/admin/blogs
export const createBlog = async (req, res) => {
    try {
        const { title, slug, excerpt, content, tags, published } = req.body;

        if (!title || !excerpt || !content) {
            return res.status(400).json({ success: false, message: "Title, excerpt and content are required" });
        }

        // Generate slug if not provided
        const finalSlug = slug
            ? slug.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')
            : title.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');

        // Check slug uniqueness
        const existing = await Blog.findOne({ slug: finalSlug });
        if (existing) {
            return res.status(400).json({ success: false, message: "A blog with this slug already exists" });
        }

        // Upload cover image if provided
        let coverImage = { public_id: '', url: '' };
        if (req.file) {
            const uploaded = await uploadFileToCloudinary([req.file]);
            if (uploaded && uploaded[0]) {
                coverImage = { public_id: uploaded[0].public_id, url: uploaded[0].url };
            }
        }

        // Parse tags
        let parsedTags = [];
        if (tags) {
            try {
                parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
            } catch {
                parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean);
            }
        }

        const blog = await Blog.create({
            title,
            slug: finalSlug,
            excerpt,
            content,
            coverImage,
            tags: parsedTags,
            published: published === 'true' || published === true,
        });

        res.status(201).json({ success: true, message: "Blog created successfully", blog });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// PUT /api/admin/blogs/:id
export const updateBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

        const { title, slug, excerpt, content, tags, published } = req.body;

        if (title) blog.title = title;
        if (excerpt) blog.excerpt = excerpt;
        if (content) blog.content = content;
        if (published !== undefined) blog.published = published === 'true' || published === true;

        // Update slug if provided and different
        if (slug && slug !== blog.slug) {
            const finalSlug = slug.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
            const existing = await Blog.findOne({ slug: finalSlug, _id: { $ne: blog._id } });
            if (existing) return res.status(400).json({ success: false, message: "Slug already in use" });
            blog.slug = finalSlug;
        }

        // Parse tags
        if (tags !== undefined) {
            try {
                blog.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
            } catch {
                blog.tags = tags.split(',').map(t => t.trim()).filter(Boolean);
            }
        }

        // Upload new cover image if provided
        if (req.file) {
            // Delete old image from cloudinary
            if (blog.coverImage?.public_id) {
                await deleteFromCloudinary(blog.coverImage.public_id);
            }
            const uploaded = await uploadFileToCloudinary([req.file]);
            if (uploaded && uploaded[0]) {
                blog.coverImage = { public_id: uploaded[0].public_id, url: uploaded[0].url };
            }
        }

        await blog.save();
        res.status(200).json({ success: true, message: "Blog updated successfully", blog });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// DELETE /api/admin/blogs/:id
export const deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

        // Delete cover image from cloudinary
        if (blog.coverImage?.public_id) {
            await deleteFromCloudinary(blog.coverImage.public_id);
        }

        await Blog.deleteOne({ _id: blog._id });
        res.status(200).json({ success: true, message: "Blog deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// PATCH /api/admin/blogs/:id/toggle — publish/unpublish
export const togglePublish = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

        blog.published = !blog.published;
        await blog.save();

        res.status(200).json({
            success: true,
            message: `Blog ${blog.published ? 'published' : 'unpublished'} successfully`,
            published: blog.published,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
