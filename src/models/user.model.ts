import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    clerkId: {
        type: String,
        required: true,
        unique: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
    },

    firstName: {
        type: String,
    },

    lastName: {
        type: String,
    },

    imageUrl: {
        type: String,
    }
}, {timestamps: true});

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;