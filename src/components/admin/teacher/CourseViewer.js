import React, { useState, useEffect } from "react";
import { db } from "../../../firebase/config";
import { collection, doc, getDoc, addDoc, onSnapshot } from "firebase/firestore";
import "./CourseViewer.scss";

const CourseViewer = ({ courseId }) => {
  const [course, setCourse] = useState(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    const fetchCourse = async () => {
      const courseDoc = await getDoc(doc(db, "courses", courseId));
      setCourse(courseDoc.data());
    };

    const unsubscribe = onSnapshot(
      collection(db, "courses", courseId, "comments"),
      (snapshot) => {
        setComments(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      }
    );

    fetchCourse();
    return () => unsubscribe();
  }, [courseId]);

  const handleCommentSubmit = async () => {
    await addDoc(collection(db, `courses/${courseId}/comments`), {
      text: newComment,
      createdAt: new Date(),
      author: "Student", // Replace with logged-in user info
    });
    setNewComment("");
  };

  if (!course) return <div>Loading...</div>;

  const currentVideo = course.chapters
    ?.flatMap((chapter) => chapter.videos)
    ?.at(currentVideoIndex);

  return (
    <div className="course-viewer">
      <h1>{course.title}</h1>
      <p>{course.description}</p>

      {currentVideo && (
        <div className="video-section">
          <video src={currentVideo} controls />
          <div className="navigation">
            <button
              onClick={() =>
                setCurrentVideoIndex((prev) => Math.max(prev - 1, 0))
              }
            >
              Previous
            </button>
            <button
              onClick={() =>
                setCurrentVideoIndex((prev) =>
                  Math.min(prev + 1, course.chapters.flatMap((c) => c.videos).length - 1)
                )
              }
            >
              Next
            </button>
          </div>
        </div>
      )}

      <div className="comments-section">
        <h2>Comments</h2>
        <div className="comment-list">
          {comments.map((comment) => (
            <div key={comment.id} className="comment">
              <p>{comment.text}</p>
              <span>by {comment.author}</span>
            </div>
          ))}
        </div>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
        />
        <button onClick={handleCommentSubmit}>Post Comment</button>
      </div>
    </div>
  );
};

export default CourseViewer;
