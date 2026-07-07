import connectDB from "@/lib/db";
import User from "@/models/user.model";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Verify webhook
    const evt = await verifyWebhook(req);

    // Connect to MongoDB
    await connectDB();

    switch (evt.type) {
      case "user.created": {
        const { id, first_name, last_name, image_url, email_addresses } =
          evt.data;

        await User.create({
          clerkId: id,
          email: email_addresses[0].email_address,
          firstName: first_name,
          lastName: last_name,
          imageUrl: image_url,
        });

        console.log(`User created: ${id}`);
        break;
      }

      case "user.updated": {
        const { id, first_name, last_name, image_url, email_addresses } =
          evt.data;

        await User.findOneAndUpdate(
          {
            clerkId: id,
          },
          {
            email: email_addresses[0].email_address,
            firstName: first_name,
            lastName: last_name,
            imageUrl: image_url,
          },
          {
            new: true,
          },
        );

        console.log(`User updated: ${id}`);
        break;
      }

      case "user.deleted": {
        const { id } = evt.data;

        if (!id) break;

        await User.findOneAndDelete({
          clerkId: id,
        });

        console.log(`User deleted: ${id}`);
        break;
      }

      default:
        console.log(`Unhandled event: ${evt.type}`);
    }

    return Response.json(
      {
        success: true,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Webhook Error:", error);

    return Response.json(
      {
        success: false,
        message: "Webhook failed",
      },
      {
        status: 400,
      },
    );
  }
}
