import { getCurrentUser } from "@/server/auth/session";
import LandingPage from "./_landing/LandingPage";

export default async function HomePage() {
  const user = await getCurrentUser();
  return <LandingPage isLoggedIn={Boolean(user)} />;
}
