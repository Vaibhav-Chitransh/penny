import mongoose from 'mongoose'

interface IUser {
    clerkId: string;
    email: string;
    firstName: string;
    lastName: string;
    imageUrl: string;
}

const userSchema = new mongoose.Schema<IUser>({
    clerkId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
    },

    firstName: {
        type: String,
        default: "",
    },

    lastName: {
        type: String,
        default: "",
    },

    imageUrl: {
        type: String,
    }
}, {timestamps: true});

const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
export default User;