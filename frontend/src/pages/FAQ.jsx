// frontend/src/pages/FAQ.jsx

import React, { useState } from 'react';
import '../styles/FAQ.css';
import { FaSearch, FaPlus } from 'react-icons/fa';

const FAQ = () => {
  // Sample FAQ data
  const faqData = [
    {
      category: 'General',
      questions: [
        {
          question: 'What services does TravelPlanner offer?',
          answer:
            'TravelPlanner offers a wide range of services including booking flights, hotels, car rentals, and more to make your travel planning seamless and hassle-free.',
        },
        {
          question: 'How can I contact customer support?',
          answer:
            'You can contact our customer support via the Support page, live chat on our website, or by emailing support@travelplanner.com.',
        },
      ],
    },
    {
      category: 'Booking',
      questions: [
        {
          question: 'Can I modify my booking after confirmation?',
          answer:
            'Yes, you can modify your booking by logging into your account and navigating to the “My Bookings” section. Please note that modification policies may vary depending on the service provider.',
        },
        {
          question: 'What is the cancellation policy?',
          answer:
            'Cancellation policies vary based on the type of service and provider. Please refer to the specific cancellation terms during the booking process.',
        },
      ],
    },
    {
      category: 'Payments',
      questions: [
        {
          question: 'What payment methods are accepted?',
          answer:
            'We accept various payment methods including credit/debit cards, PayPal, and bank transfers to provide flexibility for our users.',
        },
        {
          question: 'Is my payment information secure?',
          answer:
            'Absolutely. We use industry-standard encryption and security protocols to ensure that your payment information is protected at all times.',
        },
      ],
    },
  ];

  const [searchTerm, setSearchTerm] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [showSuggestionForm, setShowSuggestionForm] = useState(false);
  const [suggestionStatus, setSuggestionStatus] = useState('');

  // Filter FAQs based on search term
  const filteredFaq = faqData
    .map((category) => ({
      ...category,
      questions: category.questions.filter((q) =>
        q.question.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((category) => category.questions.length > 0);

  // Handle Suggestion Submission
  const handleSuggestionSubmit = (e) => {
    e.preventDefault();
    if (suggestion.trim() === '') {
      setSuggestionStatus('Please enter a valid question.');
      return;
    }
    // Here you would typically send the suggestion to your backend
    console.log('User suggestion:', suggestion);
    setSuggestionStatus('Thank you for your suggestion!');
    setSuggestion('');
    setShowSuggestionForm(false);
  };

  return (
    <div className="faq-container">
      <h1>Frequently Asked Questions</h1>

      {/* Search Bar */}
      <div className="faq-search">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search for questions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search FAQs"
        />
      </div>

      {/* FAQ Categories and Questions */}
      <div className="faq-accordion">
        {filteredFaq.length > 0 ? (
          filteredFaq.map((category, idx) => (
            <div className="faq-category" key={idx}>
              <h2>{category.category}</h2>
              {category.questions.map((q, index) => (
                <AccordionItem key={index} question={q.question} answer={q.answer} />
              ))}
            </div>
          ))
        ) : (
          <p>No FAQs match your search.</p>
        )}
      </div>

      {/* Suggest a Question */}
      <div className="faq-suggest">
        <button onClick={() => setShowSuggestionForm(!showSuggestionForm)}>
          <FaPlus /> Suggest a Question
        </button>
        {showSuggestionForm && (
          <form className="suggestion-form" onSubmit={handleSuggestionSubmit}>
            <textarea
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              placeholder="Enter your question here..."
              required
              aria-label="Suggest a Question"
            ></textarea>
            <button type="submit">Submit</button>
            {suggestionStatus && <p className="suggestion-status">{suggestionStatus}</p>}
          </form>
        )}
      </div>
    </div>
  );
};

// Accordion Item Component
const AccordionItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="accordion-item">
      <button
        className={`accordion-question ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        {question}
        <span className="accordion-icon">{isOpen ? '-' : '+'}</span>
      </button>
      {isOpen && <div className="accordion-answer">{answer}</div>}
    </div>
  );
};

export default FAQ;
