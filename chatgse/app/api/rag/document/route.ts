import { NextRequest, NextResponse } from "next/server";
import { getBaseUrl } from "../../common";
import { BiochatterPath } from "@/app/constant";
import { prettyObject } from "@/app/utils/format";

async function handle(request: NextRequest) {
  const AUTHORIZATION = "Authorization"
  const authValue = request.headers.get(AUTHORIZATION) ?? "";
  const baseUrl = getBaseUrl();
  const path = BiochatterPath.Document;
  const url = `${baseUrl}/${path}`;
  try {
    const res = await fetch(
      url,
      {
        method: "DELETE",
        headers: {
          [AUTHORIZATION]: authValue,
        },
        body: request.body
      }
    );
    return res;
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(prettyObject(e));
  }
}

export const GET = handle;

