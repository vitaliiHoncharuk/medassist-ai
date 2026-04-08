import { NextResponse } from "next/server";

export const jsonError = (
  message: string,
  status: number
): NextResponse<{ error: string }> =>
  NextResponse.json({ error: message }, { status });
