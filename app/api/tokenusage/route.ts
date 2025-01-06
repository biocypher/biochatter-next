import { NextRequest, NextResponse } from "next/server";
import { getBaseUrl } from "../common";
import { BiochatterPath} from "@/app/constant";
import { prettyObject } from "@/app/utils/format";

async function handle(request: NextRequest) {
  const AUTHORIZATION = "Authorization"
  const authValue = request.headers.get(AUTHORIZATION) ?? "";
  const baseUrl = getBaseUrl();
  const data = await request.json();
  const path = BiochatterPath.TokenUsage;
  const url = `${baseUrl}/${path}`;
  try {
    const res = await fetch(
      url,
      {
        method: "POST",
        headers: {
          [AUTHORIZATION]: authValue,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: data.model ?? "gpt-3.5-turbo",
          session_id: data.session_id ?? "",
        }),
      }
    );
    const jsonBody = await res.json();
    return NextResponse.json(jsonBody);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(prettyObject(e));
  }
}

export const POST = handle;

