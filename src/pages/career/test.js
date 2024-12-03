import React, { useState, useEffect, useRef } from "react";
import { db } from "../../firebase/config";
import { collection, doc, getDoc, addDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { useSelector } from "react-redux";
import { selectUserName, selectUserID, selectUserRole } from "../../redux/slice/authSlice";
import "./CourseViewer.scss";

const CourseViewer = ({ courseId,  }) => {
  const [course, setCourse] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [newReply, setNewReply] = useState("");
  const [selectedComment, setSelectedComment] = useState(null);
  const [isVideoCompleted, setIsVideoCompleted] = useState(false);

  // State variables to keep track of chapter and video indices
  const [chapterIndex, setChapterIndex] = useState(0);
  const [videoIndex, setVideoIndex] = useState(0);

  const userName = useSelector(selectUserName);
  const userId = useSelector(selectUserID);
  const userRole = useSelector(selectUserRole);
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

  const handleVideoNavigation = (chapterIdx, videoIdx) => {
    setCurrentVideo(course.chapters[chapterIdx].videos[videoIdx]);
    setChapterIndex(chapterIdx);
    setVideoIndex(videoIdx);
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
          {course.chapters.map((chapter, chapterIdx) => (
            <li key={chapterIdx}>
              <h3>{chapter.chapterTitle}</h3>
              <ul>
                {chapter.videos.map((video, videoIdx) => (
                  <li key={videoIdx}>
                    <button onClick={() => handleVideoNavigation(chapterIdx, videoIdx)}>
                      {video.title}
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>

      <div className="main-content">
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
            <button onClick={handlePrevious}>Previous Video</button>
            <button onClick={handleNext}>Next Video</button>
          </div>
        </div>

        {/* Comments and Reply Section */}
        <div className="comments-section">
        <div className="comment-list">
       {comments.map((comment) => (
    <div key={comment.id} className="comment">
      <div className="comment-header">
        <strong>{comment.author}</strong> ({comment.authorRole}) {/* Display the role here */}
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
              <strong>{reply.author}</strong> ({reply.authorRole}): {/* Display role of reply */}
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


          <div className="add-comment">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a new comment..."
            />
            <button onClick={handleCommentSubmit}>Post Comment</button>
          </div>

          
          </div>
      </div>
    </div>
  );
};

export default CourseViewer;
