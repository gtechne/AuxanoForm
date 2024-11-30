import React, { useState, useEffect } from "react";
import { db } from "../../firebase/config";
import { collection, doc, getDoc, addDoc, onSnapshot } from "firebase/firestore";
import "./CourseViewer.scss";

const CourseViewer = ({ courseId, chapterIndex, videoIndex }) => {
  const [course, setCourse] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(null);
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

  useEffect(() => {
    if (course && chapterIndex !== undefined && videoIndex !== undefined) {
      const currentChapter = course.chapters[chapterIndex];
      const video = currentChapter?.videos[videoIndex];
      setCurrentVideo(video);
    }
  }, [course, chapterIndex, videoIndex]);

  const handleCommentSubmit = async () => {
    await addDoc(collection(db, `courses/${courseId}/comments`), {
      text: newComment,
      createdAt: new Date(),
      author: "Student", // Replace with logged-in user info
    });
    setNewComment("");
  };

  if (!course || !currentVideo) return <div>Loading...</div>;

  return (
    <div className="course-viewer">
      <h1>{course.title}</h1>
      <p>{course.description}</p>

      <div className="video-section">
        <h2>{currentVideo.title}</h2>
        <video src={currentVideo.videoURL} controls />
        <div className="navigation">
          {chapterIndex > 0 && (
            <button
              onClick={() => {
                // Go to previous chapter's last video
                const prevChapter = course.chapters[chapterIndex - 1];
                const prevVideoIndex = prevChapter.videos.length - 1;
                setCurrentVideo(prevChapter.videos[prevVideoIndex]);
              }}
            >
              Previous
            </button>
          )}

          {chapterIndex < course.chapters.length - 1 || videoIndex < course.chapters[chapterIndex].videos.length - 1 ? (
            <button
              onClick={() => {
                if (videoIndex < course.chapters[chapterIndex].videos.length - 1) {
                  // Go to next video in the same chapter
                  const nextVideoIndex = videoIndex + 1;
                  setCurrentVideo(course.chapters[chapterIndex].videos[nextVideoIndex]);
                } else if (chapterIndex < course.chapters.length - 1) {
                  // Go to the first video in the next chapter
                  const nextChapter = course.chapters[chapterIndex + 1];
                  setCurrentVideo(nextChapter.videos[0]);
                }
              }}
            >
              Next
            </button>
          ) : null}
        </div>
      </div>

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
