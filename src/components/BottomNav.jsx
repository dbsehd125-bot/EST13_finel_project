import React from "react";
import { NavLink } from "react-router";
import { Home, Search, Sparkles, MessageSquare, User } from "lucide-react";
import "./BottomNav.css";

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      <NavLink 
        to="/" 
        end 
        className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
      >
        <Home />
        <span>홈</span>
      </NavLink>
      <NavLink 
        to="/recipes" 
        className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
      >
        <Search />
        <span>둘러보기</span>
      </NavLink>
      <NavLink 
        to="/ai" 
        className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
      >
        <Sparkles />
        <span>AI 레시피</span>
      </NavLink>
      <NavLink 
        to="/community" 
        className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
      >
        <MessageSquare />
        <span>커뮤니티</span>
      </NavLink>
      <NavLink 
        to="/mypage" 
        className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
      >
        <User />
        <span>마이</span>
      </NavLink>
    </nav>
  );
}
