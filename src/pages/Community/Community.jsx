import { useState } from "react";
import {
  Favorite,
  FavoriteBorder,
  Bookmark,
  BookmarkBorderOutlined,
  ModeCommentOutlined,
  ModeComment,
  Close,
  FlagOutlined,
  SendOutlined,
} from "@mui/icons-material";
import { Button, Checkbox, Dialog, IconButton } from "@mui/material";
import Masonry from "@mui/lab/Masonry";

import styles from "./Community.module.css";
import Layout from "../../components/Layout";

export default function Community() {
  const [selectedCategory, setSelectedCategory] = useState("인기");
  const [modalOpen, setModalOpen] = useState(false);

  const categories = ["인기", "최신", "요리 후기", "질문", "자유 이야기"];

  const handleModalOpen = () => {
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  return (
    <Layout activeMenu="커뮤니티">
      <section>
        <div className="title">
          <h1 className={`font-display dtext-5xl ${styles.title_h1}`}>커뮤니티</h1>
          <p className={`text-m ${styles.title_p}`}>음식과 레시피를 중심으로 나누는 이야기.</p>
        </div>
        <div className={styles.category}>
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "contained" : "outlined"}
              onClick={() => setSelectedCategory(category)}
              sx={{
                color: selectedCategory === category ? "#fff" : "var(--brand-primary)",

                backgroundColor:
                  selectedCategory === category ? "var(--brand-primary)" : "transparent",

                borderColor: "var(--brand-primary)",

                "&:hover": {
                  backgroundColor:
                    selectedCategory === category
                      ? "var(--brand-primary-dark)"
                      : "var(--brand-cream)",
                  borderColor: "var(--brand-primary-dark)",
                },
                borderRadius: "50px",
              }}
            >
              {category}
            </Button>
          ))}
        </div>
      </section>
      <section className={styles.cards}>
        <Masonry
          columns={{
            xs: 1,
            sm: 2,
            md: 3,
          }}
          spacing={2}
        >
          <div className={styles.card} onClick={handleModalOpen}>
            <div className={styles.profile}>
              <div className={styles.profileImage} />
              <div className={styles.profileName}>
                <p className="text-m" style={{ color: "var(--brand-brown)" }}>
                  닉네임
                </p>
                <p className="text-sm" style={{ color: "var(--brand-gray)" }}>
                  n시간 전
                </p>
              </div>
            </div>
            <div className={styles.comment}>
              <p className="text-lg" style={{ color: "var(--brand-brown)" }}>
                레몬 버터 연어 처음 만들어봤는데 대성공! 레몬 양만 조절하면 완벽해요!
              </p>
            </div>
            <img
              className={styles.cardImage}
              src="https://picsum.photos/600/700"
              alt="테스트 이미지1"
            />
            <div className={styles.icons} onClick={event => event.stopPropagation()}>
              <div>
                <Checkbox icon={<FavoriteBorder />} checkedIcon={<Favorite />} />
                <Checkbox icon={<ModeCommentOutlined />} checkedIcon={<ModeComment />} />
              </div>
              <Checkbox icon={<BookmarkBorderOutlined />} checkedIcon={<Bookmark />} />
            </div>
          </div>
          <div className={styles.card} onClick={handleModalOpen}>
            <div className={styles.profile}>
              <div className={styles.profileImage} />
              <div className={styles.profileName}>
                <p className="text-m" style={{ color: "var(--brand-brown)" }}>
                  닉네임
                </p>
                <p className="text-sm" style={{ color: "var(--brand-gray)" }}>
                  n시간 전
                </p>
              </div>
            </div>
            <div className={styles.comment}>
              <p className="text-lg" style={{ color: "var(--brand-brown)" }}>
                레몬 버터 연어 처음 만들어봤는데 대성공! 레몬 양만 조절하면 완벽해요!
              </p>
            </div>
            <img
              className={styles.cardImage}
              src="https://picsum.photos/600/600"
              alt="테스트 이미지1"
            />
            <div className={styles.icons} onClick={event => event.stopPropagation()}>
              <div>
                <Checkbox icon={<FavoriteBorder />} checkedIcon={<Favorite />} />
                <Checkbox icon={<ModeCommentOutlined />} checkedIcon={<ModeComment />} />
              </div>
              <Checkbox icon={<BookmarkBorderOutlined />} checkedIcon={<Bookmark />} />
            </div>
          </div>
          <div className={styles.card} onClick={handleModalOpen}>
            <div className={styles.profile}>
              <div className={styles.profileImage} />
              <div className={styles.profileName}>
                <p className="text-m" style={{ color: "var(--brand-brown)" }}>
                  닉네임
                </p>
                <p className="text-sm" style={{ color: "var(--brand-gray)" }}>
                  n시간 전
                </p>
              </div>
            </div>
            <div className={styles.comment}>
              <p className="text-lg" style={{ color: "var(--brand-brown)" }}>
                레몬 버터 연어 처음 만들어봤는데 대성공! 레몬 양만 조절하면 완벽해요!
              </p>
            </div>
            <img
              className={styles.cardImage}
              src="https://picsum.photos/600/500"
              alt="테스트 이미지1"
            />
            <div className={styles.icons} onClick={event => event.stopPropagation()}>
              <div>
                <Checkbox icon={<FavoriteBorder />} checkedIcon={<Favorite />} />
                <Checkbox icon={<ModeCommentOutlined />} checkedIcon={<ModeComment />} />
              </div>
              <Checkbox icon={<BookmarkBorderOutlined />} checkedIcon={<Bookmark />} />
            </div>
          </div>
          <div className={styles.card} onClick={handleModalOpen}>
            <div className={styles.profile}>
              <div className={styles.profileImage} />
              <div className={styles.profileName}>
                <p className="text-m" style={{ color: "var(--brand-brown)" }}>
                  닉네임
                </p>
                <p className="text-sm" style={{ color: "var(--brand-gray)" }}>
                  n시간 전
                </p>
              </div>
            </div>
            <div className={styles.comment}>
              <p className="text-lg" style={{ color: "var(--brand-brown)" }}>
                레몬 버터 연어 처음 만들어봤는데 대성공! 레몬 양만 조절하면 완벽해요!
              </p>
            </div>
            <img
              className={styles.cardImage}
              src="https://picsum.photos/600/650"
              alt="테스트 이미지1"
            />
            <div className={styles.icons} onClick={event => event.stopPropagation()}>
              <div>
                <Checkbox icon={<FavoriteBorder />} checkedIcon={<Favorite />} />
                <Checkbox icon={<ModeCommentOutlined />} checkedIcon={<ModeComment />} />
              </div>
              <Checkbox icon={<BookmarkBorderOutlined />} checkedIcon={<Bookmark />} />
            </div>
          </div>
          <div className={styles.card} onClick={handleModalOpen}>
            <div className={styles.profile}>
              <div className={styles.profileImage} />
              <div className={styles.profileName}>
                <p className="text-m" style={{ color: "var(--brand-brown)" }}>
                  닉네임
                </p>
                <p className="text-sm" style={{ color: "var(--brand-gray)" }}>
                  n시간 전
                </p>
              </div>
            </div>
            <div className={styles.comment}>
              <p className="text-lg" style={{ color: "var(--brand-brown)" }}>
                레몬 버터 연어 처음 만들어봤는데 대성공! 레몬 양만 조절하면 완벽해요!
              </p>
            </div>
            <img
              className={styles.cardImage}
              src="https://picsum.photos/600/530"
              alt="테스트 이미지1"
            />
            <div className={styles.icons} onClick={event => event.stopPropagation()}>
              <div>
                <Checkbox icon={<FavoriteBorder />} checkedIcon={<Favorite />} />
                <Checkbox icon={<ModeCommentOutlined />} checkedIcon={<ModeComment />} />
              </div>
              <Checkbox icon={<BookmarkBorderOutlined />} checkedIcon={<Bookmark />} />
            </div>
          </div>
          <div className={styles.card} onClick={handleModalOpen}>
            <div className={styles.profile}>
              <div className={styles.profileImage} />
              <div className={styles.profileName}>
                <p className="text-m" style={{ color: "var(--brand-brown)" }}>
                  닉네임
                </p>
                <p className="text-sm" style={{ color: "var(--brand-gray)" }}>
                  n시간 전
                </p>
              </div>
            </div>
            <div className={styles.comment}>
              <p className="text-lg" style={{ color: "var(--brand-brown)" }}>
                레몬 버터 연어 처음 만들어봤는데 대성공! 레몬 양만 조절하면 완벽해요!
              </p>
            </div>
            <img
              className={styles.cardImage}
              src="https://picsum.photos/600/470"
              alt="테스트 이미지1"
            />
            <div className={styles.icons} onClick={event => event.stopPropagation()}>
              <div>
                <Checkbox icon={<FavoriteBorder />} checkedIcon={<Favorite />} />
                <Checkbox icon={<ModeCommentOutlined />} checkedIcon={<ModeComment />} />
              </div>
              <Checkbox icon={<BookmarkBorderOutlined />} checkedIcon={<Bookmark />} />
            </div>
          </div>
        </Masonry>
      </section>
      <Dialog
        open={modalOpen}
        onClose={handleModalClose}
        maxWidth={false}
        sx={{
          "& .MuiDialog-container": {
            padding: {
              xs: "12px",
              sm: "32px",
            },
          },

          "& .MuiDialog-paper": {
            width: {
              xs: "100%",
              sm: "680px",
              lg: "960px",
            },

            height: {
              xs: "calc(100vh - 24px)",
              sm: "calc(100vh - 64px)",
              lg: "640px",
            },

            maxWidth: "none",
            maxHeight: "none",
            margin: 0,

            borderRadius: {
              xs: "24px",
              sm: "28px",
              lg: "32px",
            },

            overflow: "hidden",
          },
        }}
      >
        <div className={styles.modal}>
          {/* 왼쪽 이미지 */}
          <div className={styles.modalImageArea}>
            <img
              className={styles.modalImage}
              src="https://picsum.photos/seed/salmon/900/1200"
              alt="레몬 버터 연어"
            />
          </div>

          {/* 오른쪽 내용 */}
          <div className={styles.modalContent}>
            {/* 작성자 */}
            <div className={styles.modalHeader}>
              <div className={styles.modalProfile}>
                <div className={styles.modalProfileImage} />

                <div>
                  <p className={styles.modalNickname}>달콤한아침</p>
                  <p className={styles.modalTime}>3일 전</p>
                </div>
              </div>

              <div className={styles.modalHeaderButtons}>
                <IconButton aria-label="신고">
                  <FlagOutlined />
                </IconButton>

                <IconButton aria-label="닫기" onClick={handleModalClose}>
                  <Close />
                </IconButton>
              </div>
            </div>

            {/* 게시글 및 댓글 */}
            <div className={styles.modalBody}>
              <div className={styles.modalPost}>
                <p className={styles.modalPostText}>
                  레몬 버터 연어 처음 만들어봤는데 대성공! 레몬 양만 조절하면 완벽해요 🍋
                </p>

                <button type="button" className={styles.recipeButton}>
                  📖 레몬 버터 연어 스테이크
                </button>
              </div>

              <div className={styles.modalComments}>
                <p className={styles.commentCount}>댓글 3</p>

                <div className={styles.modalCommentItem}>
                  <div className={styles.commentProfileImage} />

                  <div className={styles.commentContent}>
                    <div className={styles.commentWriter}>
                      <strong>요리하는정원</strong>
                      <span>1시간 전</span>
                    </div>

                    <p>우와 플레이팅까지 완벽하네요! 레몬은 몇 개나 넣으셨어요?</p>

                    <div className={styles.commentLike}>
                      <FavoriteBorder fontSize="small" />
                      <span>12</span>
                    </div>
                  </div>
                </div>

                <div className={styles.modalCommentItem}>
                  <div className={styles.commentProfileImage} />

                  <div className={styles.commentContent}>
                    <div className={styles.commentWriter}>
                      <strong>집밥러버</strong>
                      <span>50분 전</span>
                    </div>

                    <p>저는 반 개만 넣었어요. 한 개 넣으니 좀 시더라고요 ㅎㅎ</p>

                    <div className={styles.commentLike}>
                      <FavoriteBorder fontSize="small" />
                      <span>8</span>
                    </div>
                  </div>
                </div>

                <div className={styles.modalCommentItem}>
                  <div className={styles.commentProfileImage} />

                  <div className={styles.commentContent}>
                    <div className={styles.commentWriter}>
                      <strong>주말의셰프</strong>
                      <span>30분 전</span>
                    </div>

                    <p>버터를 마지막에 녹여 끼얹으면 풍미가 확 올라와요 🧈</p>

                    <div className={styles.commentLike}>
                      <FavoriteBorder fontSize="small" />
                      <span>21</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 좋아요 및 북마크 */}
            <div className={styles.modalActions}>
              <div className={styles.modalStats}>
                <button type="button">
                  <FavoriteBorder />
                  <span>128</span>
                </button>

                <button type="button">
                  <ModeCommentOutlined />
                  <span>24</span>
                </button>
              </div>

              <IconButton aria-label="저장">
                <BookmarkBorderOutlined />
              </IconButton>
            </div>

            {/* 댓글 작성 */}
            <form className={styles.commentForm} onSubmit={event => event.preventDefault()}>
              <input type="text" placeholder="댓글을 남겨보세요..." />

              <IconButton type="submit" aria-label="댓글 등록" className={styles.sendButton}>
                <SendOutlined />
              </IconButton>
            </form>
          </div>
        </div>
      </Dialog>
    </Layout>
  );
}
