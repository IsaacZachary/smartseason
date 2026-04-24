import React, { useState, useEffect } from 'react';
import { X, Save, User as UserIcon, Sprout, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fieldAPI, userAPI } from '../api';

const CreateFieldModal = ({ isOpen, onClose, onCreated }) => {
  const [agents, setAgents] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    crop_type: '',
    planting_date: new Date().toISOString().split('T')[0],
    current_stage: 'planted',
    assigned_agent: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchAgents = async () => {
        try {
          const res = await userAPI.list();
          setAgents(res.data);
        } catch (err) {
          console.error('Error fetching agents:', err);
        }
      };
      fetchAgents();
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fieldAPI.create(formData);
      onCreated();
      onClose();
      setFormData({
        name: '',
        crop_type: '',
        planting_date: new Date().toISOString().split('T')[0],
        current_stage: 'planted',
        assigned_agent: ''
      });
    } catch (err) {
      console.error('Error creating field:', err);
      alert('Failed to create field.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="glass-panel"
          style={{ width: '100%', maxWidth: '540px', position: 'relative', padding: '40px' }}
        >
          <button 
            onClick={onClose}
            style={{ position: 'absolute', top: '24px', right: '24px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <X size={24} />
          </button>

          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'var(--primary-glow)', color: 'var(--primary)' }}>
              <Sprout size={22} />
            </div>
            Register Shamba
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Shamba Name</label>
              <input 
                className="glass-input" 
                placeholder="e.g. Molo Highland Trial"
                style={{ width: '100%', height: '48px' }}
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Crop Type</label>
                <input 
                  className="glass-input" 
                  placeholder="e.g. Maize"
                  style={{ width: '100%', height: '48px' }}
                  value={formData.crop_type}
                  onChange={e => setFormData({...formData, crop_type: e.target.value})}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Planting Date</label>
                <input 
                  type="date"
                  className="glass-input" 
                  style={{ width: '100%', height: '48px' }}
                  value={formData.planting_date}
                  onChange={e => setFormData({...formData, planting_date: e.target.value})}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Field Agent</label>
              <select 
                className="glass-input"
                style={{ width: '100%', height: '48px' }}
                value={formData.assigned_agent}
                onChange={e => setFormData({...formData, assigned_agent: e.target.value})}
                required
              >
                <option value="">Select an agent...</option>
                {agents.map(agent => (
                  <option key={agent.id} value={agent.id}>{agent.first_name} {agent.last_name}</option>
                ))}
              </select>
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              style={{ width: '100%', justifyContent: 'center', height: '52px', marginTop: '8px', fontSize: '1rem' }}
              disabled={loading}
            >
              {loading ? 'Saving...' : (
                <>
                  <Save size={20} />
                  Save Shamba
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreateFieldModal;
