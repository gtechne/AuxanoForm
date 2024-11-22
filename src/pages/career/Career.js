import React from 'react'
import "./Career.scss";
import { FaCog } from "react-icons/fa";
const Career = () => {
  return (
    <div className="working-container">
      <div className="animation-wrapper">
        <FaCog className="gear-icon" />
        <FaCog className="gear-icon small-gear" />
      </div>
      <h1 className="fade-text">We’re working on this</h1>
      <p className="subtitle">
        Please check back soon! We’re putting everything in place 🚧
      </p>
    </div>
  )
}

export default Career
