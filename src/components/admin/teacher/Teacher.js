import React, { useState } from "react";
import { db, storage } from "../../../firebase/config";
import { addDoc, collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";import "./Teacher.scss"
import  "./Teacher.scss"

const Teacher = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [chapters, setChapters] = useState([]);

  // Add a new chapter
  const handleAddChapter = () => {
    setChapters([...chapters, { chapterTitle: "", videos: [] }]);
  };

  // Handle changes in chapter title or video details
  const handleChapterChange = (index, field, value) => {
    const updatedChapters = [...chapters];
    updatedChapters[index][field] = value;
    setChapters(updatedChapters);
  };

  const handleAddVideo = (chapterIndex) => {
    const updatedChapters = [...chapters];
    updatedChapters[chapterIndex].videos.push({ title: "", video: null });
    setChapters(updatedChapters);
  };

  const handleVideoChange = (chapterIndex, videoIndex, field, value) => {
    const updatedChapters = [...chapters];
    updatedChapters[chapterIndex].videos[videoIndex][field] = value;
    setChapters(updatedChapters);
  };

  // Upload the course to Firebase
  const handleUpload = async () => {
    if (!title || !description || !image || chapters.length === 0) {
      alert("Please fill out all fields.");
      return;
    }

    try {
      // Upload course image to Firebase Storage
      const imageRef = ref(storage, `courseImages/${image.name}`);
      const imageUpload = await uploadBytes(imageRef, image);
      const imageURL = await getDownloadURL(imageUpload.ref);

      // Upload each video and prepare chapter data
      const uploadedChapters = await Promise.all(
        chapters.map(async (chapter) => {
          const uploadedVideos = await Promise.all(
            chapter.videos.map(async (video) => {
              const videoRef = ref(storage, `courseVideos/${video.video.name}`);
              const videoUpload = await uploadBytes(videoRef, video.video);
              const videoURL = await getDownloadURL(videoUpload.ref);
              return { title: video.title, videoURL };
            })
          );
          return { chapterTitle: chapter.chapterTitle, videos: uploadedVideos };
        })
      );

      // Store the course in Firestore
      await addDoc(collection(db, "courses"), {
        title,
        description,
        imageURL,
        chapters: uploadedChapters,
      });

      alert("Course uploaded successfully!");
      setTitle("");
      setDescription("");
      setImage(null);
      setChapters([]);
    } catch (error) {
      console.error("Error uploading course:", error);
      alert("Failed to upload course. Please try again.");
    }
  };
  return (
    <div className="teacher-panel">
      <h1>Teacher Panel</h1>
      <div className="form-group">
        <input
          type="text"
          placeholder="Course Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="form-group">
        <textarea
          placeholder="Course Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>
      </div>
      <div className="form-group">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />
      </div>
      <button onClick={handleAddChapter}>Add Chapter</button>

      {chapters.map((chapter, chapterIndex) => (
        <div key={chapterIndex} className="chapter">
          <input
            type="text"
            placeholder="Chapter Title"
            value={chapter.chapterTitle}
            onChange={(e) =>
              handleChapterChange(chapterIndex, "chapterTitle", e.target.value)
            }
          />
          <button onClick={() => handleAddVideo(chapterIndex)}>Add Video</button>
          {chapter.videos.map((video, videoIndex) => (
            <div key={videoIndex} className="video">
              <input
                type="text"
                placeholder="Video Title"
                value={video.title}
                onChange={(e) =>
                  handleVideoChange(chapterIndex, videoIndex, "title", e.target.value)
                }
              />
              <input
                type="file"
                accept="video/*"
                onChange={(e) =>
                  handleVideoChange(
                    chapterIndex,
                    videoIndex,
                    "video",
                    e.target.files[0]
                  )
                }
              />
            </div>
          ))}
        </div>
      ))}

      <button onClick={handleUpload}>Upload Course</button>
    </div>
  );
};

export default Teacher;
