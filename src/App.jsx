import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router";

import GuestRoute from "./components/GuestRoute";
import { ScrollToTop } from "./components";

import "./App.css";

// 라우트 기반 코드 스플리팅 (초기 번들 최적화)
const Home = lazy(() => import("./pages/Home/Home"));
const CreateAIRecipe = lazy(() => import("./pages/CreateAIRecipe/CreateAIRecipe"));
const RegisterRecipe = lazy(() => import("./pages/RegistRecipe/RegistRecipe"));
const MyPage = lazy(() => import("./pages/MyPage/MyPage"));
const RecipeList = lazy(() => import("./pages/RecipeList/RecipeList"));
const RecipeDetail = lazy(() => import("./pages/RecipeDetail/RecipeDetail"));
const Community = lazy(() => import("./pages/Community/Community"));
const Login = lazy(() => import("./pages/Auth/Login"));
const SignUp = lazy(() => import("./pages/Auth/SignUp"));
const UpdatePassword = lazy(() => import("./pages/Auth/UpdatePassword"));

function PageLoadingFallback() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "60vh",
        color: "var(--brand-primary, #f26b3a)",
        fontSize: "1.125rem",
        fontWeight: 500,
      }}
      role="status"
      aria-live="polite"
    >
      <span>페이지를 불러오는 중...</span>
    </div>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoadingFallback />}>
        <Routes>
          {/* 메인 홈 페이지 */}
          <Route path="/" element={<Home />} />

          {/* 라우팅 페이지 목록 */}
          <Route path="/ai" element={<CreateAIRecipe />} />
          <Route path="/register" element={<RegisterRecipe />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/recipes" element={<RecipeList />} />
          <Route path="/recipes/:id" element={<RecipeDetail />} />
          <Route path="/community" element={<Community />} />
          <Route path="/update-password" element={<UpdatePassword />} />

          {/* 비로그인 사용자만 접근 가능 */}
          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />

          <Route
            path="/signup"
            element={
              <GuestRoute>
                <SignUp />
              </GuestRoute>
            }
          />
        </Routes>
      </Suspense>
    </>
  );
}
