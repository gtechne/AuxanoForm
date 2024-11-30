import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../firebase/config";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import "./videoPlayerPage.scss";

const VideoPlayerPage = () => {
  const { courseId, chapterIndex, videoIndex } = useParams();
  const [course, setCourse] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courseDoc = await getDoc(doc(db, "courses", courseId));
        if (courseDoc.exists()) {
          setCourse(courseDoc.data());
        }
      } catch (error) {
        console.error("Error fetching course:", error);
      }
    };

    fetchCourse();
  }, [courseId]);

  const currentChapter = course?.chapters[chapterIndex];
  const currentVideo = currentChapter?.videos[videoIndex];

  const addComment = async () => {
    if (!newComment.trim()) return;

    const commentData = {
      text: newComment,
      timestamp: new Date(),
    };

    setComments((prev) => [...prev, commentData]);
    setNewComment("");

    try {
      const courseRef = doc(db, "courses", courseId);
      await updateDoc(courseRef, {
        [`chapters.${chapterIndex}.videos.${videoIndex}.comments`]: arrayUnion(
          commentData
        ),
      });
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const goToVideo = (next) => {
    const nextVideoIndex = next
      ? parseInt(videoIndex) + 1
      : parseInt(videoIndex) - 1;
    if (currentChapter?.videos[nextVideoIndex]) {
      navigate(`/play-video/${courseId}/${chapterIndex}/${nextVideoIndex}`);
    } else if (
      next &&
      course?.chapters[parseInt(chapterIndex) + 1]?.videos[0]
    ) {
      navigate(`/play-video/${courseId}/${parseInt(chapterIndex) + 1}/0`);
    } else if (
      !next &&
      course?.chapters[parseInt(chapterIndex) - 1]?.videos.slice(-1)[0]
    ) {
      navigate(
        `/play-video/${courseId}/${parseInt(chapterIndex) - 1}/${
          course.chapters[parseInt(chapterIndex) - 1].videos.length - 1
        }`
      );
    }
  };

  if (!course || !currentVideo) return <div>Loading...</div>;

  return (
    <div className="video-player-page">
      <h1>{course.title}</h1>
      <h2>{currentVideo.title}</h2>
      <video src={currentVideo.videoURL} controls autoPlay className="video-player" />
      <div className="navigation-buttons">
        <button onClick={() => goToVideo(false)} disabled={!videoIndex && !chapterIndex}>
          Previous
        </button>
        <button onClick={() => goToVideo(true)} disabled={!currentChapter?.videos[videoIndex + 1]}>
          Next
        </button>
      </div>
      <div className="comments-section">
        <h3>Comments</h3>
        <ul>
          {(currentVideo.comments || comments).map((comment, index) => (
            <li key={index}>{comment.text}</li>
          ))}
        </ul>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
        />
        <button onClick={addComment}>Post Comment</button>
      </div>
    </div>
  );
};

export default VideoPlayerPage;
