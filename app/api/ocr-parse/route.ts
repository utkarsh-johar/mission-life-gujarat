import { NextRequest, NextResponse } from "next/server";
import { parseBillOcrText } from "../../../lib/services/ocr";

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: { code: "INVALID_INPUT", message: "OCR text string is required" } },
        { status: 400 }
      );
    }

    const parsed = parseBillOcrText(text);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("OCR parse API error:", error);
    return NextResponse.json(
      { error: { code: "PARSE_ERROR", message: "Failed to parse bill text" } },
      { status: 500 }
    );
  }
}
