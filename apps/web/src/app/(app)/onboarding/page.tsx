"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { listThemes } from "@portfolio/themes";
import { Button, Card, useToast } from "@portfolio/ui-kit";
import { recommendThemes } from "@/lib/recommendTheme";

type Step = "role" | "domain" | "goal" | "resume" | "theme" | "review";
const STEPS: Step[] = ["role", "domain", "goal", "resume", "theme", "review"];

const fieldClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-purple-400/60 focus:bg-white/8 focus:shadow-[0_0_0_3px_rgba(168,85,247,0.15)] transition-all";
const labelClass = "block text-sm font-medium text-muted-foreground mb-1.5";

export default function OnboardingPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [stepIndex, setStepIndex] = useState(0);
  const [role, setRole] = useState("");
  const [domain, setDomain] = useState("");
  const [goal, setGoal] = useState("");
  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [experience, setExperience] = useState<
    Array<{ role: string; org: string; dates?: string; description?: string }>
  >([]);
  const [themeId, setThemeId] = useState<string | null>(null);
  const [alreadyPublished, setAlreadyPublished] = useState(false);
  const [confirmedReset, setConfirmedReset] = useState(false);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Restore partial answers on mount so abandoning mid-quiz resumes instead of restarting.
  useEffect(() => {
    fetch("/api/onboarding")
      .then((r) => r.json())
      .then((body) => {
        const s = body.onboardingState ?? {};
        if (s.role) setRole(s.role);
        if (s.domain) setDomain(s.domain);
        if (s.goal) setGoal(s.goal);
        setAlreadyPublished(Boolean(body.alreadyPublished));
      })
      .catch(() => {});
  }, []);

  function persistPartial(patch: Record<string, unknown>) {
    fetch("/api/onboarding", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    }).catch(() => {});
  }

  function goNext() {
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  }
  function goBack() {
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  async function onResumeUpload(file: File) {
    setResumeError(null);
    setResumeUploading(true);
    try {
      const formData = new FormData();
      formData.append("resume", file);
      const res = await fetch("/api/resume/parse", { method: "POST", body: formData });
      const body = await res.json();
      if (!res.ok) {
        setResumeError(body.error ?? "Couldn't read this as a resume.");
        return; // user can still proceed to manual entry — never a dead end
      }
      const fields = body.fields ?? {};
      if (fields.name) setName(fields.name);
      if (fields.headline) setHeadline(fields.headline);
      if (fields.bio) setBio(fields.bio);
      if (fields.skills?.length) setSkills(fields.skills);
      if (fields.experience?.length) setExperience(fields.experience);
      showToast("Resume parsed — review and edit the fields below.", "success");
    } catch {
      setResumeError("Upload failed. You can skip this step and enter details manually.");
    } finally {
      setResumeUploading(false);
    }
  }

  const recommended = recommendThemes({ role, domain, goal });
  const allThemes = listThemes();
  const selectedThemeId = themeId ?? recommended[0]?.manifest.id ?? allThemes[0]?.manifest.id;

  async function finish(confirmReset = false) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          themeId: selectedThemeId,
          confirmReset,
          profile: { name, headline, bio, domain },
          skills,
          experience,
        }),
      });
      const body = await res.json();
      if (res.status === 409 && body.error === "confirm_required") {
        setAlreadyPublished(true);
        return;
      }
      if (res.status === 402) {
        showToast(body.error, "error");
        return;
      }
      if (!res.ok) {
        showToast(body.error ?? "Something went wrong.", "error");
        return;
      }
      router.push("/editor");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  const step = STEPS[stepIndex];

  return (
    <div className="max-w-xl mx-auto">
      <p className="text-xs text-muted-foreground mb-4 tracking-wide">
        Step {stepIndex + 1} of {STEPS.length}
      </p>

      {step === "role" && (
        <Card className="flex flex-col gap-4">
          <h2 className="text-xl font-bold">What best describes you?</h2>
          <select
            className={fieldClass}
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              persistPartial({ role: e.target.value });
            }}
          >
            <option value="">Select…</option>
            <option value="student">Student</option>
            <option value="professional">Professional</option>
            <option value="freelancer">Freelancer</option>
          </select>
          <Button onClick={goNext} className="self-start">
            Continue
          </Button>
        </Card>
      )}

      {step === "domain" && (
        <Card className="flex flex-col gap-4">
          <h2 className="text-xl font-bold">What field are you in?</h2>
          <input
            className={fieldClass}
            placeholder="e.g. software engineering, photography, writing"
            value={domain}
            onChange={(e) => {
              setDomain(e.target.value);
              persistPartial({ domain: e.target.value });
            }}
          />
          <div className="flex gap-2">
            <Button variant="secondary" onClick={goBack}>
              Back
            </Button>
            <Button onClick={goNext}>Continue</Button>
          </div>
        </Card>
      )}

      {step === "goal" && (
        <Card className="flex flex-col gap-4">
          <h2 className="text-xl font-bold">What&apos;s your main goal?</h2>
          <select
            className={fieldClass}
            value={goal}
            onChange={(e) => {
              setGoal(e.target.value);
              persistPartial({ goal: e.target.value });
            }}
          >
            <option value="">Select…</option>
            <option value="job-hunt">Job hunting</option>
            <option value="freelance-clients">Finding freelance clients</option>
            <option value="personal-brand">Personal brand</option>
          </select>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={goBack}>
              Back
            </Button>
            <Button onClick={goNext}>Continue</Button>
          </div>
        </Card>
      )}

      {step === "resume" && (
        <Card className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-bold">Upload your resume (optional)</h2>
            <p className="text-sm font-body text-muted-foreground mt-1">
              We&apos;ll pre-fill your bio, skills, and experience — you can edit everything afterward.
            </p>
          </div>
          <input
            type="file"
            accept="application/pdf"
            disabled={resumeUploading}
            className="text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-foreground file:text-sm"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onResumeUpload(file);
            }}
          />
          {resumeError && <p className="text-xs text-red-400">{resumeError}</p>}
          {name && (
            <div>
              <label className={labelClass}>Name</label>
              <input className={fieldClass} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          )}
          {headline && (
            <div>
              <label className={labelClass}>Headline</label>
              <input className={fieldClass} value={headline} onChange={(e) => setHeadline(e.target.value)} />
            </div>
          )}
          {bio && (
            <div>
              <label className={labelClass}>Bio</label>
              <textarea className={fieldClass} rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
            </div>
          )}
          <div className="flex gap-2">
            <Button variant="secondary" onClick={goBack}>
              Back
            </Button>
            <Button onClick={goNext}>{name || bio ? "Continue" : "Skip / continue manually"}</Button>
          </div>
        </Card>
      )}

      {step === "theme" && (
        <Card className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-bold">Pick a theme</h2>
            <p className="text-sm font-body text-muted-foreground mt-1">
              Recommended for you: {recommended.map((t) => t.manifest.name).join(", ")}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {allThemes.map((t) => (
              <label
                key={t.manifest.id}
                className={`rounded-xl p-3 cursor-pointer border transition-colors ${
                  selectedThemeId === t.manifest.id
                    ? "border-purple-400/60 bg-purple-500/10"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
              >
                <input
                  type="radio"
                  name="theme"
                  checked={selectedThemeId === t.manifest.id}
                  onChange={() => setThemeId(t.manifest.id)}
                  className="mr-2 accent-purple-500"
                />
                {t.manifest.name}
                {t.manifest.isPremium && (
                  <span className="text-muted-foreground text-xs"> — ₹{t.manifest.priceInPaise / 100}</span>
                )}
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={goBack}>
              Back
            </Button>
            <Button onClick={goNext}>Continue</Button>
          </div>
        </Card>
      )}

      {step === "review" && (
        <Card className="flex flex-col gap-4">
          <h2 className="text-xl font-bold">Ready to go</h2>
          {alreadyPublished && !confirmedReset ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-body text-muted-foreground">
                You already have a published portfolio. Continuing will update your draft with these answers.
              </p>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => router.push("/editor")}>
                  Cancel, go to editor instead
                </Button>
                <Button
                  onClick={() => {
                    setConfirmedReset(true);
                    finish(true);
                  }}
                >
                  Yes, continue
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-body text-muted-foreground">
                We&apos;ll set up your portfolio with a {allThemes.find((t) => t.manifest.id === selectedThemeId)?.manifest.name} theme.
              </p>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={goBack}>
                  Back
                </Button>
                <Button onClick={() => finish(false)} disabled={submitting}>
                  {submitting ? "Setting up…" : "Finish"}
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
