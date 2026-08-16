import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import BottomNav from "./BottomNav";
import "./Layout.css";

export interface LayoutProps {
  children?: React.ReactNode;
  activeMenu?: string;
  fullWidth?: boolean;
}

export default function Layout({
  children,
  activeMenu = "커뮤니티",
  fullWidth = false,
}: LayoutProps): React.ReactElement {
  return (
    <div className="layout-wrapper">
      <Header />
      <main className={fullWidth ? "layout-content-full" : "layout-content"}>
        {children}
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
