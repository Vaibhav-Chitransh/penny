import connectDB from "@/lib/db";
import { errorResponse, successResponse } from "@/lib/response";
import Category from "@/models/category.model";
import Transaction from "@/models/transaction.model";
import User from "@/models/user.model";
import { CreateTransactionSchema } from "@/validators/transaction.validator";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export async function POST(req : NextRequest) {
    try {
        // check whether user is authenticated
        const {userId} = await auth();
        if(!userId) return errorResponse("Unauthorized", null, 401);

        // connect database
        await connectDB();

        // read request body
        const body = await req.json();

        // validate request
        const validation = CreateTransactionSchema.safeParse(body);

        if(!validation.success) return errorResponse("Validation failed", validation.error.flatten(), 400);

        const {amount, type, category, note, date} = validation.data;

        // find mongo user
        const mongoUser = await User.findOne({clerkId: userId}).select("_id");
        if(!mongoUser) return errorResponse("User not found", null, 404);

        // verify whether category exists for current user
        const existingCategory = await Category.findOne({_id: category, user: mongoUser._id});
        if(!existingCategory) return errorResponse("Category not found", null, 404);

        // verify whether the existing category is of the same type (income/expense)
        if(existingCategory.type !== type) return errorResponse("Transaction type does not match category type", null, 400);

        // create transaction
        const transaction = await Transaction.create({
            user: mongoUser._id,
            category,
            amount,
            type,
            note,
            date,
        });

        return successResponse("Transaction created successfully", transaction, 201);
    } catch (error) {
        console.error("Create Transaction error: ", error);
        return errorResponse("Internal server error", error, 500);
    }
}