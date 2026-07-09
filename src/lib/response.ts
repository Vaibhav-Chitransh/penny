import { NextResponse } from "next/server";

export function successResponse<T>(message:string, data?:T, status:number = 200) {
    return NextResponse.json({
        success: true,
        message,
        data,
    }, {
        status,
    });
}

export function errorResponse(message:string, errors?:unknown, status:number = 400) {
    return NextResponse.json({
        success: false,
        message,
        errors,
    }, {
        status,
    });
}