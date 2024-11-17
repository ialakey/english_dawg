'use client';

import React, { useState } from 'react';
import loadergif from '@/../public/loadergif.gif';
import Modal from 'react-modal';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const LanguageTestPage = () => {
  const [answers, setAnswers] = useState(['', '', '', '']);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const questions = [
    "That's your name and tell us about yourself: e.g. your hobby, profession",
    'Where do you plan to travel in the future?',
    'What were your proudest achievements or goals you set for your career?',
    'How do you interpret this quote, and what practical steps can one take to live by it?',
  ];

  const handleInputChange = (index, value) => {
    const updatedAnswers = [...answers];
    updatedAnswers[index] = value;
    setAnswers(updatedAnswers);
  };

  const handleSubmit = async () => {
    setModalIsOpen(true);
    setLoading(true);

    const userOutput = answers
      .map((answer, index) => `Quesion:\n${questions[index]}\n\nUser output:\n${answer}`)
      .join('\n\n');

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
    "advice": "[string providing actionable tips and strategies to enhance English proficiency and perform well in the IELTS exam, including practical exercises and techniques for writing module]"
  }
}

Provide a clear, valid JSON response without any additional symbols, text, or formatting. Ensure the JSON is properly structured with no missing or extra characters.
\n\n${userOutput}`;

    setLoading(true);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer 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`,
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 400,
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      const rawContent = data.choices[0].message.content;

      console.log('Raw Content from API:', rawContent);

      const cleanedContent = rawContent
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      try {
        const content = JSON.parse(cleanedContent);
        setResult(content.evaluation);
      } catch (parseError) {
        console.error('JSON Parsing Error:', parseError);
        console.error('Cleaned Content:', cleanedContent);
        setResult('An error occurred while parsing the API response.');
      }

      setModalIsOpen(true);
    } catch (error) {
      console.error('Error fetching GPT response:', error);
      setResult('An error occurred while processing your request.');
      setModalIsOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const renderResult = () => {
    if (loading) {
      return <img src={loadergif}></img>;
    }

    if (typeof result === 'string') {
      return <p>{result}</p>;
    }

    const chartData = {
      labels: ['Personal', 'Work', 'Travel'],
      datasets: [
        {
          label: 'Scores',
          data: [result.categories.personal.score, result.categories.work.score, result.categories.travel.score],
          backgroundColor: ['#4caf50', '#ff9800', '#2196f3'],
        },
      ],
    };

    const chartOptions = {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 10,
        },
      },
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Scores by Category',
        },
      },
    };

    return (
      <div style={styles.resultContainer}>
        <div style={{ marginTop: '20px' }}>
          <Bar
            data={chartData}
            options={chartOptions}
          />
        </div>
        <h4 style={styles.resultHeading}>Advice:</h4>
        <p style={styles.resultText}>{result.advice}</p>
        <button
          style={styles.toggleButton}
          onClick={() => setShowDetails(!showDetails)}>
          {showDetails ? 'Hide Details' : 'Show More'}
        </button>
        {showDetails && (
          <>
            <ul style={styles.resultList}>
              {Object.entries(result.categories).map(([category, details]) => (
                <li
                  key={category}
                  style={styles.resultItem}>
                  <strong style={styles.resultTitle}>{category.charAt(0).toUpperCase() + category.slice(1)}:</strong>
                  <p style={styles.resultText}>Score: {details.score}</p>
                  <p style={styles.resultText}>Comment: {details.comments}</p>
                </li>
              ))}
            </ul>
            <h4 style={styles.resultHeading}>Overall Score:</h4>
            <p style={styles.resultText}>{result.overallScore}</p>
          </>
        )}
      </div>
    );
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Language Test</h1>
      {questions.map((question, index) => (
        <div
          key={index}
          style={styles.questionContainer}>
          <label style={styles.label}>{question}</label>
          <textarea
            value={answers[index]}
            onChange={(e) => handleInputChange(index, e.target.value)}
            style={styles.textarea}
          />
        </div>
      ))}
      <button
        onClick={handleSubmit}
        style={styles.submitButton}>
        Submit
      </button>
      {loading && (
        <img
          src={loadergif}
          alt="Loading..."
        />
      )}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        style={styles.modalStyles}>
        <h2 style={styles.modalTitle}>Result</h2>
        {renderResult()}
        <button
          onClick={() => setModalIsOpen(false)}
          style={styles.closeButton}>
          Close
        </button>
      </Modal>
    </div>
  );
};

const styles = {
  page: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    color: '#333',
    position: 'relative',
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '2rem',
    color: '#0070f3',
  },
  questionContainer: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '10px',
    fontWeight: 'bold',
  },
  textarea: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    minHeight: '50px',
    resize: 'vertical',
  },
  submitButton: {
    display: 'block',
    margin: '20px auto',
    padding: '10px 20px',
    backgroundColor: '#0070f3',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  modalStyles: {
    content: {
      maxWidth: '500px',
      margin: 'auto',
      padding: '20px',
      borderRadius: '10px',
      border: '1px solid #ccc',
    },
  },
  modalTitle: {
    textAlign: 'center',
    color: '#0070f3',
    fontSize: '1.5rem',
  },
  closeButton: {
    display: 'block',
    margin: '20px auto',
    padding: '10px 20px',
    backgroundColor: '#0070f3',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  resultContainer: {
    margin: '20px 0',
  },
  resultList: {
    listStyle: 'none',
    padding: 0,
  },
  resultItem: {
    marginBottom: '15px',
  },
  resultTitle: {
    fontWeight: 'bold',
    fontSize: '1.1rem',
  },
  resultText: {
    margin: '5px 0',
  },
  resultHeading: {
    fontWeight: 'bold',
    marginTop: '10px',
  },
  // loadingSpinner: {
  //   position: 'absolute',
  //   top: '50%',
  //   left: '50%',
  //   transform: 'translate(-50%, -50%)',
  //   border: '8px solid #f3f3f3',
  //   borderTop: '8px solid #0070f3',
  //   borderRadius: '50%',
  //   width: '50px',
  //   height: '50px',
  //   animation: 'spin 2s linear infinite',

  toggleButton: {
    marginTop: '10px',
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default LanguageTestPage;
