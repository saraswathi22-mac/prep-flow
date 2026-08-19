import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  updateUserName,
  changeUserPassword,
  deleteUserAccount,
} from "../firebase/auth";
import { toast } from "sonner";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";

import type { User } from "firebase/auth";

interface AccountSettingsProps {
  user: User | null;
  onNameUpdated: (newName: string) => void;
}

function AccountSettings({ user, onNameUpdated }: AccountSettingsProps) {
  const navigate = useNavigate();

  const [name, setName] = useState(user?.displayName || "");
  const [isEditingName, setIsEditingName] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSavingName, setIsSavingName] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSaveName = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      toast.error("Name cannot be empty.");
      return;
    }

    if (!user) return;

    try {
      setIsSavingName(true);

      await updateUserName(user, trimmedName);
      onNameUpdated(trimmedName);

      setName(trimmedName);
      setIsEditingName(false);

      toast.success("Name updated successfully.");
    } catch (error) {
      console.error("Update name error:", error);
      toast.error("Failed to update your name.");
    } finally {
      setIsSavingName(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    try {
      setIsChangingPassword(true);

      await changeUserPassword(user, newPassword);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      toast.success("Password changed successfully.");
    } catch (error) {
      console.error("Change password error:", error);
      toast.error("Unable to change password. Please sign in again and try.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone.",
    );

    if (!confirmed) return;

    try {
      setIsDeleting(true);

      await deleteUserAccount(user);

      toast.success("Your account has been deleted.");
      navigate("/");
    } catch (error) {
      console.error("Delete account error:", error);
      toast.error(
        "Unable to delete your account. Please sign in again and try.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Back to dashboard"
        >
          <ArrowBackIcon fontSize="small" />
        </button>

        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Account Settings
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage your profile and account security.
          </p>
        </div>
      </div>

      {/* Profile */}
      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-slate-800">Profile</h3>
        <p className="mt-1 text-sm text-slate-500">
          Update the information displayed on your account.
        </p>

        <div className="mt-6 space-y-5">
          {/* Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Name
            </label>

            {isEditingName ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[#5A9C43] focus:ring-2 focus:ring-[#5A9C43]/20"
                />

                <button
                  type="button"
                  onClick={handleSaveName}
                  disabled={isSavingName}
                  className="rounded-lg bg-[#5A9C43] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#4d8739] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSavingName ? "Saving..." : "Save"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setName(user?.displayName || "");
                    setIsEditingName(false);
                  }}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
                <span className="text-sm text-slate-700">
                  {name || "Not set"}
                </span>

                <button
                  type="button"
                  onClick={() => setIsEditingName(true)}
                  className="flex items-center gap-1 text-sm font-medium text-[#5A9C43] hover:underline"
                >
                  <EditOutlinedIcon fontSize="small" />
                  Edit
                </button>
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>

            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <span className="text-sm text-slate-600">
                {user?.email || "No email available"}
              </span>
            </div>

            <p className="mt-2 text-xs text-slate-400">
              Your email address cannot be changed here.
            </p>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <LockOutlinedIcon />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-800">Security</h3>
            <p className="mt-1 text-sm text-slate-500">
              Change your account password.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <input
            type="password"
            placeholder="Current password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#5A9C43] focus:ring-2 focus:ring-[#5A9C43]/20"
          />

          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#5A9C43] focus:ring-2 focus:ring-[#5A9C43]/20"
          />

          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#5A9C43] focus:ring-2 focus:ring-[#5A9C43]/20"
          />

          <button
            type="button"
            onClick={handleChangePassword}
            disabled={isChangingPassword}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isChangingPassword ? "Changing..." : "Change Password"}
          </button>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="rounded-xl border border-red-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-red-600">Danger Zone</h3>

        <p className="mt-1 text-sm text-slate-500">
          Permanently delete your PrepFlow account.
        </p>

        <button
          type="button"
          onClick={handleDeleteAccount}
          disabled={isDeleting}
          className="mt-5 flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <DeleteOutlinedIcon fontSize="small" />
          {isDeleting ? "Deleting..." : "Delete Account"}
        </button>
      </section>
    </div>
  );
}

export default AccountSettings;
