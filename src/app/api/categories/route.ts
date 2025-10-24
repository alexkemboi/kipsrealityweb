
import { NextRequest, NextResponse } from "next/server";
import db from "../../../lib/db";

export async function GET(req: NextRequest) {
  try {
    const [categories] = await db.query("SELECT * FROM categories");
    return NextResponse.json(categories);
  } catch (err) {
    return NextResponse.json({ error: "Database error", details: err }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, tagline, color } = body;
    const [result]: any = await db.query(
      "INSERT INTO categories (name, tagline, color) VALUES (?, ?, ?)",
      [name, tagline, color]
    );
    return NextResponse.json({ id: result.insertId });
  } catch (err) {
    return NextResponse.json({ error: "Database error", details: err }, { status: 500 });
  }
}
