import { useEffect, useState } from "react";
import { db } from "../../../firebase/config";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { toast } from "react-toastify";
import Card from "../../card/Card";
import "./answer.scss";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import spinnerImg from "../../../assets/2.gif"
const Answer = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState({});
  const storage = getStorage();

  // Fetch questions from Firestore
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "questions"));
        const fetchedQuestions = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        fetchedQuestions.sort((a, b) => a.order - b.order);
        setQuestions(fetchedQuestions);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching questions: ", error);
        toast.error("Failed to load questions");
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // Handle input change
  const handleChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  // Function to handle file upload with unique name and progress
  const handleFileUpload = async (file, questionId) => {
    const uniqueFileName = `${Date.now()}_${file.name}`;
    const fileRef = ref(storage, `answers/${questionId}/${uniqueFileName}`);
    const uploadTask = uploadBytesResumable(fileRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setUploadProgress((prev) => ({ ...prev, [questionId]: progress }));
        },
        (error) => {
          console.error("Error uploading file:", error);
          toast.error("File upload failed.");
          reject(null);
        },
        async () => {
          const fileURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(fileURL);
        }
      );
    });
  };

  // Submit answers to Firestore
  const handleSubmit = async (e) => {
    e.preventDefault();

    const answersWithFiles = {};
    let username = "";

    for (const [questionId, value] of Object.entries(answers)) {
      const question = questions.find((q) => q.id === questionId);

      if (question && question.question.toLowerCase() === "name") {
        username = value; // Set the username if the question is "Name"
      }

      if (value instanceof File) {
        const fileURL = await handleFileUpload(value, questionId);
        if (fileURL) {
          answersWithFiles[questionId] = fileURL;
        }
      } else {
        answersWithFiles[questionId] = value;
      }
    }

    try {
      await addDoc(collection(db, "answers"), {
        answers: answersWithFiles,
        username: username, // Save the username field in Firestore
        submittedAt: new Date(),
        fileUrl: Object.values(answersWithFiles).filter((url) =>
          typeof url === "string" && url.startsWith("http")
        ),
      });
      toast.success("Thank you for submitting your answers!");
      setAnswers({});
      setUploadProgress({});
    } catch (error) {
      console.error("Error saving answers: ", error);
      toast.error("Failed to submit answers. Please try again.");
    }
  };

  if (loading) {
    return <div><img src={spinnerImg} alt="Loading..." style={{ width: "50px" }} /></div>;
  }

  return (
    <div className="home-page">
      <Card>
        <h2>Auxano Solar Interview Form</h2>
        <form onSubmit={handleSubmit}>
          {questions.map((q) => (
            <div key={q.id} className="form-group">
              <label>{q.question}</label>

              {/* Text Input */}
              {q.type === "text" && (
                <input
                  type="text"
                  value={answers[q.id] || ""}
                  onChange={(e) => handleChange(q.id, e.target.value)}
                />
              )}

              {/* Multiple Choice */}
              {q.type === "multiple-choice" && q.options && Array.isArray(q.options) && (
                <div>
                  {q.options.map((option, idx) => (
                    <label key={idx}>
                      <input
                        type="radio"
                        name={q.id}
                        value={option}
                        checked={answers[q.id] === option}
                        onChange={(e) => handleChange(q.id, option)}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              )}

              {/* Checkbox */}
              {q.type === "checkbox" && q.options && Array.isArray(q.options) && (
                <div>
                  {q.options.map((option, idx) => (
                    <label key={idx}>
                      <input
                        type="checkbox"
                        value={option}
                        checked={answers[q.id]?.includes(option) || false}
                        onChange={(e) => {
                          const prevAnswers = answers[q.id] || [];
                          handleChange(
                            q.id,
                            e.target.checked
                              ? [...prevAnswers, option]
                              : prevAnswers.filter((opt) => opt !== option)
                          );
                        }}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              )}

              {/* Dropdown */}
              {q.type === "dropdown" && q.options && Array.isArray(q.options) && (
                <select
                  value={answers[q.id] || ""}
                  onChange={(e) => handleChange(q.id, e.target.value)}
                >
                  <option value="">Select an option</option>
                  {q.options.map((option, idx) => (
                    <option key={idx} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}

              {/* File Upload */}
              {q.type === "file" && (
                <div>
                  <input
                    type="file"
                    onChange={(e) => handleChange(q.id, e.target.files[0])}
                  />
                  {uploadProgress[q.id] && (
                    <div className="progress-bar">
                      <div
                        className="progress"
                        style={{ width: `${uploadProgress[q.id]}%` }}
                      >
                        {uploadProgress[q.id]}%
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          <button type="submit">Submit</button>
        </form>
      </Card>
    </div>
  );
};

export default Answer;
