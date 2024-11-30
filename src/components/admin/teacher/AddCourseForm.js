import React, { useState } from "react";
import { db } from "../../../firebase/config";
import { collection, addDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { toast,  } from "react-toastify";

import { v4 as uuidv4 } from "uuid";
import "./AddCourseForm.scss";

const AddCourseForm = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [chapters, setChapters] = useState([{ chapterTitle: "", videos: [] }]);
  const [image, setImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const storage = getStorage();

  const handleFileUpload = (file, path, callback, successMessage) => {
    const fileRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(fileRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload error:", error);
        toast.error("File upload failed!");
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        callback(downloadURL);
        toast.success(successMessage);
      }
    );
  };

  const handleAddVideo = (chapterIndex) => {
    const updatedChapters = [...chapters];
    updatedChapters[chapterIndex].videos.push({ title: "", videoURL: "" });
    setChapters(updatedChapters);
  };

  const handleRemoveVideo = (chapterIndex, videoIndex) => {
    const updatedChapters = [...chapters];
    updatedChapters[chapterIndex].videos.splice(videoIndex, 1);
    setChapters(updatedChapters);
  };

  const handleVideoUpload = (chapterIndex, videoIndex, file) => {
    const uniqueName = `videos/${uuidv4()}-${file.name}`;
    handleFileUpload(file, uniqueName, (downloadURL) => {
      const updatedChapters = [...chapters];
      updatedChapters[chapterIndex].videos[videoIndex].videoURL = downloadURL;
      setChapters(updatedChapters);
    }, "Video uploaded successfully!");
  };

  const handleAddChapter = () => {
    setChapters([...chapters, { chapterTitle: "", videos: [] }]);
  };

  const handleRemoveChapter = (chapterIndex) => {
    const updatedChapters = chapters.filter((_, index) => index !== chapterIndex);
    setChapters(updatedChapters);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (image) {
      const uniqueName = `images/${uuidv4()}-${image.name}`;
      handleFileUpload(
        image,
        uniqueName,
        async (downloadURL) => {
          const courseData = { title, description, imageURL: downloadURL, chapters };
          await addDoc(collection(db, "courses"), courseData);
          toast.success("Course added successfully!");
          resetForm();
        },
        "Image uploaded successfully!"
      );
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setChapters([{ chapterTitle: "", videos: [] }]);
    setImage(null);
    setUploadProgress(0);
  };

  return (
    <div className="add-course-form">
      
      <h2>Add Course</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Course Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Course Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div className="chapters">
          <h3>Chapters</h3>
          {chapters.map((chapter, chapterIndex) => (
            <div key={chapterIndex} className="chapter">
              <div className="chapter-header">
                <input
                  type="text"
                  placeholder={`Chapter ${chapterIndex + 1} Title`}
                  value={chapter.chapterTitle}
                  onChange={(e) => {
                    const updatedChapters = [...chapters];
                    updatedChapters[chapterIndex].chapterTitle = e.target.value;
                    setChapters(updatedChapters);
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => handleRemoveChapter(chapterIndex)}
                  className="remove-chapter-btn"
                >
                  Remove Chapter
                </button>
              </div>
              <div className="videos">
                {chapter.videos.map((video, videoIndex) => (
                  <div key={videoIndex} className="video-item">
                    <input
                      type="text"
                      placeholder="Video Title"
                      value={video.title}
                      onChange={(e) => {
                        const updatedChapters = [...chapters];
                        updatedChapters[chapterIndex].videos[videoIndex].title = e.target.value;
                        setChapters(updatedChapters);
                      }}
                      required
                    />
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) =>
                        handleVideoUpload(chapterIndex, videoIndex, e.target.files[0])
                      }
                      required
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveVideo(chapterIndex, videoIndex)}
                      className="remove-video-btn"
                    >
                      Remove Video
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleAddVideo(chapterIndex)}
                  className="add-video-btn"
                >
                  + Add Video
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddChapter}
            className="add-chapter-btn"
          >
            + Add Chapter
          </button>
        </div>
        <div className="form-group">
          <label>Course Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            required
          />
        </div>
        {uploadProgress > 0 && (
          <div className="progress-bar">
            <div style={{ width: `${uploadProgress}%` }}></div>
          </div>
        )}
        <button type="submit" className="submit-btn">
          Add Course
        </button>
      </form>
    </div>
  );
};

export default AddCourseForm;
