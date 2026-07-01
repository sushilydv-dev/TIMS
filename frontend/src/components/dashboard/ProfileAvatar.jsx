import { FiUser } from "react-icons/fi";
import studentPlaceholder from "../../assets/student_placeholder.png";
import trainerPlaceholder from "../../assets/trainer_placeholder.png";
import hrPlaceholder from "../../assets/hr_placeholder.png";

const SIZE_CLASS = {
  sm: "w-8 h-8 rounded-lg",
  md: "w-10 h-10 rounded-xl",
  lg: "w-12 h-12 rounded-2xl",
};

const PLACEHOLDERS = {
  student: studentPlaceholder,
  trainer: trainerPlaceholder,
  hr: hrPlaceholder,
  user: studentPlaceholder,
};

export function ProfileAvatar({
  src,
  name = "",
  profileType = "student",
  size = "sm",
  onClick,
  className = "",
  disabled = false,
}) {
  const placeholder = PLACEHOLDERS[profileType] || studentPlaceholder;
  const sizeClass = SIZE_CLASS[size] || SIZE_CLASS.sm;
  const initial = name?.trim()?.charAt(0)?.toUpperCase() || "";
  const hasImage = src && String(src).length > 10;

  const content = hasImage ? (
    <img
      src={src}
      alt={name || "Profile"}
      className="w-full h-full object-cover"
      onError={(event) => {
        event.currentTarget.src = placeholder;
      }}
    />
  ) : initial ? (
    <span className="text-xs font-bold text-[#fc362d]">{initial}</span>
  ) : (
    <FiUser className="w-4 h-4 text-[#94a3b8]" />
  );

  const sharedClass = `${sizeClass} shrink-0 overflow-hidden border border-black/[0.08] bg-[#f8fafc] flex items-center justify-center ${className}`;

  if (!onClick || disabled) {
    return <div className={sharedClass}>{content}</div>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${sharedClass} cursor-pointer transition-all hover:ring-2 hover:ring-[#fc362d]/30 hover:border-[#fc362d]/20 focus:outline-none focus:ring-2 focus:ring-[#fc362d]/40`}
      title={`View ${name || "profile"}`}
      aria-label={`View ${name || "profile"}`}
    >
      {content}
    </button>
  );
}

export default ProfileAvatar;
