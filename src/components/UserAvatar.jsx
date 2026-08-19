import { useState } from "react";

import styles from "./UserAvatar.module.css";

export default function UserAvatar({ src, name = "사용자", size = "md", className = "" }) {
  const [imageError, setImageError] = useState(false);

  const safeName = name?.trim() || "사용자";
  const initial = safeName.charAt(0);

  // HTTPS 페이지에서 HTTP 이미지 요청 시 Mixed Content 경고가 발생하므로
  // 프로필 이미지 URL이 http://로 시작하면 https://로 변환
  const safeSrc = src?.startsWith("http://") ? src.replace(/^http:\/\//, "https://") : src;

  const showImage = Boolean(safeSrc) && !imageError;

  if (showImage) {
    return (
      <img
        className={`${styles.avatar} ${styles[size]} ${className}`}
        src={safeSrc}
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
