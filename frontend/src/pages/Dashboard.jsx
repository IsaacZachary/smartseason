import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fieldAPI } from '../api';
import { 
  LayoutDashboard, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Map as MapIcon, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  LogOut,
  User as UserIcon,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout, isAdmin } = useAuth();
  const [fields, setFields] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fieldsRes, statsRes] = await Promise.all([
          fieldAPI.list(),
          fieldAPI.stats()
        ]);
        setFields(fieldsRes.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredFields = fields.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.crop_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading your dashboard...</div>;

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '4px' }}>Welcome back, {user.first_name}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{isAdmin ? 'System Administrator' : 'Field Agent'} • {new Date().toLocaleDateString()}</p>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 16px', borderRadius: '30px', background: 'var(--bg-card)' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-glow)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserIcon size={18} />
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{user.email}</span>
          </div>
          <button onClick={logout} className="glass-panel" style={{ padding: '10px', borderRadius: '12px', color: '#F87171' }}>
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Stats Overview */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '48px' }}>
        <StatCard title="Total Fields" value={stats?.total_fields || 0} icon={<MapIcon size={24} />} color="var(--primary)" />
        <StatCard title="Active" value={stats?.status_breakdown.Active || 0} icon={<Clock size={24} />} color="var(--status-active)" />
        <StatCard title="At Risk" value={stats?.status_breakdown['At Risk'] || 0} icon={<AlertTriangle size={24} />} color="var(--status-risk)" />
        <StatCard title="Completed" value={stats?.status_breakdown.Completed || 0} icon={<CheckCircle2 size={24} />} color="var(--status-completed)" />
      </section>

      {/* Fields List Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{isAdmin ? 'All monitored fields' : 'My assigned fields'}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Showing {filteredFields.length} crops in progress</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
            <input 
              type="text" 
              placeholder="Search fields..." 
              className="glass-input" 
              style={{ paddingLeft: '40px', width: '260px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {isAdmin && (
            <button className="btn-primary">
              <Plus size={18} />
              Add Field
            </button>
          )}
        </div>
      </div>

      {/* Fields Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
        {filteredFields.map((field, index) => (
          <FieldCard key={field.id} field={field} index={index} />
        ))}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="glass-panel glass-card" 
    style={{ display: 'flex', alignItems: 'center', gap: '20px' }}
  >
    <div style={{ padding: '12px', borderRadius: '12px', background: `${color}15`, color: color }}>
      {icon}
    </div>
    <div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>{title}</p>
      <h3 style={{ fontSize: '1.8rem' }}>{value}</h3>
    </div>
  </motion.div>
);

const FieldCard = ({ field, index }) => {
  const statusClass = `badge-${field.status.toLowerCase().replace(' ', '-')}`;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass-panel glass-card"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{field.name}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{field.crop_type}</p>
        </div>
        <span className={`badge ${statusClass}`}>{field.status}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Planting Date</span>
          <span>{new Date(field.planting_date).toLocaleDateString()}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Current Stage</span>
          <span style={{ textTransform: 'capitalize', fontWeight: '500', color: 'var(--primary)' }}>{field.current_stage}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Assigned To</span>
          <span>{field.assigned_agent_details?.first_name || 'Unassigned'}</span>
        </div>
      </div>

      <Link to={`/fields/${field.id}`} className="btn-primary" style={{ width: '100%', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--border-glass)' }}>
        View Details
        <ChevronRight size={18} />
      </Link>
    </motion.div>
  );
};

export default Dashboard;
