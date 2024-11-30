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

  const renderCourseList = () => (
    <ul>
      {courses.map((course) => (
        <li key={course.id}>
          <div className="course-info">
            <h3>{course.title}</h3>
            <img src={course.image} alt={course.title} className="course-image" />
          </div>

          <div className="chapters">
            <h4>Chapters</h4>
            {course.chapters.map((chapter, index) => (
              <div key={index} className="chapter">
                <button
                  className="chapter-toggle"
                  onClick={() =>
                    setSelectedChapterIndex(selectedChapterIndex === index ? null : index)
                  }
                >
                  {chapter.chapterTitle}
                </button>
                {selectedChapterIndex === index && (
                  <div className="videos">
                    {chapter.videos.map((video, videoIndex) => (
                      <div
                        key={videoIndex}
                        className="video-title"
                        onClick={() => handleVideoClick(course.id, index, videoIndex)}
                      >
                        <p>{video.title}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

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
          />
        </div>
      ) : (
        renderCourseList()
      )}
    </div>
  );
};

export default StudentDashboard;
