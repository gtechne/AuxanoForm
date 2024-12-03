import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../../firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, deleteObject, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { toast } from "react-toastify";
import "./EditCourse.scss";

const EditCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const storage = getStorage();

  const fetchCourse = async () => {
    try {
      const courseDoc = await getDoc(doc(db, "courses", courseId));
      if (courseDoc.exists()) {
        setCourse(courseDoc.data());
      } else {
        toast.error("Course not found!");
        navigate("/admin/coursemanagement");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch the course.");
    }
  };

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

  const handleImageChange = (file) => {
    const uniqueName = `images/${courseId}-${file.name}`;
    handleFileUpload(file, uniqueName, (downloadURL) => {
      setCourse({ ...course, imageURL: downloadURL });
    }, "Image updated successfully!");
  };

  const handleVideoChange = (chapterIndex, videoIndex, file) => {
    const uniqueName = `videos/${courseId}-${file.name}`;
    handleFileUpload(file, uniqueName, (downloadURL) => {
      const updatedChapters = [...course.chapters];
      updatedChapters[chapterIndex].videos[videoIndex].videoURL = downloadURL;
      setCourse({ ...course, chapters: updatedChapters });
    }, "Video updated successfully!");
  };

  const handleAddChapter = () => {
    const updatedChapters = [
      ...course.chapters,
      { chapterTitle: `New Chapter ${course.chapters.length + 1}`, videos: [] },
    ];
    setCourse({ ...course, chapters: updatedChapters });
  };

  const handleAddVideo = (chapterIndex) => {
    const updatedChapters = [...course.chapters];
    updatedChapters[chapterIndex].videos.push({ title: `New Video`, videoURL: "" });
    setCourse({ ...course, chapters: updatedChapters });
  };

  const handleRemoveVideo = (chapterIndex, videoIndex) => {
    const updatedChapters = [...course.chapters];
    const videoToRemove = updatedChapters[chapterIndex].videos[videoIndex];
    if (videoToRemove.videoURL) {
      const fileRef = ref(storage, videoToRemove.videoURL);
      deleteObject(fileRef)
        .then(() => toast.success("Video removed successfully!"))
        .catch((error) => console.error("Error removing video:", error));
    }
    updatedChapters[chapterIndex].videos.splice(videoIndex, 1);
    setCourse({ ...course, chapters: updatedChapters });
  };

  const handleRemoveChapter = (chapterIndex) => {
    const updatedChapters = course.chapters.filter((_, index) => index !== chapterIndex);
    setCourse({ ...course, chapters: updatedChapters });
    toast.success("Chapter removed successfully!");
  };

  const handleSave = async () => {
    try {
      await updateDoc(doc(db, "courses", courseId), course);
      toast.success("Course updated successfully!");
      navigate("/admin/coursemanagement");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update the course.");
    }
  };

  useEffect(() => {
    fetchCourse();
  }, []);

  if (!course) return <p>Loading...</p>;

  return (
    <div className="edit-course">
      <h2>Edit Course</h2>
      <div className="form-group">
        <label>Course Title</label>
        <input
          type="text"
          value={course.title}
          onChange={(e) => setCourse({ ...course, title: e.target.value })}
        />
      </div>
      <div className="form-group">
        <label>Course Description</label>
        <textarea
          value={course.description}
          onChange={(e) => setCourse({ ...course, description: e.target.value })}
        />
      </div>
      <div className="form-group">
        <label>Course Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleImageChange(e.target.files[0])}
        />
        {course.imageURL && <img src={course.imageURL} alt="Course" />}
      </div>
      <div className="chapters">
        <h3>Chapters</h3>
        {course.chapters.map((chapter, chapterIndex) => (
          <div key={chapterIndex} className="chapter">
            <div className="form-group">
              <label>Chapter Title</label>
              <input
                type="text"
                value={chapter.chapterTitle}
                onChange={(e) => {
                  const updatedChapters = [...course.chapters];
                  updatedChapters[chapterIndex].chapterTitle = e.target.value;
                  setCourse({ ...course, chapters: updatedChapters });
                }}
              />
              <button
                type="button"
                onClick={() => handleRemoveChapter(chapterIndex)}
                className="remove-btn"
              >
                Remove Chapter
              </button>
            </div>
            <div className="videos">
              <h4>Videos</h4>
              {chapter.videos.map((video, videoIndex) => (
                <div key={videoIndex} className="video-item">
                  <div className="form-group">
                    <label>Video Title</label>
                    <input
                      type="text"
                      value={video.title}
                      onChange={(e) => {
                        const updatedChapters = [...course.chapters];
                        updatedChapters[chapterIndex].videos[videoIndex].title = e.target.value;
                        setCourse({ ...course, chapters: updatedChapters });
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Change Video</label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleVideoChange(chapterIndex, videoIndex, e.target.files[0])}
                    />
                  </div>
                  {video.videoURL && (
                    <video controls src={video.videoURL} width="100%" />
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveVideo(chapterIndex, videoIndex)}
                    className="remove-btn"
                  >
                    Remove Video
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => handleAddVideo(chapterIndex)}
                className="add-btn"
              >
                + Add Video
              </button>
            </div>
          </div>
        ))}
        <button type="button" onClick={handleAddChapter} className="add-btn">
          + Add Chapter
        </button>
      </div>
      {uploadProgress > 0 && (
        <div className="progress-bar">
          <div style={{ width: `${uploadProgress}%` }}></div>
        </div>
      )}
      <button onClick={handleSave} className="save-btn">
        Save Changes
      </button>
      <button onClick={() => navigate("/admin/coursemanagement")} className="cancel-btn">
        Cancel
      </button>
    </div>
  );
};

export default EditCourse;
