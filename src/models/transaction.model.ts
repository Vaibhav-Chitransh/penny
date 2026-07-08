import mongoose from 'mongoose'

interface ITransaction {
    user: mongoose.Schema.Types.ObjectId;
    category: mongoose.Schema.Types.ObjectId;
    type: "income" | "expense";
    amount: number;
    note?: string;
    date: Date;
}

const transactionSchema = new mongoose.Schema<ITransaction>({
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

    type: {
        type: String,
        enum: ["income", "expense"],
        required: true,
    },

    amount: {
        type: Number,
        required: true,
        min: 0,
    },

    note: {
        type: String,
        default: "",
        trim: true,
    },

    date: {
        type: Date,
        required: true,
        index: true,
    }
}, {timestamps: true});

transactionSchema.index({user: 1, date: -1});

const Transaction = mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', transactionSchema);
export default Transaction;