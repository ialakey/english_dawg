// pages/test-english.js
"use client";

import React, { useState } from "react";
import Modal from "react-modal";

const LanguageTestPage = () => {
  const [answers, setAnswers] = useState(["", "", "", ""]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [result, setResult] = useState("");

  const handleInputChange = (index, value) => {
    const updatedAnswers = [...answers];
    updatedAnswers[index] = value;
    setAnswers(updatedAnswers);
  };

  const handleSubmit = async () => {
    const questions = [
      "That's your name and tell us about yourself: e.g. your hobby, profession",
      "Where do you plan to travel in the future?",
      "What were your proudest achievements or goals you set for your career?",
      "How do you interpret this quote, and what practical steps can one take to live by it?",
    ];
  
    const userOutput = answers
      .map(
        (answer, index) =>
          `Quesion:\n${questions[index]}\n\nUser output:\n${answer}`
      )
      .join("\n\n");
  
    const prompt = `Evaluate the user's English in the following categories: Personal, Work, and Travel. Assess the responses based on grammar accuracy, vocabulary richness, relevance to the question, and overall quality. Additionally, provide an overall score (1-10) and general advice for improvement. Structure the output in the following valid JSON format:

{
  "evaluation": {
    "categories": {
      "personal": {
        "score": [integer, 1-10],
        "comments": "[string describing the feedback on this category in English]"
      },
      "work": {
        "score": [integer, 1-10],
        "comments": "[string describing the feedback on this category in English]"
      },
      "travel": {
        "score": [integer, 1-10],
        "comments": "[string describing the feedback on this category in English]"
      }
    },
    "overallScore": [integer, 1-10],
    "advice": "[string providing general advice for improving the user's English proficiency]"
  }
}

Provide a clear, valid JSON response without any additional symbols, text, or formatting. Ensure the JSON is properly structured with no missing or extra characters.
\n\n${userOutput}`;
  
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer "YOUR_CODE"`,
        },
        body: JSON.stringify({
          model: "gpt-4-turbo-2024-04-09",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 300,
          temperature: 0.7,
        }),
      });
  
      const data = await response.json();
      const rawContent = data.choices[0].message.content;
  
      // Логируем для отладки
      console.log("Raw Content from API:", rawContent);
  
      // Удаляем лишние символы (например, "```json" и "```")
      const cleanedContent = rawContent
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
  
      // Проверяем валидность JSON перед парсингом
      try {
        const content = JSON.parse(cleanedContent);
        setResult(content.evaluation);
      } catch (parseError) {
        console.error("JSON Parsing Error:", parseError);
        console.error("Cleaned Content:", cleanedContent);
        setResult("An error occurred while parsing the API response.");
      }
  
      setModalIsOpen(true);
    } catch (error) {
      console.error("Error fetching GPT response:", error);
      setResult("An error occurred while processing your request.");
      setModalIsOpen(true);
    }
  };  

  const renderResult = () => {
    if (typeof result === "string") {
      return <p>{result}</p>;
    }

    return (
      <div>
        <ul>
          {Object.entries(result.categories).map(([category, details]) => (
            <li key={category}>
              <strong>{category.charAt(0).toUpperCase() + category.slice(1)}:</strong>
              <p>Score: {details.score}</p>
              <p>Comment: {details.comments}</p>
            </li>
          ))}
        </ul>
        <h4>Overall Score:</h4>
        <p>{result.overallScore}</p>
        <h4>Advice:</h4>
        <p>{result.advice}</p>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h1 style={{ textAlign: "center", fontWeight: "bold", fontSize: "2rem" }}>
        TEST LEVEL LANGUAGE
      </h1>
      {[
        "That's your name and tell us about yourself: e.g. your hobby, profession",
        "Where do you plan to travel in the future?",
        "What were your proudest achievements or goals you set for your career?",
        "How do you interpret this quote, and what practical steps can one take to live by it?",
      ].map((question, index) => (
        <div key={index} style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "10px" }}>{question}</label>
          <textarea
            value={answers[index]}
            onChange={(e) => handleInputChange(index, e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              resize: "vertical",
              minHeight: "50px",
            }}
          />
        </div>
      ))}
      <button
        onClick={handleSubmit}
        style={{
          display: "block",
          margin: "20px auto",
          padding: "10px 20px",
          backgroundColor: "#0070f3",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Submit
      </button>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        style={{
          content: {
            maxWidth: "500px",
            margin: "auto",
            padding: "20px",
            borderRadius: "10px",
            border: "1px solid #ccc",
          },
        }}
      >
        <h2 style={{ textAlign: "center" }}>Result</h2>
        {renderResult()}
        <button
          onClick={() => setModalIsOpen(false)}
          style={{
            display: "block",
            margin: "20px auto",
            padding: "10px 20px",
            backgroundColor: "#0070f3",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Close
        </button>
      </Modal>
    </div>
  );
};

export default LanguageTestPage;
