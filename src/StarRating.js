import { useState } from "react";
import PropTypes from "prop-types";
// import "./index.css";

const containerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
};

const containerStarStyle = {
  display: "flex",
  gap: "5px",
};

const starStyle = {
  cursor: "pointer",
};

StarRating.propTypes = {
  maxRating: PropTypes.number.isRequired,
};

export default function StarRating({
  maxRating = 5,
  color = "#fcc419",
  size = 24,
  className = "",
  messages = [],
  onSetMovieStar,
}) {
  const [rating, setRating] = useState(0);
  const [tempRating, setTempRating] = useState(0);

  function handleRating(rate) {
    setRating(rating === rate ? 0 : rate);
    onSetMovieStar(rating === rate ? 0 : rate);
  }

  return (
    <div style={containerStyle} className={className}>
      <div style={containerStarStyle}>
        {Array.from({ length: maxRating }, (_, i) => (
          <Star
            key={i}
            full={tempRating ? tempRating >= i + 1 : rating >= i + 1}
            onRate={() => handleRating(i + 1)}
            onHoverIn={() => setTempRating(i + 1)}
            onHoverOut={() => setTempRating(0)}
            color={color}
            size={size}
          />
        ))}
      </div>
      <p style={{ lineHeight: 0, color, fontSize: `${size / 1.5}rem` }}>
        {messages.length === maxRating
          ? messages[tempRating ? tempRating - 1 : rating - 1]
          : tempRating || rating || ""}
      </p>
    </div>
  );
}

function Star({ onRate, full, onHoverIn, onHoverOut, color, size }) {
  return (
    <span
      role="button"
      style={starStyle}
      onClick={onRate}
      onMouseEnter={onHoverIn}
      onMouseLeave={onHoverOut}
    >
      {full ? (
        <i
          className="fa-solid fa-star"
          style={{ color, fontSize: `${size}rem` }}
        ></i>
      ) : (
        <i
          className="fa-regular fa-star"
          style={{ color, fontSize: `${size}rem` }}
        ></i>
      )}
    </span>
  );
}
