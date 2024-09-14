import React, { useCallback, useState } from "react";
import ReactDOM from "react-dom/client";

import "./index.css";
import App from "./App";

import StarRating from "./StarRating";

function Test() {
  const [movieStar, setMovieStar] = useState(0);

  return (
    <>
      <StarRating
        maxRating={10}
        size={30}
        className="test"
        messages={["suck", "bad", "okay", "good", "fucking awsome"]}
        onSetMovieStar={setMovieStar}
      />
      <p>This movie got {movieStar} Stars from you.</p>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
    {/* <Test />
    <Test /> */}
  </React.StrictMode>
);
