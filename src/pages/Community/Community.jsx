import { useRef, useState } from "react";
import {
  AddPhotoAlternateOutlined,
  Bookmark,
  BookmarkBorderOutlined,
  Close,
  EditOutlined,
  Favorite,
  FavoriteBorder,
  ModeCommentOutlined,
  SendOutlined,
} from "@mui/icons-material";
import { Button, Dialog, FormControl, IconButton, MenuItem, Select } from "@mui/material";
import Masonry from "@mui/lab/Masonry";

import Layout from "../../components/Layout";
import styles from "./Community.module.css";

const categories = ["인기", "최신", "요리 후기", "질문", "자유 이야기"];

const writableCategories = ["요리 후기", "질문", "자유 이야기"];

const initialCommunityPosts = [
  {
    id: 1,
    nickname: "달콤한아침",
    time: "3시간 전",
    content: "레몬 버터 연어 처음 만들어봤는데 대성공! 레몬 양만 조절하면 완벽해요!",
    image: "https://picsum.photos/seed/salmon1/600/600",
    imageAlt: "레몬 버터 연어",
    likes: 128,
    comments: 24,
    category: "요리 후기",
    recipeName: "레몬 버터 연어 스테이크",
    liked: false,
    bookmarked: false,
  },
  {
    id: 2,
    nickname: "집밥러버",
    time: "5시간 전",
    content: "냉장고에 남은 채소들을 모아서 볶음밥을 만들었어요. 간단한데 정말 맛있네요!",
    image: "https://picsum.photos/seed/rice2/600/500",
    imageAlt: "채소 볶음밥",
    likes: 93,
    comments: 17,
    category: "요리 후기",
    recipeName: "냉장고 채소 볶음밥",
    liked: false,
    bookmarked: false,
  },
  {
    id: 3,
    nickname: "주말의셰프",
    time: "7시간 전",
    content: "크림 파스타에 후추를 넉넉하게 넣으니까 느끼함도 잡히고 향이 훨씬 좋아졌어요.",
    image: "https://picsum.photos/seed/pasta3/600/650",
    imageAlt: "크림 파스타",
    likes: 75,
    comments: 12,
    category: "요리 후기",
    recipeName: "후추 크림 파스타",
    liked: false,
    bookmarked: false,
  },
  {
    id: 4,
    nickname: "요리하는정원",
    time: "어제",
    content: "에어프라이어로 닭다리를 구울 때 겉은 바삭하고 속은 촉촉하게 만드는 방법이 있을까요?",
    image: "https://picsum.photos/seed/chicken4/600/530",
    imageAlt: "에어프라이어 닭다리",
    likes: 42,
    comments: 31,
    category: "질문",
    recipeName: "에어프라이어 닭다리",
    liked: false,
    bookmarked: false,
  },
  {
    id: 5,
    nickname: "한입만",
    time: "어제",
    content:
      "오늘 시장에서 산 토마토가 정말 달아요. 토마토로 만들 수 있는 간단한 요리 추천해주세요!",
    image: "https://picsum.photos/seed/tomato5/600/470",
    imageAlt: "싱싱한 토마토",
    likes: 61,
    comments: 19,
    category: "자유 이야기",
    recipeName: "",
    liked: false,
    bookmarked: false,
  },
];

const initialComments = [
  {
    id: 1,
    writer: "요리하는정원",
    time: "1시간 전",
    content: "우와 플레이팅까지 완벽하네요! 레몬은 몇 개나 넣으셨어요?",
    likes: 12,
  },
  {
    id: 2,
    writer: "집밥러버",
    time: "50분 전",
    content: "저는 반 개만 넣었어요. 한 개 넣으니 좀 시더라고요 ㅎㅎ",
    likes: 8,
  },
  {
    id: 3,
    writer: "주말의셰프",
    time: "30분 전",
    content: "버터를 마지막에 녹여 끼얹으면 풍미가 확 올라와요 🧈",
    likes: 21,
  },
];

const initialWriteForm = {
  category: "자유 이야기",
  content: "",
  recipeName: "",
  image: "",
};

export default function Community() {
  const [selectedCategory, setSelectedCategory] = useState("인기");
  const [posts, setPosts] = useState(initialCommunityPosts);
  const [selectedPostId, setSelectedPostId] = useState(null);

  const [writeModalOpen, setWriteModalOpen] = useState(false);
  const [writeForm, setWriteForm] = useState(initialWriteForm);
  const [writeError, setWriteError] = useState("");

  const fileInputRef = useRef(null);

  const selectedPost = posts.find(post => post.id === selectedPostId) ?? null;

  const detailModalOpen = Boolean(selectedPost);

  const filteredPosts = posts.filter(post => {
    if (selectedCategory === "인기") {
      return true;
    }

    if (selectedCategory === "최신") {
      return true;
    }

    return post.category === selectedCategory;
  });

  function handleDetailModalOpen(postId) {
    setSelectedPostId(postId);
  }

  function handleDetailModalClose() {
    setSelectedPostId(null);
  }

  function handleLikeToggle(postId) {
    setPosts(previousPosts =>
      previousPosts.map(post => {
        if (post.id !== postId) {
          return post;
        }

        return {
          ...post,
          liked: !post.liked,
          likes: post.liked ? Math.max(0, post.likes - 1) : post.likes + 1,
        };
      }),
    );
  }

  function handleBookmarkToggle(postId) {
    setPosts(previousPosts =>
      previousPosts.map(post => {
        if (post.id !== postId) {
          return post;
        }

        return {
          ...post,
          bookmarked: !post.bookmarked,
        };
      }),
    );
  }

  function handleWriteModalOpen() {
    setWriteError("");
    setWriteModalOpen(true);
  }

  function resetWriteForm() {
    setWriteForm(previousForm => {
      if (previousForm.image.startsWith("blob:")) {
        URL.revokeObjectURL(previousForm.image);
      }

      return initialWriteForm;
    });

    setWriteError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleWriteModalClose() {
    setWriteModalOpen(false);
    resetWriteForm();
  }

  function handleWriteFormChange(event) {
    const { name, value } = event.target;

    setWriteForm(previousForm => ({
      ...previousForm,
      [name]: value,
    }));

    if (writeError) {
      setWriteError("");
    }
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setWriteError("이미지 파일만 등록할 수 있습니다.");
      event.target.value = "";
      return;
    }

    const maxFileSize = 5 * 1024 * 1024;

    if (file.size > maxFileSize) {
      setWriteError("이미지는 5MB 이하만 등록할 수 있습니다.");
      event.target.value = "";
      return;
    }

    const imageUrl = URL.createObjectURL(file);

    setWriteForm(previousForm => {
      if (previousForm.image.startsWith("blob:")) {
        URL.revokeObjectURL(previousForm.image);
      }

      return {
        ...previousForm,
        image: imageUrl,
      };
    });

    setWriteError("");
  }

  function handleRemoveImage() {
    setWriteForm(previousForm => {
      if (previousForm.image.startsWith("blob:")) {
        URL.revokeObjectURL(previousForm.image);
      }

      return {
        ...previousForm,
        image: "",
      };
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleWriteSubmit(event) {
    event.preventDefault();

    const trimmedContent = writeForm.content.trim();
    const trimmedRecipeName = writeForm.recipeName.trim();

    if (!writeForm.category) {
      setWriteError("카테고리를 선택해주세요.");
      return;
    }

    if (!trimmedContent) {
      setWriteError("게시글 내용을 입력해주세요.");
      return;
    }

    const newPost = {
      id: Date.now(),
      nickname: "요리하는정원",
      time: "방금 전",
      content: trimmedContent,
      image: writeForm.image,
      imageAlt: trimmedRecipeName || "커뮤니티 게시글 첨부 이미지",
      likes: 0,
      comments: 0,
      category: writeForm.category,
      recipeName: trimmedRecipeName,
      liked: false,
      bookmarked: false,
    };

    setPosts(previousPosts => [newPost, ...previousPosts]);
    setSelectedCategory(writeForm.category);

    setWriteModalOpen(false);
    setWriteForm(initialWriteForm);
    setWriteError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function renderCategoryButton(category) {
    const isSelected = selectedCategory === category;

    return (
      <Button
        key={category}
        type="button"
        variant={isSelected ? "contained" : "outlined"}
        onClick={() => setSelectedCategory(category)}
        className={styles.categoryButton}
        sx={{
          width: "auto",
          minWidth: 0,
          flex: "0 0 auto",

          padding: {
            xs: "7px 16px",
            sm: "8px 18px",
          },

          color: isSelected ? "#fff" : "var(--brand-primary)",

          backgroundColor: isSelected ? "var(--brand-primary)" : "transparent",

          borderColor: "var(--brand-primary)",
          borderRadius: "999px",
          whiteSpace: "nowrap",

          fontSize: {
            xs: "13px",
            sm: "14px",
          },

          boxShadow: "none",

          "&:hover": {
            color: isSelected ? "#fff" : "var(--brand-primary)",

            backgroundColor: isSelected ? "var(--brand-primary-dark)" : "var(--brand-cream)",

            borderColor: "var(--brand-primary-dark)",
            boxShadow: "none",
          },
        }}
      >
        {category}
      </Button>
    );
  }

  return (
    <Layout activeMenu="커뮤니티">
      <section className={styles.communityHeader}>
        <div className={styles.titleArea}>
          <h1 className={`font-display dtext-5xl ${styles.title_h1}`}>커뮤니티</h1>

          <p className={`text-m ${styles.title_p}`}>음식과 레시피를 중심으로 나누는 이야기.</p>
        </div>

        <div className={styles.categoryBar}>
          <div className={styles.category}>
            <div className={styles.categoryRow}>
              {categories.slice(0, 2).map(renderCategoryButton)}
            </div>

            <div className={styles.categoryRow}>
              {categories.slice(2).map(renderCategoryButton)}
            </div>
          </div>

          <Button
            type="button"
            variant="contained"
            startIcon={<EditOutlined />}
            className={styles.writeButton}
            onClick={handleWriteModalOpen}
            sx={{
              flexShrink: 0,

              color: "#fff",
              backgroundColor: "var(--brand-primary)",
              borderRadius: "999px",

              padding: {
                xs: "8px 16px",
                sm: "9px 18px",
              },

              whiteSpace: "nowrap",

              fontSize: {
                xs: "13px",
                sm: "14px",
              },

              boxShadow: "none",

              "&:hover": {
                backgroundColor: "var(--brand-primary-dark)",
                boxShadow: "none",
              },

              "& .MuiButton-startIcon": {
                marginRight: {
                  xs: "4px",
                  sm: "8px",
                },
              },
            }}
          >
            글쓰기
          </Button>
        </div>
      </section>

      <section className={styles.cards}>
        {filteredPosts.length > 0 ? (
          <Masonry
            columns={{
              xs: 1,
              sm: 2,
              md: 3,
            }}
            spacing={2}
          >
            {filteredPosts.map(post => (
              <article
                key={post.id}
                className={styles.card}
                onClick={() => handleDetailModalOpen(post.id)}
              >
                <div className={styles.profile}>
                  <div className={styles.profileImage} />

                  <div className={styles.profileName}>
                    <p className={styles.cardNickname}>{post.nickname}</p>
                    <p className={styles.cardTime}>{post.time}</p>
                  </div>
                </div>

                <div className={styles.comment}>
                  <p className={styles.cardText}>{post.content}</p>
                </div>

                {post.image && (
                  <img className={styles.cardImage} src={post.image} alt={post.imageAlt} />
                )}

                <div className={styles.icons} onClick={event => event.stopPropagation()}>
                  <div className={styles.iconGroup}>
                    <button
                      type="button"
                      className={`${styles.likeButton} ${
                        post.liked ? styles.activeLikeButton : ""
                      }`}
                      aria-label={post.liked ? "좋아요 취소" : "좋아요"}
                      aria-pressed={post.liked}
                      onClick={() => handleLikeToggle(post.id)}
                    >
                      {post.liked ? <Favorite /> : <FavoriteBorder />}
                      <span>{post.likes}</span>
                    </button>

                    <button
                      type="button"
                      className={styles.commentIconButton}
                      aria-label={`댓글 ${post.comments}개 보기`}
                      onClick={() => handleDetailModalOpen(post.id)}
                    >
                      <ModeCommentOutlined />
                      <span>{post.comments}</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    className={`${styles.bookmarkButton} ${
                      post.bookmarked ? styles.activeBookmarkButton : ""
                    }`}
                    aria-label={post.bookmarked ? "북마크 취소" : "게시글 북마크"}
                    aria-pressed={post.bookmarked}
                    onClick={() => handleBookmarkToggle(post.id)}
                  >
                    {post.bookmarked ? <Bookmark /> : <BookmarkBorderOutlined />}
                  </button>
                </div>
              </article>
            ))}
          </Masonry>
        ) : (
          <div className={styles.emptyState}>
            <p>아직 등록된 게시글이 없습니다.</p>

            <button type="button" onClick={handleWriteModalOpen}>
              첫 게시글 작성하기
            </button>
          </div>
        )}
      </section>

      {/* 게시글 상세 모달 */}
      <Dialog
        open={detailModalOpen}
        onClose={handleDetailModalClose}
        maxWidth={false}
        sx={{
          "& .MuiDialog-container": {
            padding: {
              xs: "8px",
              sm: "24px",
              lg: "32px",
            },
          },

          "& .MuiDialog-paper": {
            width: {
              xs: "100%",
              sm: "680px",
              lg: "960px",
            },

            height: {
              xs: "calc(100dvh - 16px)",
              sm: "calc(100dvh - 48px)",
              lg: "640px",
            },

            maxWidth: "none",
            maxHeight: "none",
            margin: 0,

            borderRadius: {
              xs: "22px",
              sm: "28px",
              lg: "32px",
            },

            overflow: "hidden",
          },
        }}
      >
        {selectedPost && (
          <div className={`${styles.modal} ${!selectedPost.image ? styles.modalWithoutImage : ""}`}>
            {selectedPost.image && (
              <div className={styles.modalImageArea}>
                <img
                  className={styles.modalImage}
                  src={selectedPost.image}
                  alt={selectedPost.imageAlt}
                />
              </div>
            )}

            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <div className={styles.modalProfile}>
                  <div className={styles.modalProfileImage} />

                  <div>
                    <p className={styles.modalNickname}>{selectedPost.nickname}</p>

                    <p className={styles.modalTime}>{selectedPost.time}</p>
                  </div>
                </div>

                <div className={styles.modalHeaderButtons}>
                  <IconButton type="button" aria-label="닫기" onClick={handleDetailModalClose}>
                    <Close />
                  </IconButton>
                </div>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.modalPost}>
                  <p className={styles.modalPostText}>{selectedPost.content}</p>

                  {selectedPost.recipeName && (
                    <button type="button" className={styles.recipeButton}>
                      📖 {selectedPost.recipeName}
                    </button>
                  )}
                </div>

                <div className={styles.modalComments}>
                  <p className={styles.commentCount}>댓글 {initialComments.length}</p>

                  {initialComments.map(comment => (
                    <div key={comment.id} className={styles.modalCommentItem}>
                      <div className={styles.commentProfileImage} />

                      <div className={styles.commentContent}>
                        <div className={styles.commentWriter}>
                          <strong>{comment.writer}</strong>
                          <span>{comment.time}</span>
                        </div>

                        <p>{comment.content}</p>

                        <div className={styles.commentLike}>
                          <FavoriteBorder fontSize="small" />
                          <span>{comment.likes}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.modalFooter}>
                <div className={styles.modalActions}>
                  <div className={styles.modalStats}>
                    <button
                      type="button"
                      className={`${styles.modalLikeButton} ${
                        selectedPost.liked ? styles.activeModalAction : ""
                      }`}
                      onClick={() => handleLikeToggle(selectedPost.id)}
                    >
                      {selectedPost.liked ? <Favorite /> : <FavoriteBorder />}
                      <span>{selectedPost.likes}</span>
                    </button>

                    <div className={styles.modalCommentStat}>
                      <ModeCommentOutlined />
                      <span>{selectedPost.comments}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`${styles.modalBookmarkButton} ${
                      selectedPost.bookmarked ? styles.activeModalAction : ""
                    }`}
                    aria-label={selectedPost.bookmarked ? "북마크 취소" : "북마크"}
                    onClick={() => handleBookmarkToggle(selectedPost.id)}
                  >
                    {selectedPost.bookmarked ? <Bookmark /> : <BookmarkBorderOutlined />}
                  </button>
                </div>

                <form className={styles.commentForm} onSubmit={event => event.preventDefault()}>
                  <input type="text" placeholder="댓글을 남겨보세요..." />

                  <IconButton type="submit" aria-label="댓글 등록" className={styles.sendButton}>
                    <SendOutlined />
                  </IconButton>
                </form>
              </div>
            </div>
          </div>
        )}
      </Dialog>

      {/* 글쓰기 모달 */}
      <Dialog
        open={writeModalOpen}
        onClose={handleWriteModalClose}
        maxWidth={false}
        sx={{
          "& .MuiDialog-container": {
            padding: {
              xs: "8px",
              sm: "24px",
            },
          },

          "& .MuiDialog-paper": {
            width: {
              xs: "100%",
              sm: "620px",
            },

            maxWidth: "none",

            maxHeight: {
              xs: "calc(100dvh - 16px)",
              sm: "calc(100dvh - 48px)",
            },

            margin: 0,

            borderRadius: {
              xs: "22px",
              sm: "28px",
            },

            overflow: "hidden",
          },
        }}
      >
        <form className={styles.writeModal} onSubmit={handleWriteSubmit}>
          <div className={styles.writeModalHeader}>
            <div>
              <h2 className="font-display dtext-2xl">커뮤니티 글쓰기</h2>

              <p className="text-sm">음식과 레시피에 관한 이야기를 남겨보세요.</p>
            </div>

            <IconButton type="button" aria-label="글쓰기 창 닫기" onClick={handleWriteModalClose}>
              <Close />
            </IconButton>
          </div>

          <div className={styles.writeModalBody}>
            <div className={styles.writeField}>
              <span>카테고리</span>

              <FormControl fullWidth size="small">
                <Select
                  name="category"
                  value={writeForm.category}
                  onChange={handleWriteFormChange}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        mt: 0.5,
                        borderRadius: "14px",
                        boxShadow: "0 8px 24px rgba(64, 41, 31, 0.12)",
                      },
                    },
                  }}
                  sx={{
                    minHeight: "48px",

                    color: "var(--brand-brown)",
                    backgroundColor: "var(--brand-cream)",
                    borderRadius: "16px",

                    fontFamily: "inherit",

                    fontSize: {
                      xs: "13px",
                      sm: "14px",
                    },

                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "var(--brand-divider)",
                    },

                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "var(--brand-primary)",
                    },

                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "var(--brand-primary)",
                      borderWidth: "1px",
                    },

                    "&.Mui-focused": {
                      boxShadow: "0 0 0 3px rgba(242, 107, 58, 0.12)",
                    },

                    "& .MuiSelect-select": {
                      display: "flex",
                      alignItems: "center",
                      padding: "12px 14px",
                    },
                  }}
                >
                  {writableCategories.map(category => (
                    <MenuItem
                      key={category}
                      value={category}
                      sx={{
                        fontFamily: "inherit",
                        fontSize: "14px",

                        "&.Mui-selected": {
                          color: "var(--brand-primary)",
                          backgroundColor: "var(--brand-cream)",
                        },

                        "&.Mui-selected:hover": {
                          backgroundColor: "var(--brand-beige)",
                        },
                      }}
                    >
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            <label className={styles.writeField}>
              <span>내용</span>

              <textarea
                name="content"
                value={writeForm.content}
                onChange={handleWriteFormChange}
                placeholder="어떤 이야기를 나누고 싶으신가요?"
                maxLength={500}
              />

              <small>{writeForm.content.length}/500</small>
            </label>

            <label className={styles.writeField}>
              <span>연결할 레시피</span>

              <input
                name="recipeName"
                type="text"
                value={writeForm.recipeName}
                onChange={handleWriteFormChange}
                placeholder="레시피 이름을 입력해주세요. (선택)"
                maxLength={60}
              />
            </label>

            <div className={styles.writeImageField}>
              <div className={styles.writeImageLabel}>
                <span>사진</span>
                <small>선택 사항 · 최대 5MB</small>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className={styles.hiddenFileInput}
              />

              {writeForm.image ? (
                <div className={styles.writeImagePreview}>
                  <img src={writeForm.image} alt="업로드 이미지 미리보기" />

                  <button
                    type="button"
                    className={styles.removeImageButton}
                    onClick={handleRemoveImage}
                  >
                    이미지 삭제
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className={styles.imageUploadButton}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <AddPhotoAlternateOutlined />
                  <span>사진 추가하기</span>
                </button>
              )}
            </div>

            <div
              className={`${styles.writeErrorSlot} ${writeError ? styles.writeErrorVisible : ""}`}
              role="alert"
              aria-live="polite"
            >
              {writeError || "\u00A0"}
            </div>
          </div>

          <div className={styles.writeModalFooter}>
            <button
              type="button"
              className={styles.cancelWriteButton}
              onClick={handleWriteModalClose}
            >
              취소
            </button>

            <button type="submit" className={styles.submitWriteButton}>
              등록하기
            </button>
          </div>
        </form>
      </Dialog>
    </Layout>
  );
}
