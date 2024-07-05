import { NextRequest, NextResponse } from "next/server";
import { BioChatterServerResponse, getBaseUrl } from "../../common";
import { BiochatterPath, ERROR_BIOSERVER_MILVUS_CONNECT_FAILED, ERROR_BIOSERVER_OK, ERROR_BIOSERVER_UNKNOWN } from "@/app/constant";
import { prettyObject } from "@/app/utils/format";

async function handle(request: NextRequest) {
  const AUTHORIZATION = "Authorization"
  const authValue = request.headers.get(AUTHORIZATION) ?? "";
  const baseUrl = getBaseUrl();
  const data = await request.json();
  const path = BiochatterPath.AllDocuments;
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
        body: JSON.stringify(data)
      }
    );
    const v = (await res.json()) as BioChatterServerResponse;
    if (v.code !== ERROR_BIOSERVER_OK) {
      if (v.code === ERROR_BIOSERVER_MILVUS_CONNECT_FAILED) {
        return NextResponse.json({code: ERROR_BIOSERVER_MILVUS_CONNECT_FAILED});
      } else {
        return NextResponse.json({code: ERROR_BIOSERVER_UNKNOWN,})
      }
    } else {
      console.log(v.error ?? "Unkonw errors occurred in biochatter-server")
    }
    const value = v as any;
    return NextResponse.json({documents: value.documents??[]})
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(prettyObject(e));
  }
}

export const POST = handle;

