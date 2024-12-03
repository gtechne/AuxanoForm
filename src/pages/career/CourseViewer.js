import React, { useState, useEffect, useRef } from "react";
import { db } from "../../firebase/config";
import { collection, doc, getDoc, addDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { useSelector } from "react-redux";
import { selectUserName, selectUserID } from "../../redux/slice/authSlice";
import "./CourseViewer.scss";

const CourseViewer = ({ courseId, chapterIndex, videoIndex, onVideoChange }) => {
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

  const handleVideoSelect = (chapterIdx, videoIdx) => {
    onVideoChange(chapterIdx, videoIdx);
  };

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
        <h1 className="video-title">{currentVideo.title}</h1>
        <video
          src={currentVideo.videoURL}
          controls
          onEnded={handleVideoEnd}
          className="responsive-video"
          ref={videoRef}
        />
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
    </div>
  );
};

export default CourseViewer;
