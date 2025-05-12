"use client";

import { useState } from "react";
import useAuth from "@/hooks/useAuth";
import { UserType } from "@/types/enums/userType";
import ProfileEditModal from "@/components/modal/ProfileEditModal";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useAlert } from "@/context/AlertContext";
import EmailChangeModal from "@/components/modal/EmailChangeModal";
import ReAuthModal from "@/components/modal/ReAuthModal";

export default function ProfileClient() {
  const { user, loading, reauthenticate, changeEmail, updateProfile } =
    useAuth();
  const { showAlert } = useAlert();
  const [isEditOpen, setEditOpen] = useState(false);
  const [isReauthOpen, setReauthOpen] = useState(false);
  const [isEmailChangeOpen, setEmailChangeOpen] = useState(false);
  const [reauthPassword, setReauthPassword] = useState("");
  const [isSaving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (loading) {
    return (
      <main className="mx-auto flex max-w-md justify-center p-24 text-gray-500 dark:text-gray-400">
        <Icon icon="mdi:loading" className="h-16 w-16 animate-spin" />
      </main>
    );
  }
  if (!user) {
    return (
      <main className="mx-auto flex max-w-md justify-center p-4 text-red-600">
        <Icon icon="mdi:alert-circle" className="h-16 w-16" />
        <span>You must be logged in to view your profile.</span>
      </main>
    );
  }

  const profile = user.data;
  const isVolunteer = user.type === UserType.VOLUNTEER;

  const handleReauth = async (password: string) => {
    const res = await reauthenticate(password);
    if (res.status === "success") {
      setReauthPassword(password);
      setReauthOpen(false);
      setEmailChangeOpen(true);
    } else if (res.status === "error") {
      showAlert(res.error, "error");
    }
  };

  const handleEmailSave = async (newEmail: string) => {
    const res = await changeEmail({
      newEmail,
      currentPassword: reauthPassword,
    });
    if (res.status === "success") {
      setEmailChangeOpen(false);
      showAlert(
        "A confirmation link to change your email has been sent to your new email address.",
        "success",
      );
    } else if (res.status === "error") {
      showAlert(res.error, "error");
    }
  };

  const handleSaveProfile = async (data: {
    name: string;
    address: string;
    phoneNumber: string;
  }) => {
    setSaving(true);
    const res = await updateProfile(data);
    setSaving(false);
    if (res.status === "error") {
      showAlert("Profile failed to update", "error");
      setSaveError(res.error);
    } else {
      showAlert("Profile updated", "success");
      setEditOpen(false);
    }
  };

  return (
    <main className="mx-auto max-w-md space-y-6 p-4">
      {/* Profile Info */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">
          {profile.name}
        </h2>
        <p className="mt-2 text-sm text-gray-700 capitalize dark:text-gray-300">
          {isVolunteer ? "Volunteer" : "Shelter"}
        </p>
        {"email" in profile && (
          <p className="mt-4 flex items-center text-gray-700 dark:text-gray-300">
            <Icon icon="mdi:email-outline" className="mr-2 h-5 w-5" />
            <span>{profile.email}</span>
          </p>
        )}
        {"phoneNumber" in profile && (
          <p className="mt-2 flex items-center text-gray-700 dark:text-gray-300">
            <Icon icon="proicons:phone" className="mr-2 h-5 w-5" />
            <span>{profile.phoneNumber}</span>
          </p>
        )}
        {"address" in profile && (
          <p className="mt-2 flex items-center text-gray-700 dark:text-gray-300">
            <Icon icon="mdi:location" className="mr-2 h-5 w-5" />
            <span>{profile.address}</span>
          </p>
        )}
      </div>

      {/* Profile Settings */}
      <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Profile Settings
        </h3>
        <div className="mt-4 flex flex-col gap-3 md:flex-row">
          <button
            onClick={() => setEditOpen(true)}
            className="bg-lime-green hover:bg-lime-green/90 inline-flex cursor-pointer items-center rounded-lg px-4 py-2 font-semibold text-black"
          >
            <Icon icon="mdi:pencil-outline" className="mr-2 h-5 w-5" />
            Edit Profile
          </button>
          <button
            onClick={() => setReauthOpen(true)}
            className="bg-lime-green hover:bg-lime-green/90 inline-flex cursor-pointer items-center rounded-lg px-4 py-2 font-semibold text-black"
          >
            <Icon icon="mdi:email-outline" className="mr-2 h-5 w-5" />
            Change Email
          </button>
        </div>
      </div>

      <ProfileEditModal
        isOpen={isEditOpen}
        initialName={profile.name}
        initialAddress={profile.address ?? ""}
        initialPhone={profile.phoneNumber ?? ""}
        loading={isSaving}
        errorMessage={saveError ?? undefined}
        onClose={() => setEditOpen(false)}
        onSave={handleSaveProfile}
      />

      <ReAuthModal
        isOpen={isReauthOpen}
        loading={false}
        errorMessage={undefined}
        onClose={() => setReauthOpen(false)}
        onReauthenticate={handleReauth}
      />

      <EmailChangeModal
        isOpen={isEmailChangeOpen}
        loading={false}
        errorMessage={undefined}
        onClose={() => setEmailChangeOpen(false)}
        onSave={handleEmailSave}
      />
    </main>
  );
}
