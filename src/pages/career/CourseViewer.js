import React, { useState, useEffect, useRef } from "react";
import { db } from "../../firebase/config";
import { collection, doc, getDoc, addDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { useSelector } from "react-redux";
import { selectUserName, selectUserID } from "../../redux/slice/authSlice";
import "./CourseViewer.scss";

const CourseViewer = ({ courseId, chapterIndex, videoIndex }) => {
  const [course, setCourse] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [newReply, setNewReply] = useState("");
  const [selectedComment, setSelectedComment] = useState(null);
  const [isVideoCompleted, setIsVideoCompleted] = useState(false);

  const userName = useSelector(selectUserName);
  const userId = useSelector(selectUserID);
  const videoRef = useRef(null); // Reference to the video element

  useEffect(() => {
    const fetchCourse = async () => {
      const courseDoc = await getDoc(doc(db, "courses", courseId));
      setCourse(courseDoc.data());
    };

    fetchCourse();
  }, [courseId]);

  useEffect(() => {
    if (course && chapterIndex !== undefined && videoIndex !== undefined) {
      const currentChapter = course.chapters[chapterIndex];
      const video = currentChapter?.videos[videoIndex];
      setCurrentVideo(video);

      // Fetch the comments for the current video
      const commentPath = `courses/${courseId}/comments/${chapterIndex}/${videoIndex}`;
      const unsubscribe = onSnapshot(collection(db, commentPath), (snapshot) => {
        setComments(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      });

      // Cleanup function to unsubscribe from the comments when video changes
      return () => unsubscribe();
    }
  }, [course, chapterIndex, videoIndex, courseId]);

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    const commentPath = `courses/${courseId}/comments/${chapterIndex}/${videoIndex}`;
    await addDoc(collection(db, commentPath), {
      text: newComment,
      createdAt: new Date(),
      author: userName,
      replies: [],
      likes: 0,
      dislikes: 0,
    });
    setNewComment("");
  };

  const handleReplySubmit = async () => {
    const commentRef = doc(db, `courses/${courseId}/comments/${chapterIndex}/${videoIndex}`, selectedComment.id);
    const commentDoc = await getDoc(commentRef);
    const updatedReplies = [...(commentDoc.data().replies || []), { text: newReply, author: userName, createdAt: new Date() }];

    await updateDoc(commentRef, { replies: updatedReplies });
    setNewReply("");
    setSelectedComment(null);
  };

  const handleReact = async (commentId, type) => {
    const commentRef = doc(db, `courses/${courseId}/comments/${chapterIndex}/${videoIndex}`, commentId);
    const commentDoc = await getDoc(commentRef);
    const updatedReactions = { likes: commentDoc.data().likes || 0, dislikes: commentDoc.data().dislikes || 0 };
    updatedReactions[type] += 1;

    await updateDoc(commentRef, updatedReactions);
  };

  const handleVideoEnd = async () => {
    setIsVideoCompleted(true);
    const userProgressDoc = doc(db, "user_progress", userId, "courses", courseId);
    const progressSnap = await getDoc(userProgressDoc);

    if (progressSnap.exists()) {
      await updateDoc(userProgressDoc, {
        completedVideos: [...progressSnap.data().completedVideos, `${chapterIndex}_${videoIndex}`],
      });
    } else {
      await addDoc(collection(db, "user_progress", userId, "courses"), {
        completedVideos: [`${chapterIndex}_${videoIndex}`],
        courseId,
      });
    }

    // Automatically move to the next video
    if (videoIndex < course.chapters[chapterIndex].videos.length - 1) {
      setCurrentVideo(course.chapters[chapterIndex].videos[videoIndex + 1]);
    } else if (chapterIndex < course.chapters.length - 1) {
      setCurrentVideo(course.chapters[chapterIndex + 1].videos[0]);
    }
  };

  const handlePrevious = () => {
    if (videoIndex > 0) {
      setCurrentVideo(course.chapters[chapterIndex].videos[videoIndex - 1]);
    } else if (chapterIndex > 0) {
      setCurrentVideo(course.chapters[chapterIndex - 1].videos[course.chapters[chapterIndex - 1].videos.length - 1]);
    }
  };

  const handleNext = () => {
    if (videoIndex < course.chapters[chapterIndex].videos.length - 1) {
      setCurrentVideo(course.chapters[chapterIndex].videos[videoIndex + 1]);
    } else if (chapterIndex < course.chapters.length - 1) {
      setCurrentVideo(course.chapters[chapterIndex + 1].videos[0]);
    }
  };

  const handleForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime += 10; // Forward 10 seconds
    }
  };

  const handleBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime -= 10; // Backward 10 seconds
    }
  };

  if (!course || !currentVideo) return <div>Loading...</div>;

  return (
    <div className="course-viewer">
      <h1 className="course-title">{course.title}</h1>
      <div className="video-section">
        <h2>{currentVideo.title}</h2>
        <div className="video-container">
          <video
            src={currentVideo.videoURL}
            controls
            onEnded={handleVideoEnd}
            className="responsive-video"
            controlsList="nodownload"
            ref={videoRef}
          />
          <div className="video-controls">
            <button onClick={handleBackward}>⏪ Backward 10s</button>
            <button onClick={handleForward}>⏩ Forward 10s</button>
          </div>
        </div>
        <div className="video-navigation">
          <button onClick={handlePrevious}>Previous</button>
          <button onClick={handleNext}>Next</button>
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
                <button onClick={() => handleReact(comment.id, "likes")}>Like ({comment.likes})</button>
                <button onClick={() => handleReact(comment.id, "dislikes")}>Dislike ({comment.dislikes})</button>
                <button onClick={() => setSelectedComment(comment)}>Reply</button>
              </div>
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

      {isVideoCompleted && (
        <div className="completion-message">
          <p>You have successfully completed this video!</p>
        </div>
      )}
    </div>
  );
};

export default CourseViewer;
