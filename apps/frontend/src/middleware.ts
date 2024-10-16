import { NextRequest, NextResponse } from "next/server";

export default function authentication(request: NextRequest) {
  console.log("request.cookies", request.cookies);
  if (request.cookies.get("token")?.value) {
    return NextResponse.redirect(new URL("/home", request.url));
  } else {
    console.log("WE HAVE NO TOKEN");
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: "/",
};
