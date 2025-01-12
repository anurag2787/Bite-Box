import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import axios from 'axios';
import { useDarkMode } from '../app/DarkModeContext';

const CustomerReviewCarousel = () => {
  const [reviews, setReviews] = useState([]);
  const { darkMode } = useDarkMode();

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
  };

  // Fetch reviews from the backend
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/reviews'); // Replace with your actual backend API URL
        setReviews(response.data.data); // Assuming the reviews are in `data.data`
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    fetchReviews();
  }, []);

  return (
    <div
      className={`p-6 rounded-lg shadow-lg max-w-4xl mx-auto ${
        darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'
      }`}
    >
      <h1
        className={`text-center font-extrabold text-3xl mb-6 ${
          darkMode ? 'text-gray-200' : 'text-blue-600'
        }`}
      >
        Our Customer Reviews
      </h1>
      <Slider {...settings}>
        {reviews.length > 0 ? (
          reviews.map((review, index) => (
            <div
              key={index}
              className={`flex flex-col items-center justify-center text-center p-6 rounded-lg shadow-md ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              {/* Rating Stars */}
              <div className="flex items-center mb-4">
                {[...Array(review.rating)].map((_, idx) => (
                  <svg
                    key={idx}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="gold"
                    viewBox="0 0 24 24"
                    strokeWidth={1}
                    stroke={darkMode ? 'white' : 'black'}
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 00.95.69h4.908c.969 0 1.371 1.24.588 1.81l-3.973 2.884a1 1 0 00-.364 1.118l1.518 4.674c.3.921-.755 1.688-1.538 1.118l-3.973-2.884a1 1 0 00-1.176 0l-3.973 2.884c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.986 9.1c-.783-.57-.38-1.81.588-1.81h4.908a1 1 0 00.95-.69l1.518-4.674z"
                    />
                  </svg>
                ))}
              </div>
              {/* Review Text */}
              <p
                className={`text-lg italic mb-4 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                &quot;{review.review}&quot;
              </p>
              {/* Customer Email */}
              <h3
                className={`font-semibold text-xl ${
                  darkMode ? 'text-yellow-300' : 'text-blue-600'
                }`}
              >
                - {review.email}
              </h3>
              {/* Created At */}
              <p className="mt-2 text-sm text-gray-500">
                {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))
        ) : (
          <div className="review-slide text-center">
            <p>No reviews available.</p>
          </div>
        )}
      </Slider>
    </div>
  );
};

export default CustomerReviewCarousel;
