import React from "react";
import AddCourseForm from "./AddCourseForm";

import "./TeacherPanel.scss";

const TeacherPanel = () => {
  return (
    <div className="teacher-panel">
      <h1>Teacher Panel</h1>
      
      <AddCourseForm />
      
    </div>
  );
};

export default TeacherPanel;
