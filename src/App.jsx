import React from "react";
import { Route, Routes } from "react-router-dom";
import { Layout } from "./components";

import Community from "./pages/Community";

import "./App.css";

function App() {
  return (
    <Routes>
      <Route
        path="/community"
        element={
          <Layout activeMenu="커뮤니티">
            <Community />
          </Layout>
        }
      />
    </Routes>
  );
}

export default App;
