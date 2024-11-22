import React, { useEffect, useState } from "react";
import { db } from "../../../../firebase/config";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import Card from "../../../card/Card";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "./manageQuestions.scss";

const ManageQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editedQuestion, setEditedQuestion] = useState("");

  // Fetch questions from Firestore
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "questions"));
        const fetchedQuestions = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // Sort questions by order field
        fetchedQuestions.sort((a, b) => a.order - b.order);
        setQuestions(fetchedQuestions);
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    fetchQuestions();
  }, []);

  // Save rearranged questions to Firestore
  const updateOrderInFirestore = async (newQuestions) => {
    for (let i = 0; i < newQuestions.length; i++) {
      const question = newQuestions[i];
      await updateDoc(doc(db, "questions", question.id), { order: i });
    }
  };

  // Handle drag end
  const onDragEnd = (result) => {
    const { source, destination } = result;

    // If dropped outside of the list or no movement, do nothing
    if (!destination || source.index === destination.index) return;

    // Reorder questions
    const reorderedQuestions = [...questions];
    const [movedQuestion] = reorderedQuestions.splice(source.index, 1);
    reorderedQuestions.splice(destination.index, 0, movedQuestion);

    // Update order field in the local state
    const updatedQuestions = reorderedQuestions.map((q, index) => ({
      ...q,
      order: index,
    }));

    setQuestions(updatedQuestions);
    updateOrderInFirestore(updatedQuestions);
  };

  // Delete a question from Firestore
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "questions", id));
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      alert("Question deleted successfully.");
    } catch (error) {
      console.error("Error deleting question:", error);
      alert("Failed to delete the question. Please try again.");
    }
  };

  // Start editing a question
  const startEdit = (id, question) => {
    setEditing(id);
    setEditedQuestion(question);
  };

  // Save edited question
  const handleSave = async (id) => {
    try {
      await updateDoc(doc(db, "questions", id), { question: editedQuestion });
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, question: editedQuestion } : q))
      );
      setEditing(null);
      alert("Question updated successfully.");
    } catch (error) {
      console.error("Error updating question:", error);
      alert("Failed to update the question. Please try again.");
    }
  };

  return (
    <div className="manage-questions">
      <Card>
        <h2>Manage Questions</h2>
        {questions.length === 0 ? (
          <p>No questions found.</p>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="questions-list">
              {(provided) => (
                <ul
                  className="question-list"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {questions.map((q, index) => (
                    <Draggable key={q.id} draggableId={q.id} index={index}>
                      {(provided) => (
                        <li
                          className="question-item"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          {editing === q.id ? (
                            <div className="edit-mode">
                              <input
                                type="text"
                                value={editedQuestion}
                                onChange={(e) =>
                                  setEditedQuestion(e.target.value)
                                }
                              />
                              <button onClick={() => handleSave(q.id)}>
                                Save
                              </button>
                              <button onClick={() => setEditing(null)}>
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="view-mode">
                              <span>{q.question}</span>
                              <div className="actions">
                                <button
                                  onClick={() => startEdit(q.id, q.question)}
                                >
                                  Edit
                                </button>
                                <button onClick={() => handleDelete(q.id)}>
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </Card>
    </div>
  );
};

export default ManageQuestions;
