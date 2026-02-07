import React from 'react';

const ErrorPage = () => {
  return (
    <div className="error-container">
      <div className="error-content">
        <h1 className="error-title">404</h1>
        <h2 className="error-message">Oops! Page Not Found</h2>
        <p className="error-description">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        <a href="/" className="home-link">Return to Home</a>
      </div>
      <style jsx>{`
        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #e9ecef, #f8f9fa);
          color: #343a40;
          font-family: 'Arial', sans-serif;
          text-align: center;
          padding: 20px;
        }

        .error-content {
          max-width: 600px;
        }

        .error-title {
          font-size: 6rem;
          font-weight: bold;
          margin: 0;
          color: #ff6b6b;
        }

        .error-message {
          font-size: 2rem;
          margin: 10px 0;
        }

        .error-description {
          font-size: 1rem;
          color: #6c757d;
          margin: 10px 0 20px;
        }

        .home-link {
          display: inline-block;
          padding: 10px 20px;
          background-color: #007bff;
          color: #fff;
          text-decoration: none;
          border-radius: 5px;
          font-size: 1rem;
          transition: background-color 0.3s ease;
        }

        .home-link:hover {
          background-color: #0056b3;
        }

        @media (max-width: 768px) {
          .error-title {
            font-size: 4rem;
          }

          .error-message {
            font-size: 1.5rem;
          }

          .error-description {
            font-size: 0.9rem;
          }

          .home-link {
            font-size: 0.9rem;
            padding: 8px 16px;
          }
        }

        @media (max-width: 480px) {
          .error-title {
            font-size: 3rem;
          }

          .error-message {
            font-size: 1.2rem;
          }

          .error-description {
            font-size: 0.8rem;
          }

          .home-link {
            font-size: 0.8rem;
            padding: 6px 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default ErrorPage;
