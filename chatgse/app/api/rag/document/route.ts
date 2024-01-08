import { NextRequest, NextResponse } from "next/server";
import { BioChatterServerResponse, getBaseUrl } from "../../common";
import { BiochatterPath } from "@/app/constant";
import { prettyObject } from "@/app/utils/format";

async function handle(request: NextRequest) {
  const AUTHORIZATION = "Authorization"
  const authValue = request.headers.get(AUTHORIZATION) ?? "";
  const baseUrl = getBaseUrl();
  const path = BiochatterPath.Document;
  const url = `${baseUrl}/${path}`;
  try {
    const data = await request.json();
    const docId = data.docId;
    const res = await fetch(
      url,
      {
        method: "DELETE",
        headers: {
          [AUTHORIZATION]: authValue,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({docId})
      }
    );
    const jsonBody = await res.json();
    return NextResponse.json(jsonBody);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(prettyObject(e));
  }
}

export const DELETE = handle;

