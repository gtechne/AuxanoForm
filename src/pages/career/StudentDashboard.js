import React, { useState, useEffect } from "react";
import { db } from "../../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import CourseViewer from "./CourseViewer";
import "./StudentDashboard.scss";

const StudentDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      const courseSnapshot = await getDocs(collection(db, "courses"));
      const courseList = courseSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCourses(courseList);
    };

    fetchCourses();
  }, []);

  const handleVideoClick = (courseId, chapterIndex, videoIndex) => {
    setSelectedCourseId(courseId);
    setSelectedVideoId({ chapterIndex, videoIndex });
  };
  const handleVideoChange = (chapterIdx, videoIdx) => {
    setSelectedVideoId({ chapterIndex: chapterIdx, videoIndex: videoIdx });
  };

  const renderCourseList = () => (
    <ul className="course-list">
      {courses.map((course) => (
        <li key={course.id} className="course-item">
          <div className="course-info">
            <h3>{course.title}</h3>
            {/* Ensure the imageURL is accessed correctly */}
            {course.imageURL ? (
              <img
                src={course.imageURL}
                alt={course.title}
                className="course-image"
              />
            ) : (
              <div className="placeholder-image">No Image Available</div>
            )}
          </div>

          <div className="chapters">
            <h4>Chapters</h4>
            {course.chapters.map((chapter, index) => (
              <details key={index} className="chapter">
                <summary
                  className="chapter-toggle"
                  onClick={() =>
                    setSelectedChapterIndex(
                      selectedChapterIndex === index ? null : index
                    )
                  }
                >
                  {chapter.chapterTitle}
                </summary>
                {selectedChapterIndex === index && (
                  <div className="videos">
                    {chapter.videos.map((video, videoIndex) => (
                      <div
                        key={videoIndex}
                        className="video-title"
                        onClick={() =>
                          handleVideoClick(course.id, index, videoIndex)
                        }
                      >
                        <p>{video.title}</p>
                      </div>
                    ))}
                  </div>
                )}
              </details>
            ))}
          </div>
          <h4>Description</h4>
          <p className="course-description">{course.description}</p>

          <button
            onClick={() => setSelectedCourseId(course.id)}
            className="view-course-btn"
          >
            View Course Details
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="student-dashboard">
      <h1>Student Dashboard</h1>
      {selectedCourseId && selectedVideoId ? (
        <div>
          <button onClick={() => setSelectedCourseId(null)} className="back-btn">
            Back to Course List
          </button>
          <CourseViewer
            courseId={selectedCourseId}
            chapterIndex={selectedVideoId.chapterIndex}
            videoIndex={selectedVideoId.videoIndex}
            onVideoChange={handleVideoChange}
          />
        </div>
      ) : (
        renderCourseList()
      )}
    </div>
  );
};

export default StudentDashboard;
