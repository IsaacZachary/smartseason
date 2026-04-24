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
  Sprout
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import CreateFieldModal from '../components/CreateFieldModal';

const Dashboard = () => {
  const { user, logout, isAdmin } = useAuth();
  const [fields, setFields] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  useEffect(() => {
    fetchData();
  }, []);

  const filteredFields = fields.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.crop_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '20px' }}>
      <Activity className="animate-spin" size={40} color="var(--primary)" />
      <p style={{ color: 'var(--text-muted)', letterSpacing: '0.1em' }}>SYNCHRONIZING FIELD DATA...</p>
    </div>
  );

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
        <div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: '700', marginBottom: '8px', background: 'linear-gradient(to right, #fff, #94A3B8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            System Dashboard
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ padding: '4px 10px', borderRadius: '6px', background: 'var(--primary-glow)', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: '600' }}>
              {isAdmin ? 'ADMINISTRATOR' : 'FIELD AGENT'}
            </span>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user.first_name} {user.last_name} • {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 16px', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-glass)' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-glow)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserIcon size={18} />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{user.email}</span>
          </div>
          <button onClick={logout} className="glass-panel" style={{ padding: '10px', borderRadius: '12px', color: '#F87171', border: '1px solid rgba(248, 113, 113, 0.2)' }}>
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Stats Overview */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '64px' }}>
        <StatCard title="Total Inventory" value={stats?.total_fields || 0} icon={<MapIcon size={24} />} color="#3B82F6" trend="+12% from last month" />
        <StatCard title="Active Growth" value={stats?.status_breakdown.Active || 0} icon={<TrendingUp size={24} />} color="var(--status-active)" trend="Normal progression" />
        <StatCard title="Critical Attention" value={stats?.status_breakdown['At Risk'] || 0} icon={<AlertTriangle size={24} />} color="var(--status-risk)" trend="Action required" />
        <StatCard title="Yield Ready" value={stats?.status_breakdown.Completed || 0} icon={<CheckCircle2 size={24} />} color="var(--status-completed)" trend="Harvest successful" />
      </section>

      {/* Fields List Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '4px' }}>Field Monitoring Registry</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Real-time telemetry and lifecycle tracking for {filteredFields.length} active plots</p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
            <input 
              type="text" 
              placeholder="Filter by name or crop..." 
              className="glass-input" 
              style={{ paddingLeft: '44px', width: '320px', background: 'rgba(255,255,255,0.03)' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {isAdmin && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="btn-primary" 
              style={{ padding: '0 24px', height: '48px', boxShadow: '0 8px 16px var(--primary-glow)' }}
            >
              <Plus size={18} />
              Register New Field
            </button>
          )}
        </div>
      </div>

      {/* Fields Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '32px' }}>
        {filteredFields.length > 0 ? (
          filteredFields.map((field, index) => (
            <FieldCard key={field.id} field={field} index={index} />
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px', background: 'var(--bg-card)', borderRadius: '24px', border: '1px dashed var(--border-glass)' }}>
            <MapIcon size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px', opacity: 0.5 }} />
            <h3>No fields found</h3>
            <p style={{ color: 'var(--text-muted)' }}>Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      <CreateFieldModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreated={fetchData} 
      />
    </div>
  );
};

const StatCard = ({ title, value, icon, color, trend }) => (
  <motion.div 
    whileHover={{ y: -5, scale: 1.02 }}
    className="glass-panel glass-card" 
    style={{ display: 'flex', alignItems: 'center', gap: '20px', borderLeft: `4px solid ${color}` }}
  >
    <div style={{ padding: '14px', borderRadius: '12px', background: `${color}15`, color: color }}>
      {icon}
    </div>
    <div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{title}</p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <h3 style={{ fontSize: '2rem', fontWeight: '700' }}>{value}</h3>
        {trend && <span style={{ fontSize: '0.7rem', color: color, opacity: 0.8 }}>{trend}</span>}
      </div>
    </div>
  </motion.div>
);

const FieldCard = ({ field, index }) => {
  const statusClass = `badge-${field.status.toLowerCase().replace(' ', '-')}`;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -8 }}
      className="glass-panel"
      style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ height: '8px', background: `var(--status-${field.status.toLowerCase().replace(' ', '-')})` }}></div>
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '4px' }}>{field.name}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <Sprout size={14} />
              {field.crop_type}
            </div>
          </div>
          <span className={`badge ${statusClass}`}>{field.status}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>PLANTING DATE</p>
            <p style={{ fontSize: '0.9rem', fontWeight: '500' }}>{new Date(field.planting_date).toLocaleDateString()}</p>
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>CURRENT STAGE</p>
            <p style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--primary)', textTransform: 'capitalize' }}>{field.current_stage}</p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-card-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <UserIcon size={14} />
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {field.assigned_agent_details?.first_name ? `${field.assigned_agent_details.first_name} ${field.assigned_agent_details.last_name}` : 'Unassigned'}
            </span>
          </div>
        </div>

        <Link 
          to={`/fields/${field.id}`} 
          className="btn-primary" 
          style={{ 
            width: '100%', 
            justifyContent: 'center', 
            background: 'var(--bg-card-hover)', 
            color: 'white', 
            border: '1px solid var(--border-glass)',
            fontSize: '0.9rem'
          }}
        >
          View Telemetry
          <ChevronRight size={18} />
        </Link>
      </div>
    </motion.div>
  );
};

export default Dashboard;
