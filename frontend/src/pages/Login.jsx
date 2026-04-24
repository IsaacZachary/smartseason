import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Sprout, LogIn, AlertCircle, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import heroImage from '../assets/hero.png';

import logo from '../assets/logo.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('The credentials provided do not match our records.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      await login('admin@smartseason.com', 'Admin@123');
      navigate('/');
    } catch (err) {
      setError('Demo environment is currently unavailable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={{
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      padding: '24px',
      background: `linear-gradient(rgba(5, 11, 21, 0.8), rgba(5, 11, 21, 0.9)), url(${heroImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel" 
        style={{ width: '100%', maxWidth: '440px', padding: '48px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ 
            display: 'inline-flex', 
            padding: '4px', 
            borderRadius: '16px', 
            background: 'var(--primary-glow)',
            marginBottom: '20px'
          }}>
            <img src={logo} alt="SmartSeason Logo" style={{ width: '64px', height: '64px', borderRadius: '12px' }} />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '8px' }}>SmartSeason</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Enterprise Shamba Management</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              padding: '14px', 
              background: 'rgba(239, 68, 68, 0.08)', 
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '12px',
              color: '#F87171',
              marginBottom: '28px',
              fontSize: '0.85rem'
            }}
          >
            <AlertCircle size={18} />
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Email Address</label>
            <input 
              type="email" 
              className="glass-input" 
              placeholder="e.g. admin@smartseason.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Password</label>
            <input 
              type="password" 
              className="glass-input" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="btn-primary" 
            style={{ justifyContent: 'center', height: '52px', fontSize: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Processing...' : (
              <>
                <LogIn size={20} />
                Access Dashboard
              </>
            )}
          </button>
        </form>

        <div style={{ position: 'relative', margin: '40px 0 24px', textAlign: 'center' }}>
          <hr style={{ border: 'none', borderTop: '1px solid var(--border-glass)' }} />
          <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'var(--bg-card)', padding: '0 16px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '600' }}>OR CONTINUE WITH</span>
        </div>

        <button 
          onClick={handleDemoLogin}
          style={{ 
            width: '100%', 
            padding: '14px', 
            borderRadius: '12px', 
            background: 'rgba(255,255,255,0.05)', 
            border: '1px solid var(--border-glass)',
            color: 'var(--text-main)',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            transition: 'var(--transition)'
          }}
          className="hover-white"
        >
          <ShieldCheck size={18} />
          Explore as Demo User
        </button>
        
        <p style={{ marginTop: '32px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          By logging in, you agree to our Terms of Service.
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
