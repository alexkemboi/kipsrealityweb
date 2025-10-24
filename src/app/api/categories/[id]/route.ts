import { NextRequest, NextResponse } from "next/server";
import db from "../../../../lib/db";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const [result]: any = await db.query("SELECT * FROM categories WHERE id=?", [id]);
    if (result.length === 0) return NextResponse.json({ message: "Category not found" }, { status: 404 });
    return NextResponse.json(result[0]);
  } catch (err) {
    return NextResponse.json({ error: "Database error", details: err }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const body = await req.json();
  const { name, tagline, color } = body;

  try {
    await db.query("UPDATE categories SET name=?, tagline=?, color=? WHERE id=?", [name, tagline, color, id]);
    return NextResponse.json({ message: "Category updated successfully" });
  } catch (err) {
    return NextResponse.json({ error: "Database error", details: err }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    await db.query("DELETE FROM categories WHERE id=?", [id]);
    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (err) {
    return NextResponse.json({ error: "Database error", details: err }, { status: 500 });
  }
}
