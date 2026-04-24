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
  ChevronRight,
  TrendingUp,
  Activity,
  Sprout,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import CreateFieldModal from '../components/CreateFieldModal';

import logo from '../assets/logo.png';

const Dashboard = () => {
  const { user, logout, isAdmin } = useAuth();
  const [fields, setFields] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark-theme');
  };

  const fetchData = async () => {
    try {
      const [fieldsRes, statsRes] = await Promise.all([
        fieldAPI.list(),
        fieldAPI.stats()
      ]);
      setFields(fieldsRes.data);
      setStats(statsRes.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredFields = fields.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.crop_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '20px' }}>
      <img src={logo} alt="Loading..." className="animate-spin" style={{ width: '40px', height: '40px', opacity: 0.5 }} />
      <p style={{ color: 'var(--text-muted)', letterSpacing: '0.1em', fontSize: '0.8rem' }}>SYNCING FIELD DATA...</p>
    </div>
  );

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img src={logo} alt="SmartSeason Logo" style={{ width: '48px', height: '48px', borderRadius: '10px' }} />
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '2px' }}>Dashboard</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="badge badge-active" style={{ fontSize: '0.6rem' }}>{isAdmin ? 'ADMINISTRATOR' : 'AGENT'}</span>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{user.first_name} {user.last_name} • {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 12px', borderRadius: '8px', background: '#fff', border: '1px solid var(--border-glass)' }}>
            <UserIcon size={16} color="var(--text-muted)" />
            <span style={{ fontSize: '0.8rem', fontWeight: '500' }}>{user.email}</span>
          </div>
          <button onClick={logout} style={{ padding: '8px', borderRadius: '8px', color: '#EF4444', border: '1px solid #FEE2E2', background: '#fff', cursor: 'pointer' }}>
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Stats Overview */}
      {error && (
        <div style={{ padding: '16px', background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#B91C1C', borderRadius: '12px', marginBottom: '32px', fontSize: '0.9rem', fontWeight: '500' }}>
          ⚠️ API Error: {error}
        </div>
      )}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '48px' }}>
        <StatCard title="Total Inventory" value={stats?.total_fields || 0} icon={<MapIcon size={20} />} color="#3B82F6" />
        <StatCard title="Active Growth" value={stats?.status_breakdown.Active || 0} icon={<TrendingUp size={20} />} color="var(--status-active)" />
        <StatCard title="Critical Attention" value={stats?.status_breakdown['At Risk'] || 0} icon={<AlertTriangle size={20} />} color="var(--status-risk)" />
        <StatCard title="Yield Ready" value={stats?.status_breakdown.Completed || 0} icon={<CheckCircle2 size={20} />} color="var(--status-completed)" />
      </section>

      {/* List Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Shamba Registry</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
            <input 
              type="text" 
              placeholder="Filter by crop..." 
              className="glass-input" 
              style={{ paddingLeft: '36px', width: '240px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {isAdmin && (
            <button onClick={() => setIsModalOpen(true)} className="btn-primary">
              <Plus size={16} />
              Register Shamba
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {filteredFields.length > 0 ? (
          filteredFields.map((field, index) => (
            <FieldCard key={field.id} field={field} index={index} />
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '16px', border: '1px dashed var(--border-glass)' }}>
            <p style={{ color: 'var(--text-muted)' }}>No shambas found.</p>
          </div>
        )}
      </div>

      <CreateFieldModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreated={fetchData} />
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', borderLeft: `4px solid ${color}` }}>
    <div style={{ padding: '10px', borderRadius: '8px', background: `${color}10`, color: color }}>
      {icon}
    </div>
    <div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>{title}</p>
      <h3 style={{ fontSize: '1.6rem', fontWeight: '800' }}>{value}</h3>
    </div>
  </div>
);

const FieldCard = ({ field, index }) => {
  const statusClass = `badge-${field.status.toLowerCase().replace(' ', '-')}`;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass-panel glass-card"
      style={{ padding: '20px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '2px' }}>{field.name}</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{field.crop_type}</p>
        </div>
        <span className={`badge ${statusClass}`}>{field.status}</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', padding: '12px', background: '#F8FAFC', borderRadius: '8px' }}>
        <div>
          <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '2px', fontWeight: '700' }}>CURRENT STAGE</p>
          <p style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--primary)', textTransform: 'capitalize' }}>{field.current_stage}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '2px', fontWeight: '700' }}>PLANTING DATE</p>
          <p style={{ fontSize: '0.85rem', fontWeight: '500' }}>{new Date(field.planting_date).toLocaleDateString()}</p>
        </div>
      </div>

      <Link 
        to={`/fields/${field.id}`} 
        className="btn-primary" 
        style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem' }}
      >
        View Telemetry
        <ChevronRight size={16} />
      </Link>
    </motion.div>
  );
};

export default Dashboard;
