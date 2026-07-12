"use client";

import { Suspense } from "react";
import { AuthExperience } from "../AuthExperience";

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <AuthExperience initialView="signup" />
    </Suspense>
  );
}
