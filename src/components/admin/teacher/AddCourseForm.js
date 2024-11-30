import React, { useState } from "react";
import { db } from "../../../firebase/config";
import { collection, addDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import "./AddCourseForm.scss";

const AddCourseForm = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [chapters, setChapters] = useState([{ title: "", videos: [] }]);
  const [image, setImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const storage = getStorage();

  const handleFileUpload = (file, path, callback) => {
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
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        callback(downloadURL);
      }
    );
  };

  const handleVideoAdd = (chapterIndex, file) => {
    const videoPath = `videos/${file.name}`;
    handleFileUpload(file, videoPath, (downloadURL) => {
      const updatedChapters = [...chapters];
      updatedChapters[chapterIndex].videos.push(downloadURL);
      setChapters(updatedChapters);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (image) {
      const imagePath = `images/${image.name}`;
      handleFileUpload(image, imagePath, async (downloadURL) => {
        const courseData = { title, description, chapters, image: downloadURL };
        await addDoc(collection(db, "courses"), courseData);
        console.log("Course added successfully");
        resetForm();
      });
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setChapters([{ title: "", videos: [] }]);
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
          {chapters.map((chapter, index) => (
            <div key={index} className="chapter">
              <input
                type="text"
                placeholder={`Chapter ${index + 1} Title`}
                value={chapter.title}
                onChange={(e) => {
                  const updatedChapters = [...chapters];
                  updatedChapters[index].title = e.target.value;
                  setChapters(updatedChapters);
                }}
                required
              />
              <input
                type="file"
                accept="video/*"
                onChange={(e) => handleVideoAdd(index, e.target.files[0])}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => setChapters([...chapters, { title: "", videos: [] }])}
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
