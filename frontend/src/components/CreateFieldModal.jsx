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
          className="glass-panel glass-card"
          style={{ width: '100%', maxWidth: '500px', position: 'relative' }}
        >
          <button 
            onClick={onClose}
            style={{ position: 'absolute', top: '20px', right: '20px', color: 'var(--text-muted)' }}
          >
            <X size={24} />
          </button>

          <h2 style={{ fontSize: '1.5rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'var(--primary-glow)', color: 'var(--primary)' }}>
              <Sprout size={20} />
            </div>
            Sajili Shamba Jipya
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Shamba Name / Location</label>
              <input 
                className="glass-input" 
                placeholder="e.g. Nakuru Section A"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Crop (Mimea)</label>
                <input 
                  className="glass-input" 
                  placeholder="e.g. Maize / Coffee"
                  value={formData.crop_type}
                  onChange={e => setFormData({...formData, crop_type: e.target.value})}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Planting Date</label>
                <input 
                  type="date"
                  className="glass-input" 
                  value={formData.planting_date}
                  onChange={e => setFormData({...formData, planting_date: e.target.value})}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Assign Msimamizi (Agent)</label>
              <select 
                className="glass-input"
                value={formData.assigned_agent}
                onChange={e => setFormData({...formData, assigned_agent: e.target.value})}
                required
              >
                <option value="">Select msimamizi...</option>
                {agents.map(agent => (
                  <option key={agent.id} value={agent.id}>{agent.first_name} {agent.last_name}</option>
                ))}
              </select>
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}
              disabled={loading}
            >
              {loading ? 'Sajili...' : (
                <>
                  <Save size={18} />
                  Hifadhi Shamba
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
