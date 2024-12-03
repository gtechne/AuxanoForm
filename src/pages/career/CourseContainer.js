import React, { useState } from "react";
import CourseViewer from "./CourseViewer";

const CourseContainer = ({ courseId }) => {
  const [chapterIndex, setChapterIndex] = useState(0);
  const [videoIndex, setVideoIndex] = useState(0);

  return (
    <CourseViewer
      courseId={courseId}
      chapterIndex={chapterIndex}
      videoIndex={videoIndex}
      setChapterIndex={setChapterIndex}
      setVideoIndex={setVideoIndex}
    />
  );
};

export default CourseContainer;
