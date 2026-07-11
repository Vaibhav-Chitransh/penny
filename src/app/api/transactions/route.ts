import connectDB from "@/lib/db";
import { errorResponse, successResponse } from "@/lib/response";
import Category from "@/models/category.model";
import Transaction from "@/models/transaction.model";
import User from "@/models/user.model";
import { CreateTransactionSchema } from "@/validators/transaction.validator";
import { auth } from "@clerk/nextjs/server";
import mongoose from "mongoose";
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

export async function GET(req : NextRequest) {
    try {
        // authenticate user
        const {userId} = await auth();
        if(!userId) return errorResponse("Unauthorized", null, 401);

        // connect database
        connectDB();

        // find current mongo user
        const mongoUser = await User.findOne({clerkId: userId}).select("_id");
        if(!mongoUser) return errorResponse("User not found", null, 404);

        // read query parameters
        const {searchParams} = new URL(req.url);

        // pagination
        const page = Number(searchParams.get("page")) || 1;
        const limit = Number(searchParams.get("limit")) || 10;

        // filters
        const type = searchParams.get("type");
        const category = searchParams.get("category");

        // search
        const search = searchParams.get("search");

        // date filters
        const from = searchParams.get("from");
        const to = searchParams.get("to");

        // sorting
        const sortBy = searchParams.get("sortBy") || "date";
        const sortOrder = searchParams.get("sortOrder") == "asc" ? 1 : -1;

        // pagination calculation
        const skip = (page - 1) * limit;

        // create aggregation pipeline
        const pipeline: mongoose.PipelineStage[] = [];

        // filter current user
        pipeline.push({$match: {user: mongoUser._id}});

        // join category table
        pipeline.push({$lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "category",
        }});

        // remove category array (convert array -> object)
        pipeline.push({$unwind: "$category"});

        // type filter
        if(type) pipeline.push({$match: {type}});

        // category filter
        if(category) {
            if(!mongoose.Types.ObjectId.isValid(category)) {
                return errorResponse("Invalid category id", null, 400);
            }

            pipeline.push({$match: {"category._id": new mongoose.Types.ObjectId(category)}});
        }

        // date filter
        if(from || to) {
            const dateFilter: {
                $gte?: Date;
                $lte?: Date;
            } = {};

            if(from) dateFilter.$gte = new Date(from);
            if(to) dateFilter.$lte = new Date(to);

            pipeline.push({$match: {date: dateFilter}});
        }

        // search
        if(search) {
            pipeline.push({$match: {
                $or: [{
                    note: {
                        $regex: search,
                        $options: "i",
                    },
                }, {
                    "category.name": {
                        $regex: search,
                        $options: "i",
                    }
                }]
            }})
        }

        // sorting
        pipeline.push({$sort: {
            [sortBy]: sortOrder,
        }});

        // facet
        pipeline.push({$facet: {
            transactions: [{$skip: skip}, {$limit: limit}],
            totalCount: [{$count: "count"}]
        }});

        // execute the aggregation pipeline
        const result = await Transaction.aggregate(pipeline);
        const transactions = result[0]?.transactions ?? [];

        const total = result[0]?.totalCount?.[0]?.count ?? 0;

        // return success response
        return successResponse("Transaction fetched successfully", {transactions, pagination: {page, limit, total, totalPages: Math.ceil(total / limit)}});
    } catch (error) {
        console.error("Get Transaction error: ", error);
        return errorResponse("Internal Server error", error, 500);
    }
}