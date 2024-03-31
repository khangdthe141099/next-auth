import accountApiRequest from "@/apiRequests/account";
import Profile from "@/app/me/profile";
import envConfig from "@/config";
import { cookies } from "next/headers";
import { useEffect } from "react";

export default async function MeProfile() {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get("sessionToken");

  const user = await accountApiRequest.me(sessionToken?.value || "");

  console.log("result", user);

  return (
    <div>
      <h1>Profile</h1>
      <div>Xin chào {user?.payload?.data?.name}</div>
      <Profile />
    </div>
  );
}
