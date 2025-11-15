import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, TrendingUp, Trophy, Lock } from 'lucide-react';

/**
 * Modal that appears after game completion for anonymous users,
 * encouraging them to sign up to unlock features like score tracking.
 */
const SignUpPromptModal = ({ isOpen, onClose, gameScore, gameTitle }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSignUp = () => {
    navigate('/signup');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(4, 37, 57, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: 20,
          maxWidth: 500,
          width: '100%',
          padding: 32,
          boxShadow: '0 20px 60px rgba(4, 37, 57, 0.3)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'transparent',
            border: 'none',
            fontSize: 24,
            color: '#888',
            cursor: 'pointer',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ×
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f97544 0%, #ff9068 100%)',
              marginBottom: 16,
            }}
          >
            <Trophy size={32} color="#fff" />
          </div>
          <h2
            style={{
              margin: '0 0 8px',
              fontSize: 28,
              fontWeight: 900,
              color: '#265c7e',
              letterSpacing: '-0.5px',
            }}
          >
            Great job!
          </h2>
          {gameScore !== undefined && (
            <p style={{ margin: 0, fontSize: 18, color: '#57c785', fontWeight: 700 }}>
              You scored {gameScore}
              {gameTitle && ` on ${gameTitle}`}
            </p>
          )}
        </div>

        {/* Benefits list */}
        <div
          style={{
            background: '#f8fafb',
            borderRadius: 12,
            padding: 20,
            marginBottom: 24,
          }}
        >
          <h3
            style={{
              margin: '0 0 16px',
              fontSize: 16,
              fontWeight: 800,
              color: '#265c7e',
            }}
          >
            Sign up to unlock:
          </h3>
          <div style={{ display: 'grid', gap: 12 }}>
            {[
              {
                icon: <TrendingUp size={20} color="#f97544" />,
                text: 'Save and track your scores',
              },
              {
                icon: <CheckCircle size={20} color="#57c785" />,
                text: 'Access history from any device',
              },
              {
                icon: <Trophy size={20} color="#FFB300" />,
                text: 'Compete with your best scores',
              },
              {
                icon: <Lock size={20} color="#3F8EFC" />,
                text: 'Unlock premium games and levels',
              },
            ].map((benefit, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div style={{ flexShrink: 0 }}>{benefit.icon}</div>
                <div
                  style={{
                    fontSize: 14,
                    color: '#265c7e',
                    fontWeight: 600,
                    lineHeight: 1.4,
                  }}
                >
                  {benefit.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'grid', gap: 12 }}>
          <button
            onClick={handleSignUp}
            style={{
              width: '100%',
              padding: '14px 24px',
              borderRadius: 12,
              border: 'none',
              background: 'linear-gradient(135deg, #f97544 0%, #ff8a5c 100%)',
              color: '#fff',
              fontSize: 18,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(249, 117, 68, 0.3)',
              transition: 'all 150ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(249, 117, 68, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(249, 117, 68, 0.3)';
            }}
          >
            Create Free Account
          </button>
          <button
            onClick={handleLogin}
            style={{
              width: '100%',
              padding: '14px 24px',
              borderRadius: 12,
              border: '2px solid #f97544',
              background: '#fff',
              color: '#f97544',
              fontSize: 16,
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#fff6f2';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#fff';
            }}
          >
            Already have an account? Sign In
          </button>
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '10px',
              background: 'transparent',
              border: 'none',
              color: '#888',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'color 150ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#265c7e';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#888';
            }}
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignUpPromptModal;
