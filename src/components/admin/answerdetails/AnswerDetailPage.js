import React, { useEffect, useState } from "react";
import { db } from "../../../firebase/config";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { Link, useParams } from "react-router-dom"; // To get the submission ID from the URL
import "./AnswerDetailPage.scss";
import spinnerImg from "../../../assets/spinner.jpg";

const AnswerDetailPage = () => {
  const [answer, setAnswer] = useState(null);
  const [questions, setQuestions] = useState([]); // Store all questions
  const [loading, setLoading] = useState(true);
  const { submissionId } = useParams(); // Get the submissionId from the URL

  // Fetch the questions from Firestore
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "questions"));
        const fetchedQuestions = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // Sort the questions by their order field
        fetchedQuestions.sort((a, b) => a.order - b.order);
        setQuestions(fetchedQuestions);
      } catch (error) {
        console.error("Error fetching questions: ", error);
      }
    };

    fetchQuestions();
  }, []);

  // Fetch the details of a specific submission
  useEffect(() => {
    const fetchAnswerDetails = async () => {
      try {
        const docRef = doc(db, "answers", submissionId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setAnswer(docSnap.data());
        } else {
          console.log("No such document!");
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching answer details: ", error);
      }
    };

    fetchAnswerDetails();
  }, [submissionId]);

  if (loading) {
    return (
      <div>
        <img src={spinnerImg} alt="Loading..." style={{ width: "50px" }} />
      </div>
    );
  }

  if (!answer) {
    return <div>Answer not found.</div>;
  }

  return (
    <div className="answer-detail-page">
      <h2>Submission Details</h2>

      <p>
        <strong>Name:</strong> {answer.username || "Unknown"}
      </p>
      <p>
        <strong>Submitted At:</strong>{" "}
        {new Date(answer.submittedAt.seconds * 1000).toLocaleString()}
      </p>
      <div>
        <Link to="/admin/form">&larr; Back To Orders</Link>
      </div>
      <h3>Answers</h3>
      <ul>
        {questions.map((q) => (
          <li key={q.id} className="answer-item">
            <strong>{q.question}:</strong>
            <span>
              {Array.isArray(answer.answers[q.id]) ? (
                answer.answers[q.id].join(", ")
              ) : answer.answers[q.id] &&
                answer.answers[q.id].toString().startsWith("http") ? (
                // Check if the answer contains a file URL and determine whether it's an image or a file
                answer.answers[q.id].toString().includes('answers') ? (
                  // It's a file URL
                  <a
                    href={answer.answers[q.id]}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View file
                  </a>
                ) : (
                  // It's an image URL (fileUrl)
                  <img
                    src={answer.answers[q.id]}
                    alt="Uploaded content"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "400px",
                      borderRadius: "8px",
                    }}
                  />
                )
              ) : (
                answer.answers[q.id] || "No response"
              )}
            </span>

            {/* If the question has a fileUrl answer, display the image */}
            {q.fileUrl && (
              <div className="image-preview">
                <h4>Image:</h4>
                <img
                  src={q.fileUrl}
                  alt="Submitted file"
                  style={{ maxWidth: "100%", maxHeight: "400px", borderRadius: "8px" }}
                />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AnswerDetailPage;
