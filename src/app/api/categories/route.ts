import connectDB from "@/lib/db";
import { errorResponse, successResponse } from "@/lib/response";
import Category from "@/models/category.model";
import User from "@/models/user.model";
import { CreateCategorySchema } from "@/validators/category.validator";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    try {
        // authenticate user
        const {userId} = await auth();
        if(!userId) return errorResponse("Unauthorized", null, 401);

        // connect database
        connectDB();

        // validate request
        const body = await req.json();
        const validation = CreateCategorySchema.safeParse(body);
        if(!validation.success) return errorResponse("Validation failed", validation.error.flatten(), 400);

        const {name, type, icon} = validation.data;

        // find current user
        const mongoUser = await User.findOne({clerkId: userId}).select("_id");
        if(!mongoUser) return errorResponse("User not found", null, 404);

        // check for duplicate category
        const existingCategory = await Category.findOne({user: mongoUser._id, name: {$regex: `^${name}$`, $options: "i"}});
        if(existingCategory) return errorResponse("Category already exists", null, 409);

        // create category
        const category = await Category.create({user: mongoUser._id, name, type, icon});

        return successResponse("Category created successfully", category, 201);
    } catch (error) {
        console.error("Create category error: ", error);
        return errorResponse("Internal Server error", error, 500);
    }
}