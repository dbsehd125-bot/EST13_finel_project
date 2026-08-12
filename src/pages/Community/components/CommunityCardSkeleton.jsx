/**
 * 커뮤니티 게시글 스켈레톤 컴포넌트
 * - 커뮤니티 최초 데이터 로딩 중 표시되는 카드 형태의 로딩 UI
 * - 실제 게시글 카드와 비슷한 구조를 사용하여 화면 깜빡임을 완화
 */
import { Skeleton } from "@mui/material";
import styles from "../Community.module.css";

export default function CommunityCardSkeleton({ index }) {
  const imageHeights = [220, 300, 250, 340, 280, 230, 320, 260, 360];

  return (
    <article className={`${styles.card} ${styles.skeletonCard}`}>
      <div className={styles.profile}>
        <Skeleton variant="circular" width={40} height={40} />
        <div className={styles.skeletonProfileText}>
          <Skeleton variant="text" width={92} height={22} />
          <Skeleton variant="text" width={58} height={18} />
        </div>
      </div>

      <div className={styles.comment}>
        <Skeleton variant="text" width="96%" height={24} />
        <Skeleton variant="text" width="88%" height={24} />
        <Skeleton variant="text" width="64%" height={24} />
      </div>

      <Skeleton
        variant="rectangular"
        width="100%"
        height={imageHeights[index % imageHeights.length]}
      />

      <div className={styles.icons}>
        <Skeleton variant="rounded" width={92} height={34} />
        <Skeleton variant="circular" width={34} height={34} />
      </div>
    </article>
  );
}
