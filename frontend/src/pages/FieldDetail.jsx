import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api, { fieldAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, 
  History, 
  Plus, 
  MessageSquare, 
  Calendar, 
  Sprout, 
  Activity, 
  User as UserIcon,
  CheckCircle2,
  Save,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

const FieldDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [field, setField] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Update form state
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [newStage, setNewStage] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [fieldRes, updatesRes] = await Promise.all([
        fieldAPI.retrieve(id),
        fieldAPI.list('updates', { params: { field_id: id } })
      ]);
      setField(fieldRes.data);
      setNewStage(fieldRes.data.current_stage);
      
      // Filter updates for this field and sort by newest first
      const fieldUpdates = updatesRes.data
        .filter(u => String(u.field) === String(id))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      setUpdates(fieldUpdates);
    } catch (err) {
      console.error('Error fetching field details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAddUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fieldAPI.addUpdate(id, { stage: newStage, notes });
      alert('Observation successfully logged and telemetry synchronized.');
      setShowUpdateForm(false);
      setNotes('');
      await fetchData(); // Refresh data
    } catch (err) {
      console.error('Error adding update:', err);
      alert('Failed to add update.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to decommission this field? All telemetry data will be lost.')) {
      try {
        await fieldAPI.update(id, { active: false }); // Soft delete or actual delete
        // For this demo, let's just use the delete endpoint
        await api.delete(`fields/${id}/`);
        navigate('/');
      } catch (err) {
        console.error('Error deleting field:', err);
        alert('Failed to delete field.');
      }
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '20px' }}>
      <Activity className="animate-spin" size={40} color="var(--primary)" />
      <p style={{ color: 'var(--text-muted)', letterSpacing: '0.1em' }}>RETRIEVING TELEMETRY...</p>
    </div>
  );
  if (!field) return <div style={{ padding: '40px', textAlign: 'center' }}>Field not found.</div>;

  const statusClass = `badge-${field.status.toLowerCase().replace(' ', '-')}`;

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem', transition: 'var(--transition)' }} className="hover-white">
          <ArrowLeft size={16} />
          Back to Home
        </Link>
        {user.role === 'admin' && (
          <button 
            onClick={handleDelete}
            style={{ color: '#F87171', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', background: 'rgba(248, 113, 113, 0.05)', border: '1px solid rgba(248, 113, 113, 0.1)' }}
          >
            Delete Shamba Plot
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' }}>
        {/* Left Column: Details & Updates */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <section className="glass-panel glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h1 style={{ fontSize: '2rem', marginBottom: '4px' }}>{field.name}</h1>
                <p style={{ color: 'var(--text-muted)' }}>{field.crop_type} Monitoring</p>
              </div>
              <span className={`badge ${statusClass}`} style={{ fontSize: '0.9rem', padding: '6px 16px' }}>{field.status}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <InfoItem icon={<Calendar size={18} />} label="Planting Date" value={new Date(field.planting_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} />
              <InfoItem icon={<Activity size={18} />} label="Current Stage" value={field.current_stage} highlight />
              <InfoItem icon={<UserIcon size={18} />} label="Field Agent" value={field.assigned_agent_details?.first_name ? `${field.assigned_agent_details.first_name} ${field.assigned_agent_details.last_name}` : 'Unassigned'} />
              <InfoItem icon={<Clock size={18} />} label="Last Field Report" value={new Date(field.updated_at).toLocaleDateString()} />
            </div>
          </section>

          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <History size={22} color="var(--primary)" />
                Shamba History
              </h2>
              <button 
                onClick={() => setShowUpdateForm(!showUpdateForm)}
                className="btn-primary" 
                style={{ padding: '8px 16px', fontSize: '0.9rem' }}
              >
                {showUpdateForm ? 'Cancel' : (
                  <>
                    <Plus size={16} />
                    New Record
                  </>
                )}
              </button>
            </div>

            {showUpdateForm && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="glass-panel glass-card" 
                style={{ marginBottom: '24px', border: '1px solid var(--primary-glow)' }}
              >
                <form onSubmit={handleAddUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Field Stage</label>
                      <select 
                        className="glass-input" 
                        value={newStage}
                        onChange={(e) => setNewStage(e.target.value)}
                        style={{ background: 'rgba(255,255,255,0.05)' }}
                      >
                        <option value="planted">Planted</option>
                        <option value="growing">Growing</option>
                        <option value="ready">Ready</option>
                        <option value="harvested">Harvested</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Notes & Observations</label>
                      <textarea 
                        className="glass-input" 
                        rows="4" 
                        placeholder="Describe current observations (e.g., rainfall, pest activity, growth milestones, or soil moisture levels)..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        required
                      ></textarea>
                    </div>
                  </div>
                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? 'Saving...' : (
                      <>
                        <Save size={18} />
                        Submit Update
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {updates.length > 0 ? (
                updates.map((update, index) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    key={update.id}
                  >
                    <UpdateItem update={update} />
                  </motion.div>
                ))
              ) : (
                <div style={{ padding: '48px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '24px', border: '1px dashed var(--border-glass)', color: 'var(--text-muted)' }}>
                  <History size={32} style={{ opacity: 0.3, marginBottom: '16px' }} />
                  <p>No historical telemetry recorded for this plot.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Insights & Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <section className="glass-panel glass-card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={20} color="var(--primary)" />
              Quick Insights
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Growth Phase</p>
                <p style={{ fontWeight: '600' }}>
                  {field.current_stage === 'harvested' ? 'Market Ready (Tayari)' : 'Active Monitoring Required'}
                </p>
              </div>

              <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Health Assessment</p>
                <p style={{ fontWeight: '600', color: statusClass.includes('active') ? 'var(--status-active)' : 'var(--status-risk)' }}>
                  {field.status === 'At Risk' ? '⚠️ Attention Required' : '✅ Healthy Shamba'}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ icon, label, value, highlight }) => (
  <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', display: 'flex', gap: '16px', alignItems: 'center' }}>
    <div style={{ color: highlight ? 'var(--primary)' : 'var(--text-muted)', background: highlight ? 'var(--primary-glow)' : 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '10px' }}>{icon}</div>
    <div>
      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>{label}</p>
      <p style={{ fontSize: '1rem', fontWeight: highlight ? '700' : '500', color: highlight ? 'var(--primary)' : 'inherit', textTransform: highlight ? 'capitalize' : 'none' }}>{value}</p>
    </div>
  </div>
);

const UpdateItem = ({ update }) => (
  <div className="glass-panel" style={{ padding: '24px', display: 'flex', gap: '20px', position: 'relative' }}>
    <div style={{ padding: '12px', borderRadius: '12px', background: 'var(--primary-glow)', height: 'fit-content', color: 'var(--primary)' }}>
      <MessageSquare size={20} />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: '600' }}>{update.agent_name || 'System Registry'}</h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(update.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
        </div>
        {update.stage && (
          <span style={{ fontSize: '0.7rem', padding: '4px 10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'var(--primary)', fontWeight: '600', textTransform: 'uppercase' }}>
            {update.stage}
          </span>
        )}
      </div>
      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: '1.6', fontStyle: 'italic' }}>"{update.notes}"</p>
      </div>
    </div>
  </div>
);

const InsightBox = ({ title, text, type }) => (
  <div style={{ 
    padding: '16px', 
    borderRadius: '12px', 
    background: type === 'warning' ? 'rgba(245, 158, 11, 0.05)' : 'rgba(255,255,255,0.02)',
    border: type === 'warning' ? '1px solid rgba(245, 158, 11, 0.1)' : '1px solid var(--border-glass)'
  }}>
    <h4 style={{ fontSize: '0.85rem', color: type === 'warning' ? 'var(--status-risk)' : 'var(--text-main)', marginBottom: '6px' }}>{title}</h4>
    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{text}</p>
  </div>
);

export default FieldDetail;
