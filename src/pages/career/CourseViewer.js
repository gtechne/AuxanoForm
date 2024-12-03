import React, { useState, useEffect, useRef } from "react";
import { db } from "../../firebase/config";
import { collection, doc, getDoc, addDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { useSelector } from "react-redux";
import { selectUserName, selectUserID, selectUserRole } from "../../redux/slice/authSlice";
import "./CourseViewer.scss";

const CourseViewer = ({ courseId, chapterIndex, videoIndex, onVideoChange }) => {
  const [course, setCourse] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [newReply, setNewReply] = useState("");
  const [selectedComment, setSelectedComment] = useState(null);
  const [isVideoCompleted, setIsVideoCompleted] = useState(false);
  const userRole = useSelector(selectUserRole);
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

  const handleVideoSelect = (chapterIdx, videoIdx) => {
    onVideoChange(chapterIdx, videoIdx);
  };

   // Function to handle posting a new comment
const handleCommentSubmit = async () => {
  if (!newComment.trim()) return;

  // Get the role of the user (either 'student' or 'teacher')
  const role = userRole || 'student';  // Fallback to 'student' if userRole is undefined

  const commentPath = `courses/${courseId}/comments/${chapterIndex}/${videoIndex}`;
  
  // Create a new comment in Firestore
  await addDoc(collection(db, commentPath), {
    text: newComment,
    createdAt: new Date(),
    author: userName,
    authorRole: role,  // Store the user's role (either 'student' or 'teacher')
    replies: [],
    likes: 0,
    dislikes: 0,
    reactedUsers: {},
  });

  setNewComment(""); // Reset the input field after submitting
};

// Function to handle posting a reply to a comment
const handleReplySubmit = async () => {
  const role = userRole || 'student';  // Fallback to 'student' if userRole is undefined
  const commentRef = doc(db, `courses/${courseId}/comments/${chapterIndex}/${videoIndex}`, selectedComment.id);
  const commentDoc = await getDoc(commentRef);

  // Prepare the new reply
  const updatedReplies = [
    ...(commentDoc.data().replies || []),
    {
      text: newReply,
      author: userName,
      authorRole: role,  // Store the user's role (either 'student' or 'teacher')
      createdAt: new Date(),
    },
  ];

  // Update the comment document with the new reply
  await updateDoc(commentRef, { replies: updatedReplies });

  setNewReply("");  // Reset the reply input field
  setSelectedComment(null);  // Close the reply section
};

  const handleReact = async (commentId, type) => {
    const commentRef = doc(db, `courses/${courseId}/comments/${chapterIndex}/${videoIndex}`, commentId);
    const commentDoc = await getDoc(commentRef);

    if (commentDoc.exists()) {
      const data = commentDoc.data();
      let updatedReactions = {
        likes: data.likes || 0,
        dislikes: data.dislikes || 0,
        reactedUsers: data.reactedUsers || {},
      };

      if (!updatedReactions.reactedUsers[userId]) {
        updatedReactions.reactedUsers[userId] = null;
      }

      if (updatedReactions.reactedUsers[userId] === type) {
        updatedReactions[type] -= 1;
        updatedReactions.reactedUsers[userId] = null;
      } else {
        if (updatedReactions.reactedUsers[userId] !== null) {
          updatedReactions[updatedReactions.reactedUsers[userId]] -= 1;
        }
        updatedReactions[type] += 1;
        updatedReactions.reactedUsers[userId] = type;
      }

      await updateDoc(commentRef, {
        likes: updatedReactions.likes,
        dislikes: updatedReactions.dislikes,
        reactedUsers: updatedReactions.reactedUsers,
      });
    }
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
  };

  const handleForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime += 10;
    }
  };

  const handleBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime -= 10;
    }
  };

  if (!course || !currentVideo) return <div>Loading...</div>;

  return (
    <div className="course-viewer">
      <div className="sidebar">
        <h2>{course.title}</h2>
        <ul className="chapters">
          {course.chapters.map((chapter, chIndex) => (
            <li key={chIndex} className="chapter">
              <h3>{chapter.chapterTitle}</h3>
              <ul className="videos">
                {chapter.videos.map((video, vidIndex) => (
                  <li
                    key={vidIndex}
                    className={`video ${chIndex === chapterIndex && vidIndex === videoIndex ? "active" : ""}`}
                    onClick={() => handleVideoSelect(chIndex, vidIndex)}
                  >
                    {video.title}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
      <div className="main-content">
      <div className="video-section">
        <h1 className="video-title">{currentVideo.title}</h1>
        <div className="video-container">
        <video
          src={currentVideo.videoURL}
          controls
          onEnded={handleVideoEnd}
          className="responsive-video"
          ref={videoRef}
        />
         <div className="video-controls">
              <button onClick={handleBackward}>⏪ Backward 10s</button>
              <button onClick={handleForward}>⏩ Forward 10s</button>
            </div>
        </div>
        </div>
        <div className="comments-section">
        <h2>Comments</h2>
        <div className="comment-list">
        
       {comments.map((comment) => (
    <div key={comment.id} className="comment">
      <div className="comment-header">
        <strong>By: {comment.author}</strong>  {/* Display the role here */}
      </div>
      <p>{comment.text}</p>
      <div className="comment-actions">
        <button onClick={() => handleReact(comment.id, "likes")}>👍 {comment.likes}</button>
        <button onClick={() => handleReact(comment.id, "dislikes")}>👎 {comment.dislikes}</button>
        <button onClick={() => setSelectedComment(comment)}>Reply</button>
      </div>

      {/* Display replies */}
      {comment.replies && (
        <div className="replies">
          {comment.replies.map((reply, index) => (
            <div key={index} className="reply">
              <strong>{reply.author}</strong> : {/* Display role of reply */}
              <p>{reply.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* Reply section for current comment */}
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
      </div>
    </div>
  );
};

export default CourseViewer;