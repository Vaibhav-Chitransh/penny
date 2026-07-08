import mongoose from 'mongoose'

interface IBudget {
    user: mongoose.Schema.Types.ObjectId;
    category: mongoose.Schema.Types.ObjectId;
    amount: number;
    month: number;
    year: number;
}

const budgetSchema = new mongoose.Schema<IBudget>({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },

    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
        index: true,
    },

    amount: {
        type: Number,
        min: 0,
        required: true,
    },

    month: {
        type: Number,
        required: true,
        min: 0,
        max: 12
    },

    year: {
        type: Number,
        required: true,
    }
}, {timestamps: true});

budgetSchema.index({user: 1, month: 1, year: 1, category: 1});

const Budget = mongoose.models.Budget || mongoose.model<IBudget>('Budget', budgetSchema);
export default Budget;