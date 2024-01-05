import { NextRequest, NextResponse } from "next/server";
import { getBaseUrl } from "../../common";
import { BiochatterPath } from "@/app/constant";
import { prettyObject } from "@/app/utils/format";

async function handle(request: NextRequest) {
  const AUTHORIZATION = "Authorization"
  const authValue = request.headers.get(AUTHORIZATION) ?? "";
  const baseUrl = getBaseUrl();
  const path = BiochatterPath.AllDocuments;
  const url = `${baseUrl}/${path}`;
  try {
    const res = await fetch(
      url,
      {
        method: "GET",
        headers: {
          [AUTHORIZATION]: authValue,
          "Cache-Control": "no-cache",
        }
      }
    );
    const v = await res.json()
    return NextResponse.json({documents: v.documents??[]})
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(prettyObject(e));
  }
}

export const POST = handle;

