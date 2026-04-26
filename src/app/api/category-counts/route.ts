import { NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getMongoDb();

    const results = await db
      .collection("ADNz_perfume")
      .aggregate([
        // Include all products — is_active: false excluded, missing field included
        { $match: { is_active: { $ne: false } } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ])
      .toArray();

    const counts: Record<string, number> = {};
    for (const row of results) {
      if (row._id) {
        counts[row._id as string] = row.count as number;
      }
    }

    return NextResponse.json(counts);
  } catch (error) {
    console.error("Failed to fetch category counts", error);
    return NextResponse.json(
      { message: "Failed to fetch category counts" },
      { status: 500 }
    );
  }
}
