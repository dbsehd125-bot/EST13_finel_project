import React from "react";
import { Routes, Route } from "react-router";
import Home from "./pages/Home";
import CreateAIRecipe from "./pages/CreateAIRecipe";
import RegisterRecipe from "./pages/RegistRecipe";
import MyPage from "./pages/MyPage";
import RecipeList from "./pages/RecipeList";
import Community from "./pages/Community";
import RecipeDetail from "./pages/RecipeDetail";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import "./App.css";

export default function App() {
  return (
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
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
    </Routes>
  );
}
