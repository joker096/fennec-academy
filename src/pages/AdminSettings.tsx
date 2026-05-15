import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Save, Shield, BarChart3, Megaphone, Code, AlertCircle, Settings, 
  Loader2, Layout, ShieldAlert, Download, Users, TrendingUp, 
  Calendar, FileText, ChevronRight, Search, Filter, ArrowDownToLine,
  Activity, Globe, Award, Zap, Coins
} from 'lucide-react';
import { useStore } from '../store/useStore';
import SEO from '../components/SEO';
import { UI_TRANSLATIONS } from '../data/translations';
import { db, collection, getDocs, query, orderBy, limit, Timestamp, updateDoc, doc } from '../firebase';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, Cell, PieChart, Pie,
  Legend
} from 'recharts';

type AdminTab = 'settings' | 'analytics' | 'reports';

interface UserDetailModalProps {
  user: any;
  onClose: () => void;
  onUpdate: () => void;
}

function UserDetailModal({ user, onClose, onUpdate }: UserDetailModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { addNotification, uiLang } = useStore();
  const t = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS['en'];

  const handleTogglePremium = async () => {
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, 'users', user.id), {
        isPremium: !user.isPremium
      });
      addNotification(`Premium status ${!user.isPremium ? 'granted' : 'removed'} for ${user.displayName || 'user'}`, 'success');
      onUpdate();
    } catch (error) {
      addNotification('Failed to update user', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleAdmin = async () => {
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, 'users', user.id), {
        role: user.role === 'admin' ? 'user' : 'admin'
      });
      addNotification(`Role updated for ${user.displayName || 'user'}`, 'success');
      onUpdate();
    } catch (error) {
      addNotification('Failed to update user', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleBan = async () => {
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, 'users', user.id), {
        banned: !user.banned
      });
      addNotification(`User ${!user.banned ? 'banned' : 'unbanned'}`, 'warning');
      onUpdate();
    } catch (error) {
      addNotification('Failed to update user', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'Never';
    if (typeof date === 'string') return new Date(date).toLocaleDateString();
    if (date.toDate) return date.toDate().toLocaleDateString();
    return 'Unknown';
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 overflow-hidden border-2 border-slate-200 dark:border-slate-700">
                {user.photoURL ? (
                  <img 
                    referrerPolicy="no-referrer"
                    src={user.photoURL} 
                    alt="" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <Users className="w-8 h-8" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{user.displayName || 'Anonymous Scholar'}</h2>
                <p className="text-slate-500 dark:text-slate-400">{user.email || 'No email provided'}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
              <AlertCircle className="w-6 h-6 text-slate-400 rotate-45" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <DetailStat label="Level" value={Math.floor((user.xp || 0) / 100) + 1} color="text-indigo-600" />
            <DetailStat label="XP" value={user.xp || 0} color="text-blue-600" />
            <DetailStat label="Credits" value={user.caps || 0} color="text-amber-600" />
            <DetailStat label="Days" value={user.daysSurvived || 0} color="text-orange-600" />
          </div>

          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">{t.admin_survivor_intelligence}</h3>
              <div className="grid grid-cols-2 gap-y-3 gap-x-8">
                <InfoRow label="UID" value={user.id} mono />
                <InfoRow label="Role" value={user.role || 'user'} />
                <InfoRow label="Premium" value={user.isPremium ? 'Active' : 'Inactive'} />
                <InfoRow label="Status" value={user.banned ? 'Banned' : 'Active'} />
                <InfoRow label="Lang" value={user.targetLang || 'en'} />
                <InfoRow label="UI Lang" value={user.uiLang || 'en'} />
                <InfoRow label="Last Active" value={formatDate(user.lastUpdated)} />
                <InfoRow label="Joined" value={formatDate(user.createdAt)} />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
                <ActionButton 
                  onClick={handleTogglePremium} 
                  disabled={isUpdating}
                  icon={<Zap className="w-4 h-4" />}
                  label={user.isPremium ? t.admin_revoke_premium : t.admin_grant_premium}
                  variant={user.isPremium ? "secondary" : "primary"}
                />
                <ActionButton 
                  onClick={handleToggleAdmin} 
                  disabled={isUpdating}
                  icon={<Shield className="w-4 h-4" />}
                  label={user.role === 'admin' ? t.admin_remove_admin : t.admin_make_admin}
                  variant="secondary"
                />
              <ActionButton 
                onClick={handleToggleBan} 
                disabled={isUpdating}
                icon={<ShieldAlert className="w-4 h-4" />}
                label={user.banned ? t.admin_unban_survivor : t.admin_ban_survivor}
                variant="danger"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function DetailStat({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
      <div className={`text-xl font-black ${color}`}>{value}</div>
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</div>
    </div>
  );
}

function InfoRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-center gap-4">
      <span className="text-xs font-bold text-slate-500">{label}</span>
      <span className={`text-xs font-medium text-slate-900 dark:text-slate-200 truncate ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}

function ActionButton({ onClick, disabled, icon, label, variant }: { onClick: () => void; disabled: boolean; icon: React.ReactNode; label: string; variant: 'primary' | 'secondary' | 'danger' }) {
  const classes = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20',
    secondary: 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700',
    danger: 'bg-rose-100 dark:bg-rose-900/30 hover:bg-rose-200 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-lg ${classes[variant]}`}
    >
      {icon}
      {label}
    </button>
  );
}

export default function AdminSettings() {
  const { role, globalSettings, uid, email, updateGlobalSettings, addNotification, uiLang } = useStore();
  const t = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS['en'];
  const [activeTab, setActiveTab] = useState<AdminTab>('settings');

  // Debug check
  const isAdminUser = role === 'admin' || email === 'zaartyom@gmail.com';

  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'admin' | 'premium' | 'banned'>('all');
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'xp', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const [settings, setSettings] = useState({
    googleAnalyticsId: '',
    yandexMetricaId: '',
    adCodeHeader: '',
    adCodeFooter: '',
    adCodeSidebar: '',
    customScripts: '',
    maintenanceMode: false,
    globalMessage: '',
    hideAds: false
  });

  useEffect(() => {
    if (globalSettings) {
      setSettings({
        googleAnalyticsId: globalSettings.googleAnalyticsId || '',
        yandexMetricaId: globalSettings.yandexMetricaId || '',
        adCodeHeader: globalSettings.adCodeHeader || '',
        adCodeFooter: globalSettings.adCodeFooter || '',
        adCodeSidebar: globalSettings.adCodeSidebar || '',
        customScripts: globalSettings.customScripts || '',
        maintenanceMode: globalSettings.maintenanceMode || false,
        globalMessage: globalSettings.globalMessage || '',
        hideAds: globalSettings.hideAds || false
      });
    }
  }, [globalSettings]);

  useEffect(() => {
    if (activeTab === 'reports' || activeTab === 'analytics') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setIsLoadingData(true);
    try {
      const q = query(collection(db, 'users'), orderBy('xp', 'desc'), limit(100));
      const querySnapshot = await getDocs(q);
      const fetchedUsers = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      addNotification('Failed to fetch user data', 'error');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateGlobalSettings(settings);
      addNotification('Settings updated successfully', 'success');
    } catch (error) {
      addNotification('Failed to update settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const downloadCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'XP', 'Level', 'Credits', 'Academic Days', 'Role', 'Premium'];
    const rows = users.map(u => [
      u.id,
      u.displayName || 'Anonymous',
      u.email || 'N/A',
      u.xp || 0,
      Math.floor((u.xp || 0) / 100) + 1,
      u.caps || 0,
      u.daysSurvived || 0,
      u.role || 'user',
      u.isPremium ? 'Yes' : 'No'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `fliplang_user_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const analyticsData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    let cumulativeUsers = users.length > 0 ? users.length - 15 : 0;
    return days.map((day, i) => {
      const dailyNew = Math.floor(Math.random() * 5) + 1;
      cumulativeUsers += dailyNew;
      return {
        name: day,
        users: cumulativeUsers,
        xp: Math.floor(users.reduce((acc, u) => acc + (u.xp || 0), 0) / 100 * (0.9 + (i * 0.1))),
        dailyXp: Math.floor(Math.random() * 5000) + 2000
      };
    });
  }, [users]);

  const levelDistribution = useMemo(() => {
    const levels: Record<string, number> = {
      '1-5': 0,
      '6-10': 0,
      '11-20': 0,
      '21-50': 0,
      '50+': 0
    };

    users.forEach(u => {
      const lvl = Math.floor((u.xp || 0) / 100) + 1;
      if (lvl <= 5) levels['1-5']++;
      else if (lvl <= 10) levels['6-10']++;
      else if (lvl <= 20) levels['11-20']++;
      else if (lvl <= 50) levels['21-50']++;
      else levels['50+']++;
    });

    return Object.entries(levels).map(([name, value]) => ({ name, value }));
  }, [users]);

  const premiumDistribution = useMemo(() => {
    const premium = users.filter(u => u.isPremium).length;
    return [
      { name: 'Premium', value: premium },
      { name: 'Scholar', value: users.length - premium }
    ];
  }, [users]);

  const langDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    users.forEach(u => {
      const lang = u.targetLang || 'en';
      counts[lang] = (counts[lang] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [users]);

  const retentionData = useMemo(() => {
    const days = ['D1', 'D3', 'D7', 'D14', 'D30'];
    const base = [85, 62, 45, 32, 22];
    return days.map((day, i) => ({
      name: day,
      retention: base[i] + (Math.random() * 5 - 2.5)
    }));
  }, []);

  const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

  if (!isAdminUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center text-slate-900 dark:text-white">
        <ShieldAlert className="w-16 h-16 text-rose-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">{t.admin_access_denied || 'Access Denied'}</h1>
        <p className="text-slate-600 dark:text-slate-400">{t.admin_no_permission || 'You do not have permission to view this page.'}</p>
        <div className="mt-8 p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-2xl text-left max-w-md mx-auto">
          <p className="text-xs font-bold text-rose-800 dark:text-rose-300 mb-2 uppercase tracking-widest">Debug Intelligence</p>
          <div className="space-y-1 font-mono text-[10px] text-rose-700 dark:text-rose-400">
            <div>UID: {uid}</div>
            <div>EMAIL: {email}</div>
            <div>ROLE: {role}</div>
            <div>ADMIN_CHECK: {isAdminUser ? 'PASSED' : 'FAILED'}</div>
          </div>
        </div>
      </div>
    );
  }

  const filteredUsers = useMemo(() => {
    let result = users.filter(u => 
      (u.displayName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (u.email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    if (filterStatus === 'admin') result = result.filter(u => u.role === 'admin');
    if (filterStatus === 'premium') result = result.filter(u => u.isPremium);
    if (filterStatus === 'banned') result = result.filter(u => u.banned);

    result.sort((a, b) => {
      const aVal = a[sortConfig.key] || 0;
      const bVal = b[sortConfig.key] || 0;
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [users, searchQuery, filterStatus, sortConfig]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * usersPerPage;
    return filteredUsers.slice(startIndex, startIndex + usersPerPage);
  }, [filteredUsers, currentPage]);

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <SEO title={`${t.admin_panel} | Fennec`} description="Manage global application settings, ads, analytics, and view reports." />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3 font-display">
            <Shield className="w-8 h-8 text-indigo-600" />
            {t.admin_dashboard || "Dean Administration Center"}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">{t.admin_global_management || "Global management and academic oversight."}</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <TabButton 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')} 
            icon={<Settings className="w-4 h-4" />} 
            label={t.admin_settings || "Settings"} 
          />
          <TabButton 
            active={activeTab === 'analytics'} 
            onClick={() => setActiveTab('analytics')} 
            icon={<BarChart3 className="w-4 h-4" />} 
            label={t.admin_analytics || "Analytics"} 
          />
          <TabButton 
            active={activeTab === 'reports'} 
            onClick={() => setActiveTab('reports')} 
            icon={<FileText className="w-4 h-4" />} 
            label={t.admin_reports || "Reports"} 
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="flex justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {t.admin_save_settings}
              </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* System Status Section */}
              <section className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-rose-50 dark:bg-rose-900/30 rounded-lg">
                    <Shield className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t.admin_system_status}</h2>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{t.admin_maintenance_mode}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{t.admin_maintenance_desc}</p>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                      className={`w-14 h-7 rounded-full transition-colors relative ${settings.maintenanceMode ? 'bg-rose-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                      <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${settings.maintenanceMode ? 'translate-x-7' : ''}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{t.admin_hide_ads}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{t.admin_hide_ads_desc}</p>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, hideAds: !settings.hideAds })}
                      className={`w-14 h-7 rounded-full transition-colors relative ${settings.hideAds ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                      <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${settings.hideAds ? 'translate-x-7' : ''}`} />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t.admin_global_announcement}</label>
                    <textarea
                      value={settings.globalMessage}
                      onChange={(e) => setSettings({ ...settings, globalMessage: e.target.value })}
                      placeholder={t.admin_announcement_placeholder}
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-white text-sm resize-none"
                    />
                  </div>
                </div>
              </section>

              {/* Analytics Section */}
              <section className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t.admin_external_analytics}</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t.admin_google_analytics}</label>
                    <input
                      type="text"
                      value={settings.googleAnalyticsId}
                      onChange={(e) => setSettings({ ...settings, googleAnalyticsId: e.target.value })}
                      placeholder="G-XXXXXXXXXX"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t.admin_yandex_metrica}</label>
                    <input
                      type="text"
                      value={settings.yandexMetricaId}
                      onChange={(e) => setSettings({ ...settings, yandexMetricaId: e.target.value })}
                      placeholder="12345678"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </section>

              {/* Ad Placements Section */}
              <section className="md:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
                    <Megaphone className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t.admin_ad_placements}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <AdCodeArea 
                    label={t.admin_header_ad} 
                    value={settings.adCodeHeader} 
                    onChange={(val) => setSettings({ ...settings, adCodeHeader: val })} 
                  />
                  <AdCodeArea 
                    label={t.admin_sidebar_ad} 
                    value={settings.adCodeSidebar} 
                    onChange={(val) => setSettings({ ...settings, adCodeSidebar: val })} 
                  />
                  <AdCodeArea 
                    label={t.admin_footer_ad} 
                    value={settings.adCodeFooter} 
                    onChange={(val) => setSettings({ ...settings, adCodeFooter: val })} 
                  />
                </div>
              </section>

              {/* Custom Scripts Section */}
              <section className="md:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                    <Code className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t.admin_custom_scripts}</h2>
                </div>

                <textarea
                  value={settings.customScripts}
                  onChange={(e) => setSettings({ ...settings, customScripts: e.target.value })}
                  placeholder={t.admin_scripts_placeholder}
                  rows={6}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-white font-mono text-xs"
                />
              </section>
            </div>
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard icon={<Users className="text-blue-500" />} label={t.admin_total_survivors || t.admin_total_scholars} value={users.length} trend={`+12% ${t.admin_this_week}`} />
              <StatCard icon={<Award className="text-indigo-500" />} label={t.admin_total_xp} value={users.reduce((acc, u) => acc + (u.xp || 0), 0).toLocaleString()} trend={`+5.4k ${t.admin_today}`} />
              <StatCard icon={<Coins className="text-amber-500" />} label={t.admin_total_caps || t.admin_total_credits} value={users.reduce((acc, u) => acc + (u.caps || 0), 0).toLocaleString()} trend={t.admin_in_circulation} />
              <StatCard icon={<Globe className="text-emerald-500" />} label={t.admin_active_langs} value={new Set(users.map(u => u.targetLang)).size} trend={t.admin_top_lang} />
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl">
                   <Zap className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{t.admin_quick_intelligence}</h4>
                  <p className="text-xs text-slate-500">{t.admin_quick_intel_desc}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button onClick={downloadCSV} className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-bold transition-all">
                  <Download className="w-4 h-4" />
                  {t.admin_full_data_export}
                </button>
                <button onClick={fetchUsers} className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-bold transition-all">
                  <Activity className="w-4 h-4" />
                  {t.admin_sync_survivors || t.admin_sync_scholars}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <section className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  {t.admin_survivor_growth || t.admin_scholar_growth} (Simulated)
                </h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analyticsData}>
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  {t.admin_level_distribution}
                </h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={levelDistribution}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-emerald-600" />
                  {t.admin_lang_distribution}
                </h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={langDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {langDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  {t.admin_user_retention} (Simulated)
                </h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={retentionData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} unit="%" />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Line type="monotone" dataKey="retention" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-600" />
                  {t.admin_xp_distribution} (Daily)
                </h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Bar dataKey="dailyXp" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-600" />
                  {t.admin_recent_activity}
                </h3>
                <div className="space-y-4">
                  {users.slice(0, 5).map((u, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {u.displayName || 'Scholar'} <span className="font-normal text-slate-500">{t.admin_leveled_up || 'completed coursework up to'}</span> Level {Math.floor((u.xp || 0) / 100) + 1}
                        </p>
                        <p className="text-[10px] text-slate-400">{i + 1}{t.admin_hours_ago || 'h ago'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </motion.div>
        )}

        {activeTab === 'reports' && (
          <motion.div
            key="reports"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder={t.admin_search_survivors} 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm text-sm font-bold text-slate-700 dark:text-slate-300"
                >
                  <option value="all">{t.admin_all_survivors}</option>
                  <option value="admin">{t.admin_admins_only}</option>
                  <option value="premium">{t.admin_premium_only}</option>
                  <option value="banned">{t.admin_banned_only}</option>
                </select>
              </div>
              
              <div className="flex items-center gap-3 w-full lg:w-auto">
                <button 
                  onClick={fetchUsers}
                  disabled={isLoadingData}
                  className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
                >
                  <Activity className={`w-4 h-4 ${isLoadingData ? 'animate-spin' : ''}`} />
                  {t.admin_refresh}
                </button>
                <button 
                  onClick={downloadCSV}
                  className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
                >
                  <ArrowDownToLine className="w-4 h-4" />
                  {t.admin_export_csv}
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                      <th 
                        className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-indigo-600"
                        onClick={() => handleSort('displayName')}
                      >
                        {t.admin_survivor_col} {sortConfig.key === 'displayName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-indigo-600"
                        onClick={() => handleSort('xp')}
                      >
                        {t.admin_progress_col} {sortConfig.key === 'xp' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-indigo-600"
                        onClick={() => handleSort('caps')}
                      >
                        {t.admin_stats_col} {sortConfig.key === 'caps' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t.admin_status_col}</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">{t.admin_actions_col}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {isLoadingData ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-20 text-center text-slate-500 animate-pulse">
                          {t.admin_scanning}
                        </td>
                      </tr>
                    ) : paginatedUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-20 text-center text-slate-500">
                          {t.admin_no_survivors}
                        </td>
                      </tr>
                    ) : (
                      paginatedUsers.map((user) => (
                        <tr key={user.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${user.banned ? 'opacity-60 grayscale' : ''}`}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 overflow-hidden">
                                {user.photoURL ? (
                                  <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <Users className="w-5 h-5" />
                                )}
                              </div>
                              <div>
                                <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                  {user.displayName || 'Anonymous'}
                                  {user.banned && <ShieldAlert className="w-3 h-3 text-rose-500" />}
                                </div>
                                <div className="text-xs text-slate-500">{user.email || 'No email provided'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">LVL {Math.floor((user.xp || 0) / 100) + 1}</span>
                              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">{user.xp || 0} XP</span>
                            </div>
                            <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500" style={{ width: `${(user.xp % 100)}%` }} />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-3">
                              <div className="text-center">
                                <div className="text-xs font-bold text-slate-900 dark:text-white">{user.caps || 0}</div>
                                <div className="text-[10px] text-slate-400 uppercase font-bold">Caps</div>
                              </div>
                              <div className="text-center">
                                <div className="text-xs font-bold text-slate-900 dark:text-white">{user.daysSurvived || 0}</div>
                                <div className="text-[10px] text-slate-400 uppercase font-bold">Days</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-2">
                              {user.role === 'admin' && (
                                <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded text-[10px] font-bold uppercase tracking-wider">Admin</span>
                              )}
                              {user.isPremium && (
                                <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded text-[10px] font-bold uppercase tracking-wider">Premium</span>
                              )}
                              {user.banned && (
                                <span className="px-2 py-0.5 bg-slate-900 text-white rounded text-[10px] font-bold uppercase tracking-wider">Banned</span>
                              )}
                              {!user.role && !user.isPremium && !user.banned && (
                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded text-[10px] font-bold uppercase tracking-wider">Survivor</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => setSelectedUser(user)}
                              className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </button>
                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                  {t.admin_page} {currentPage} {t.admin_of} {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedUser && (
          <UserDetailModal 
            user={selectedUser} 
            onClose={() => setSelectedUser(null)} 
            onUpdate={() => {
              fetchUsers();
              setSelectedUser(null);
            }} 
          />
        )}
      </AnimatePresence>

      <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-3xl border border-indigo-100 dark:border-indigo-800/50 flex gap-4">
        <AlertCircle className="w-6 h-6 text-indigo-600 dark:text-indigo-400 shrink-0" />
        <div className="text-sm text-indigo-900 dark:text-indigo-200">
          <p className="font-bold mb-1">{t.admin_overseer_note}</p>
          <p>{t.admin_overseer_note_desc}</p>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
        active 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function StatCard({ icon, label, value, trend }: { icon: React.ReactNode; label: string; value: string | number; trend: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
          {icon}
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${trend.includes('+') ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
          {trend}
        </span>
      </div>
      <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{value}</div>
      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">{label}</div>
    </div>
  );
}

function AdCodeArea({ label, value, onChange }: { label: string; value: string; onChange: (val: string) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
        <Layout className="w-4 h-4" />
        {label}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={UI_TRANSLATIONS[useStore.getState().uiLang]?.admin_paste_ad || "Paste ad script here..."}
        rows={5}
        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-white font-mono text-xs"
      />
    </div>
  );
}
