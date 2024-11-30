import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { db } from "../../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { selectUserID } from "../../redux/slice/authSlice"
import  "./Career.scss"
import { useNavigate } from "react-router-dom";
const Career = () => {
  const userID = useSelector(selectUserID);
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesSnapshot = await getDocs(collection(db, "courses"));
        const coursesData = coursesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCourses(coursesData);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, []);

  if (!userID) {
    return <div>Please log in to view your dashboard.</div>;
  }
  return (
    <div className="student-dashboard">
      <h1>Student Dashboard</h1>
      <div className="course-list">
        {courses.map((course) => (
          <div key={course.id} className="course-card">
            <h2>{course.title}</h2>
            <p>{course.description}</p>
            <div className="chapters">
              {course.chapters.map((chapter, chapterIndex) => (
                <details key={chapterIndex} className="chapter-dropdown">
                  <summary>{chapter.chapterTitle}</summary>
                  <ul>
                    {chapter.videos.map((video, videoIndex) => (
                      <li key={videoIndex}>
                        <button
                          onClick={() =>
                            navigate(`/play-video/${course.id}/${chapterIndex}/${videoIndex}`)
                          }
                        >
                          {video.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Career;
