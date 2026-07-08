import mongoose from 'mongoose'

interface ICategory {
    user: mongoose.Schema.Types.ObjectId;
    name: string;
    type: "income" | "expense";
    icon: string;
}

const categorySchema = new mongoose.Schema<ICategory>({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },

    name: {
        type: String,
        required: true,
        trim: true,
    },

    type: {
        type: String,
        enum: ["income", "expense"],
        required: true,
    },

    icon: {
        type: String,
        required: true,
    }
}, {timestamps: true});

categorySchema.index({user: 1, name: 1});

const Category = mongoose.models.Category || mongoose.model<ICategory>('Category', categorySchema);
export default Category;