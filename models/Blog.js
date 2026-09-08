import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    excerpt: {
        type: String,
        required: true,
        maxlength: 300,
    },
    content: {
        type: String,
        required: true,
    },
    coverImage: {
        public_id: { type: String, default: '' },
        url: { type: String, default: '' },
    },
    tags: {
        type: [String],
        default: [],
    },
    published: {
        type: Boolean,
        default: false,
    },
    readTime: {
        type: Number, // minutes
        default: 1,
    },
}, { timestamps: true });

// Auto-generate slug from title if not provided
blogSchema.pre('validate', function (next) {
    if (!this.slug && this.title) {
        this.slug = this.title
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    }
    // Auto-calculate read time (~200 words per minute)
    if (this.content) {
        const wordCount = this.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
        this.readTime = Math.max(1, Math.ceil(wordCount / 200));
    }
    next();
});

const Blog = mongoose.model("Blog", blogSchema);
export default Blog;
