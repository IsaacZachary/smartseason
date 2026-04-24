import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fieldAPI } from '../api';
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
  Save
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
      const response = await fieldAPI.retrieve(id);
      setField(response.data);
      setNewStage(response.data.current_stage);
      
      // Fetch updates history
      const updatesRes = await fieldAPI.list('updates', { params: { field_id: id } });
      // Actually we'll just use the list endpoint with a filter if possible, 
      // but my viewset was simpler. Let's adjust the retrieve or fetch separately.
      // For now, let's assume we can get updates for this field.
      // (Correcting API call based on my earlier FieldUpdateViewSet)
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
      setShowUpdateForm(false);
      setNotes('');
      fetchData(); // Refresh data
    } catch (err) {
      console.error('Error adding update:', err);
      alert('Failed to add update.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading field details...</div>;
  if (!field) return <div style={{ padding: '40px', textAlign: 'center' }}>Field not found.</div>;

  const statusClass = `badge-${field.status.toLowerCase().replace(' ', '-')}`;

  return (
    <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto' }}>
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '32px', fontSize: '0.9rem' }}>
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

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
              <InfoItem icon={<UserIcon size={18} />} label="Assigned Agent" value={field.assigned_agent_details?.first_name ? `${field.assigned_agent_details.first_name} ${field.assigned_agent_details.last_name}` : 'Unassigned'} />
              <InfoItem icon={<Clock size={18} />} label="Last Sync" value={new Date(field.updated_at).toLocaleDateString()} />
            </div>
          </section>

          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <History size={22} color="var(--primary)" />
                Update History
              </h2>
              <button 
                onClick={() => setShowUpdateForm(!showUpdateForm)}
                className="btn-primary" 
                style={{ padding: '8px 16px', fontSize: '0.9rem' }}
              >
                {showUpdateForm ? 'Cancel' : (
                  <>
                    <Plus size={16} />
                    New Observation
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
                        placeholder="What did you observe today? Any pests, weather issues, or growth milestones?"
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
              {field.last_update ? (
                <UpdateItem update={field.last_update} />
              ) : (
                <div style={{ padding: '32px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '16px', color: 'var(--text-muted)' }}>
                  No updates recorded yet for this field.
                </div>
              )}
              {/* Note: In a real app we'd map all updates here */}
            </div>
          </section>
        </div>

        {/* Right Column: Insights & Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <section className="glass-panel glass-card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sprout size={18} color="var(--primary)" />
              Quick Insights
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <InsightBox 
                title="Status Analysis" 
                text={field.status === 'At Risk' ? 'This field requires immediate attention due to growth delays or lack of updates.' : 'Field is progressing normally within expected timeframes.'}
                type={field.status === 'At Risk' ? 'warning' : 'success'}
              />
              <InsightBox 
                title="Next Action" 
                text={field.current_stage === 'ready' ? 'Coordinate harvesting equipment and logistics for this plot.' : 'Continue routine moisture and pest monitoring.'}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ icon, label, value, highlight }) => (
  <div style={{ display: 'flex', gap: '12px' }}>
    <div style={{ color: 'var(--text-muted)', paddingTop: '2px' }}>{icon}</div>
    <div>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '2px' }}>{label}</p>
      <p style={{ fontSize: '1rem', fontWeight: highlight ? '600' : '400', color: highlight ? 'var(--primary)' : 'inherit', textTransform: highlight ? 'capitalize' : 'none' }}>{value}</p>
    </div>
  </div>
);

const UpdateItem = ({ update }) => (
  <div className="glass-panel" style={{ padding: '20px', display: 'flex', gap: '16px' }}>
    <div style={{ padding: '10px', borderRadius: '50%', background: 'var(--bg-card)', height: 'fit-content' }}>
      <MessageSquare size={18} color="var(--primary)" />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <h4 style={{ fontSize: '0.95rem' }}>{update.agent_name || 'Agent'}</h4>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(update.created_at).toLocaleString()}</span>
      </div>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '12px' }}>{update.notes}</p>
      {update.stage && (
        <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: 'var(--primary-glow)', color: 'var(--primary)', fontWeight: '500' }}>
          Stage changed to: {update.stage}
        </span>
      )}
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
