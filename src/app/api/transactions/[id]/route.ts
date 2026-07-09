import connectDB from "@/lib/db";
import { errorResponse, successResponse } from "@/lib/response";
import Category from "@/models/category.model";
import Transaction from "@/models/transaction.model";
import User from "@/models/user.model";
import { UpdateTransactionSchema } from "@/validators/transaction.validator";
import { auth } from "@clerk/nextjs/server";
import mongoose from "mongoose";
import { NextRequest } from "next/server";

export async function PATCH(req: NextRequest, {params} : {params: Promise<{id: string}>}) {
    try {
        // getting transaction id
        const {id} = await params;

        // authenticate user
        const {userId} = await auth();
        if(!userId) return errorResponse("Unauthorized", null, 401);

        // validate transaction id
        if(!mongoose.Types.ObjectId.isValid(id)) return errorResponse("Invalid Transaction ID", null, 400);

        // connect database
        connectDB();

        // parse request body
        const body = await req.json();

        // validate body
        const validation = UpdateTransactionSchema.safeParse(body);
        if(!validation.success) return errorResponse("Validation failed", validation.error.flatten(), 400);

        // find mongo user
        const mongoUser = await User.findOne({clerkId: userId}).select("_id");
        if(!mongoUser) return errorResponse("User not found", null, 404);

        // check transaction ownership
        const existingTransaction = await Transaction.findOne({_id: id, user: mongoUser._id});
        if(!existingTransaction) return errorResponse("Transaction not found", null, 404);

        // if category is changing, validate it
        if(validation.data.category) {
            // check whether category exists
            const category = await Category.findOne({_id: validation.data.category, user: mongoUser._id});
            if(!category) return errorResponse("Category not found", null, 404);

            // check whether category type is same
            if(validation.data.type && category.type !== validation.data.type) return errorResponse("Category type does not match transaction type", null, 400);
        }

        // update transaction
        const updatedTransaction = await Transaction.findOneAndUpdate({_id: id, user: mongoUser._id}, validation.data, {new: true, runValidators: true});

        return successResponse("Transaciton updated successfully", updatedTransaction, 200);
    } catch (error) {
        console.error(error);
        return errorResponse("Internal server error", error, 500);
    }
}