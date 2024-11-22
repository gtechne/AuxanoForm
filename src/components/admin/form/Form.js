import React, { useEffect, useState } from "react";
import { db } from "../../../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom"; // Import Link for navigation
import "./form.scss";
import spinnerImg from "../../../assets/spinner.jpg";

const AnswerPage = () => {
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch answers from Firestore
  useEffect(() => {
    const fetchAnswers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "answers"));
        const fetchedAnswers = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAnswers(fetchedAnswers);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching answers: ", error);
      }
    };

    fetchAnswers();
  }, []);

  if (loading) {
    return <div><img src={spinnerImg} alt="Loading..." style={{ width: "50px" }} /></div>;
  }

  return (
    <div className="answer-page">
      <h2>Submitted Answers</h2>
      {answers.length === 0 ? (
        <p>No answers submitted yet.</p>
      ) : (
        <table className="answers-table">
          <thead>
            <tr>
              <th>s/n</th>
              <th>Submitted At</th>
              <th>Submission ID</th>
              <th>Name</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {answers.map((answer, index) => (
              <tr key={answer.id}>
                <td>{index + 1}</td> {/* Display s/n */}
                <td>{new Date(answer.submittedAt.seconds * 1000).toLocaleString()}</td> {/* Display formatted date */}
                <td>{answer.id}</td> {/* Display Submission ID */}
                <td>{answer.username || "Unknown"}</td> {/* Display Name, default to "Unknown" if not available */}
                <td>
                  {/* Link to the details page */}
                  <Link to={`/admin/answer-detail/${answer.id}`}>View Details</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AnswerPage;
