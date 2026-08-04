import React from "react";
import { Routes, Route } from "react-router";
import { Layout } from "./components";
import CreateAIRecipe from "./pages/CreateAIRecipe";
import RegisterRecipe from "./pages/RegistRecipe";
import MyPage from "./pages/MyPage";
import RecipeList from "./pages/RecipeList";
import "./App.css";

export default function App() {
  return (
    <Routes>
      {/* 메인 홈 페이지 */}
      <Route
        path="/"
        element={
          <Layout activeMenu="커뮤니티">
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <h1 className="font-display dtext-5xl" style={{ marginBottom: "16px" }}>
                깃깔나는 레시피
              </h1>
              <p className="text-lg" style={{ color: "#666", marginBottom: "32px" }}>
                통합 Header &amp; Footer 레이아웃 컴포넌트 (가로 최대 1280px)
              </p>
            </div>
          </Layout>
        }
      />

      {/* 라우팅 페이지 목록 */}
      <Route path="/ai" element={<CreateAIRecipe />} />
      <Route path="/register" element={<RegisterRecipe />} />
      <Route path="/mypage" element={<MyPage />} />
      <Route path="/recipes" element={<RecipeList />} />
    </Routes>
  );
}
