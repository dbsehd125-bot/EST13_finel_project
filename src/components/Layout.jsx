import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import "./Layout.css";

export default function Layout({ children, activeMenu = "커뮤니티", fullWidth = false }) {
  return (
    <div className="layout-wrapper">
      <Header activeMenu={activeMenu} />
      <main className={fullWidth ? "layout-content-full" : "layout-content"}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
