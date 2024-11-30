import React, { useState, useEffect } from "react";
import { db } from "../../firebase/config";
import { collection, doc, getDoc, addDoc, updateDoc, onSnapshot } from "firebase/firestore";
import "./CourseViewer.scss";

const CourseViewer = ({ courseId, chapterIndex, videoIndex, userId }) => {
  const [course, setCourse] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [newReply, setNewReply] = useState("");
  const [selectedComment, setSelectedComment] = useState(null);
  const [isCourseCompleted, setIsCourseCompleted] = useState(false); // Track course completion status

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

  // Fetch completion status from Firestore
  useEffect(() => {
    const fetchCompletionStatus = async () => {
      const userProgressDoc = doc(db, "user_progress", userId, "courses", courseId);
      const userProgressSnap = await getDoc(userProgressDoc);
      if (userProgressSnap.exists()) {
        setIsCourseCompleted(userProgressSnap.data().completed);
      }
    };

    if (userId) {
      fetchCompletionStatus();
    }
  }, [userId, courseId]);

  const handleCommentSubmit = async () => {
    await addDoc(collection(db, `courses/${courseId}/comments`), {
      text: newComment,
      createdAt: new Date(),
      author: "Student", // Replace with logged-in user info
      replies: [],
      likes: 0,
      dislikes: 0
    });
    setNewComment("");
  };

  const handleReplySubmit = async () => {
    const commentRef = doc(db, "courses", courseId, "comments", selectedComment.id);
    await addDoc(collection(commentRef, "replies"), {
      text: newReply,
      createdAt: new Date(),
      author: "Student",
    });
    setNewReply("");
    setSelectedComment(null);
  };

  const handleLike = async (commentId) => {
    const commentRef = doc(db, "courses", courseId, "comments", commentId);
    const commentDoc = await getDoc(commentRef);
    const updatedLikes = commentDoc.data().likes + 1;

    await updateDoc(commentRef, { likes: updatedLikes });
  };

  const handleDislike = async (commentId) => {
    const commentRef = doc(db, "courses", courseId, "comments", commentId);
    const commentDoc = await getDoc(commentRef);
    const updatedDislikes = commentDoc.data().dislikes + 1;

    await updateDoc(commentRef, { dislikes: updatedDislikes });
  };

  // Mark course as completed
  const handleMarkAsCompleted = async () => {
    const userProgressDoc = doc(db, "user_progress", userId, "courses", courseId);
    await updateDoc(userProgressDoc, { completed: true });
    setIsCourseCompleted(true); // Update local state for UI
  };

  if (!course || !currentVideo) return <div>Loading...</div>;

  return (
    <div className="course-viewer">
      <h1>{course.title}</h1>
      <p>{course.description}</p>

      <div className="video-section">
        <h2>{currentVideo.title}</h2>
        <div className="video-container">
          <video src={currentVideo.videoURL} controls />
        </div>
        <div className="navigation">
          {chapterIndex > 0 && (
            <button
              onClick={() => {
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
                  const nextVideoIndex = videoIndex + 1;
                  setCurrentVideo(course.chapters[chapterIndex].videos[nextVideoIndex]);
                } else if (chapterIndex < course.chapters.length - 1) {
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
              <div className="comment-actions">
                <button onClick={() => handleLike(comment.id)}>Like ({comment.likes})</button>
                <button onClick={() => handleDislike(comment.id)}>Dislike ({comment.dislikes})</button>
                <button onClick={() => setSelectedComment(comment)}>Reply</button>
              </div>
              {selectedComment && selectedComment.id === comment.id && (
                <div className="reply-section">
                  <textarea
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    placeholder="Write a reply..."
                  />
                  <button onClick={handleReplySubmit}>Post Reply</button>
                </div>
              )}
              {comment.replies && (
                <div className="replies">
                  {comment.replies.map((reply, index) => (
                    <div key={index} className="reply">
                      <p>{reply.text}</p>
                      <span>by {reply.author}</span>
                    </div>
                  ))}
                </div>
              )}
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

      {!isCourseCompleted && (
        <button className="mark-completed" onClick={handleMarkAsCompleted}>
          Mark as Completed
        </button>
      )}

      {isCourseCompleted && (
        <div className="completion-message">
          <p>You have successfully completed this course!</p>
        </div>
      )}
    </div>
  );
};

export default CourseViewer;
