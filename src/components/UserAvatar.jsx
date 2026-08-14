import { useState } from "react";

import styles from "./UserAvatar.module.css";

export default function UserAvatar({ src, name = "사용자", size = "md", className = "" }) {
  const [imageError, setImageError] = useState(false);

  const safeName = name?.trim() || "사용자";
  const initial = safeName.charAt(0);

  const showImage = Boolean(src) && !imageError;

  if (showImage) {
    return (
      <img
        className={`${styles.avatar} ${styles[size]} ${className}`}
        src={src}
        alt={`${safeName} 프로필`}
        referrerPolicy="no-referrer"
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div
      className={`${styles.avatar} ${styles.fallback} ${styles[size]} ${className}`}
      aria-label={`${safeName} 프로필`}
    >
      {initial}
    </div>
  );
}
