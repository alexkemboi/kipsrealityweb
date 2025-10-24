// src/app/api/services/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "../../../lib/db";

export async function GET(req: NextRequest) {
  const categoryId = req.nextUrl.searchParams.get("category_id");
  try {
    let query = "SELECT * FROM services";
    const params: any[] = [];
    if (categoryId) {
      query += " WHERE category_id = ?";
      params.push(categoryId);
    }
    const [services] = await db.query(query, params);
    return NextResponse.json(services);
  } catch (err) {
    return NextResponse.json({ error: "Database error", details: err }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { category_id, name, description, features, impact, icon } = body;
    const [result]: any = await db.query(
      "INSERT INTO services (category_id, name, description, features, impact, icon) VALUES (?, ?, ?, ?, ?, ?)",
      [category_id, name, description, JSON.stringify(features), impact, icon]
    );
    return NextResponse.json({ id: result.insertId });
  } catch (err) {
    return NextResponse.json({ error: "Database error", details: err }, { status: 500 });
  }
}
