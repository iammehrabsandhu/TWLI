import React, { useState } from "react";
import {Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import Page2 from "./Pages/Page2";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/Page2" element={<Page2 />} />
    </Routes>
  );
}

export default App;
