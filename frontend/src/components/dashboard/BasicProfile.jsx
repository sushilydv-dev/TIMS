import { useEffect, useState } from "react";
import axios from "axios";
import {
  FiX,
  FiMail,
  FiPhone,
  FiBook,
  FiAward,
  FiCalendar,
  FiMapPin,
  FiLayers,
} from "react-icons/fi";
import { StatusBadge } from "./DashboardUI";
import { labelMutedClass } from "./dashboardTheme";
import { ProfileAvatar } from "./ProfileAvatar";

function roleLabel(profile) {
  if (!profile) return "";
  if (profile.profile_type === "student") return "Student";
  if (profile.profile_type === "trainer") return "Trainer";
  if (profile.profile_type === "hr") return "HR Coordinator";
  return profile.role ? String(profile.role).replace(/_/g, " ") : "User";
}

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-black/[0.04] last:border-0">
      <div className="w-8 h-8 rounded-lg bg-[#f8fafc] flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-[#94a3b8]" />
      </div>
      <div className="min-w-0">
        <p className={labelMutedClass}>{label}</p>
        <p className="text-sm font-semibold text-[#0c0407] mt-0.5 break-words">{value}</p>
      </div>
    </div>
  );
}

export function useBasicProfile() {
  const [state, setState] = useState({ open: false, profileType: null, profileId: null });

  return {
    basicProfileOpen: state.open,
    basicProfileType: state.profileType,
    basicProfileId: state.profileId,
    openBasicProfile: (profileType, profileId) => {
      if (!profileType || !profileId) return;
      setState({ open: true, profileType, profileId });
    },
    closeBasicProfile: () => setState({ open: false, profileType: null, profileId: null }),
  };
}

export function BasicProfile({ open, profileType, profileId, onClose }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !profileType || !profileId) {
      setProfile(null);
      setError("");
      return undefined;
    }

    let cancelled = false;

    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await axios.get(`/api/profile/basic/${profileType}/${profileId}`);
        if (!cancelled) setProfile(data);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || "Failed to load profile");
          setProfile(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      cancelled = true;
    };
  }, [open, profileType, profileId]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const avatarType =
    profile?.profile_type === "trainer"
      ? "trainer"
      : profile?.profile_type === "hr"
        ? "hr"
        : "student";

  return (
    <div className="fixed inset-0 z-[130] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/35 backdrop-blur-[1px]"
        onClick={onClose}
        aria-label="Close profile panel"
      />
      <aside
        className="relative w-full max-w-md h-full bg-white shadow-2xl border-l border-black/[0.08] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="basic-profile-title"
      >
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-black/[0.06]">
          <div>
            <p className={labelMutedClass}>Basic Profile</p>
            <h3 id="basic-profile-title" className="text-lg font-bold text-[#0c0407]">
              {loading ? "Loading..." : profile?.name || "Profile"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-[#636363] hover:bg-[#f8fafc]"
            aria-label="Close"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-[#fc362d]/20 border-t-[#fc362d] rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <p className="text-sm font-semibold text-[#b91c1c]">{error}</p>
            </div>
          ) : profile ? (
            <div className="space-y-5">
              <div className="rounded-2xl border border-black/[0.06] bg-gradient-to-br from-[#fc362d]/5 to-white p-5">
                <div className="flex items-center gap-4">
                  <ProfileAvatar
                    src={profile.profile_img}
                    name={profile.name}
                    profileType={avatarType}
                    size="lg"
                    disabled
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-extrabold text-[#0c0407]">{profile.name}</h4>
                      <StatusBadge variant={profile.status === "active" ? "ok" : "warn"}>
                        {profile.status || "unknown"}
                      </StatusBadge>
                    </div>
                    <p className="text-xs font-semibold text-[#fc362d] mt-1 uppercase tracking-wide">
                      {roleLabel(profile)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-black/[0.06] p-4">
                <InfoRow icon={FiMail} label="Email" value={profile.email} />
                <InfoRow icon={FiPhone} label="Phone" value={profile.phone} />
                <InfoRow icon={FiAward} label="Student Code" value={profile.student_code} />
                <InfoRow icon={FiBook} label="Qualification" value={profile.qualification} />
                <InfoRow icon={FiMapPin} label="College" value={profile.college_name} />
                <InfoRow icon={FiLayers} label="Course" value={profile.course_title} />
                <InfoRow icon={FiCalendar} label="Batch" value={profile.batch_name} />
                <InfoRow icon={FiAward} label="Specialization" value={profile.specialization} />
                <InfoRow
                  icon={FiCalendar}
                  label="Experience"
                  value={
                    profile.experience_year != null ? `${profile.experience_year} years` : ""
                  }
                />
                <InfoRow
                  icon={FiLayers}
                  label="Assigned Batches"
                  value={profile.batches?.length ? profile.batches.join(", ") : ""}
                />
                <InfoRow icon={FiMapPin} label="Address" value={profile.address} />
                <InfoRow
                  icon={FiCalendar}
                  label="Joining Date"
                  value={
                    profile.joining_date
                      ? new Date(profile.joining_date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : ""
                  }
                />
              </div>
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  );
}

export default BasicProfile;
