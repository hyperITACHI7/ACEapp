"use client";

import { useState } from "react";
import { Button, Card, useToast } from "@portfolio/ui-kit";
import { Avatar } from "../Avatar";

const fieldClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-white/40 focus:bg-white/8 focus:shadow-[0_0_0_3px_rgba(255,255,255,0.12)] transition-all";
const labelClass = "block text-sm font-medium text-muted-foreground mb-1.5";

interface PersonalInfoCardProps {
  name: string | null;
  username: string | null;
  email: string;
  avatarUrl: string | null;
}

export function PersonalInfoCard({ name, username, email, avatarUrl: initialAvatarUrl }: PersonalInfoCardProps) {
  const { showToast } = useToast();
  const [nameValue, setNameValue] = useState(name ?? "");
  const [emailValue, setEmailValue] = useState(email);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  async function saveProfile() {
    setSavingProfile(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameValue, email: emailValue }),
      });
      const body = await res.json();
      if (!res.ok) {
        showToast(body.error ?? "Couldn't save changes.", "error");
        return;
      }
      showToast("Profile updated.", "success");
    } finally {
      setSavingProfile(false);
    }
  }

  async function uploadAvatar(file: File) {
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const uploadRes = await fetch("/api/images/upload", { method: "POST", body: formData });
      const uploadBody = await uploadRes.json();
      if (!uploadRes.ok) {
        showToast(uploadBody.error ?? "Upload failed.", "error");
        return;
      }
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: uploadBody.url }),
      });
      if (!res.ok) {
        showToast("Couldn't save avatar.", "error");
        return;
      }
      setAvatarUrl(uploadBody.url);
      showToast("Avatar updated.", "success");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function changePassword() {
    if (newPassword.length < 8) {
      showToast("New password must be at least 8 characters.", "error");
      return;
    }
    setChangingPassword(true);
    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const body = await res.json();
      if (!res.ok) {
        showToast(body.error ?? "Couldn't change password.", "error");
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      showToast("Password changed.", "success");
    } finally {
      setChangingPassword(false);
    }
  }

  return (
    <Card className="flex flex-col gap-5 bg-panel backdrop-blur-none">
      <h2 className="text-base font-semibold">Personal Information</h2>

      <div className="flex items-center gap-4">
        <Avatar name={nameValue} username={username} email={emailValue} avatarUrl={avatarUrl} size={56} />
        <label className="text-sm font-medium cursor-pointer hover:text-foreground text-muted-foreground transition-colors">
          {uploadingAvatar ? "Uploading…" : "Change photo"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={uploadingAvatar}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadAvatar(file);
            }}
          />
        </label>
      </div>

      <div>
        <label className={labelClass}>Full Name</label>
        <input
          className={fieldClass}
          value={nameValue}
          onChange={(e) => setNameValue(e.target.value)}
          placeholder="Your name"
        />
      </div>

      <div>
        <label className={labelClass}>Username</label>
        <input className={`${fieldClass} opacity-60 cursor-not-allowed`} value={username ?? ""} disabled />
        <p className="text-xs text-muted-foreground mt-1.5">
          Your username is part of every published portfolio&apos;s URL and can&apos;t be changed.
        </p>
      </div>

      <div>
        <label className={labelClass}>Email</label>
        <input
          type="email"
          className={fieldClass}
          value={emailValue}
          onChange={(e) => setEmailValue(e.target.value)}
        />
      </div>

      <Button onClick={saveProfile} disabled={savingProfile} className="self-start">
        {savingProfile ? "Saving…" : "Save changes"}
      </Button>

      <div className="border-t border-white/10 pt-5 flex flex-col gap-3">
        <h3 className="text-sm font-semibold">Change password</h3>
        <input
          type="password"
          className={fieldClass}
          placeholder="Current password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <input
          type="password"
          className={fieldClass}
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <Button
          variant="secondary"
          onClick={changePassword}
          disabled={changingPassword || !currentPassword || !newPassword}
          className="self-start"
        >
          {changingPassword ? "Changing…" : "Change password"}
        </Button>
      </div>
    </Card>
  );
}
