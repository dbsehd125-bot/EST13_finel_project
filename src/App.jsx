import React from "react";
import { Layout } from "./components";
import "./App.css";

function App() {
  return (
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
  );
}

export default App;
