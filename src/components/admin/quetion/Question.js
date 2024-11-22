import { useState } from "react";
import { db } from "../../../firebase/config";
import { collection, addDoc } from "firebase/firestore";
import Card from "../../card/Card";
import "./question.scss";

const Question = () => {
  const [question, setQuestion] = useState("");
  const [type, setType] = useState("text");
  const [options, setOptions] = useState([]); // To store options for multiple-choice or dropdown
  const [currentOption, setCurrentOption] = useState(""); // Temp storage for adding a new option

  // Add an option to the options array
  const addOption = () => {
    if (currentOption.trim()) {
      setOptions((prev) => [...prev, currentOption]);
      setCurrentOption(""); // Clear the input field
    }
  };

  // Remove an option from the array
  const removeOption = (index) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  // Add the question to Firestore
  const handleAddQuestion = async () => {
    if (!question.trim()) {
      alert("Please enter a question.");
      return;
    }
    if ((type === "multiple-choice" || type === "dropdown") && options.length === 0) {
      alert("Please add at least one option.");
      return;
    }

    const questionData = { question, type };
    if (options.length > 0) {
      questionData.options = options; // Include options for multiple-choice or dropdown
    }

    try {
      await addDoc(collection(db, "questions"), questionData);
      alert("Question added!");
      setQuestion("");
      setType("text");
      setOptions([]);
    } catch (error) {
      console.error("Error adding question: ", error);
      alert("Failed to add question. Please try again.");
    }
  };

  return (
    <div className="admin-panel">
      <Card>
        <h2>Add Question</h2>
        <input
          type="text"
          placeholder="Enter question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="text">Text</option>
          <option value="multiple-choice">Multiple Choice</option>
          <option value="checkbox">Checkbox</option>
          <option value="dropdown">Dropdown</option>
          <option value="file">File Upload</option>
        </select>

        {/* Show options input only for multiple-choice or dropdown */}
        {(type === "multiple-choice" || type === "dropdown") && (
          <div className="options-section">
            <div className="add-option">
              <input
                type="text"
                placeholder="Enter an option"
                value={currentOption}
                onChange={(e) => setCurrentOption(e.target.value)}
              />
              <button type="button" onClick={addOption}>
                Add Option
              </button>
            </div>
            <ul className="options-list">
              {options.map((opt, index) => (
                <li key={index}>
                  {opt}{" "}
                  <button type="button" onClick={() => removeOption(index)}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button onClick={handleAddQuestion}>Add Question</button>
      </Card>
    </div>
  );
};

export default Question;
