import type { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";
import type { Perfume } from "@/types/perfume";

type PerfumeDocument = Omit<Perfume, "_id"> & {
  _id: ObjectId;
};

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getMongoDb();
    const perfumes = await db
      .collection<PerfumeDocument>("ADNz_perfume")
      .find({ is_active: true })
      .sort({ brand: 1, fragrance_name: 1 })
      .toArray();

    return NextResponse.json(
      perfumes.map((perfume) => ({
        ...perfume,
        _id: perfume._id.toString(),
      }))
    );
  } catch (error) {
    console.error("Failed to fetch perfumes from MongoDB", error);
    return NextResponse.json(
      { message: "Failed to fetch perfumes from MongoDB" },
      { status: 500 }
    );
  }
}
