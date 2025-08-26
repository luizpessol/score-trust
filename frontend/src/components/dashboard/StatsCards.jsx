import React from 'react';
import { motion } from 'framer-motion';
import { Users, CheckCircle, AlertTriangle, XCircle, Globe, TrendingUp } from 'lucide-react';

const getStats = (data) => {
  if (!data) return { total: 0, allow: 0, review: 0, deny: 0, countries: 0, avgScore: 0 };

  const total = data.length;
  const allow = data.filter(item => item.action === 'ALLOW').length;
  const review = data.filter(item => item.action === 'REVIEW').length;
  const deny = data.filter(item => item.action === 'DENY').length;
  const countries = new Set(data.map(item => item.country)).size;
  const avgScore = total > 0 ? data.reduce((sum, item) => sum + item.score, 0) / total : 0;
  
  return { total, allow, review, deny, countries, avgScore: Math.round(avgScore) };
};

const getScoreColor = (score) => {
    if (score > 75) return 'text-red-400';
    if (score > 30) return 'text-yellow-400';
    return 'text-green-400';
};

const StatCard = ({ icon, label, value, colorClass }) => (
  <div className="glass-effect p-4 rounded-xl text-center">
    {icon}
    <div className={`text-2xl font-bold ${colorClass || 'text-white'}`}>{value}</div>
    <div className="text-sm text-gray-400">{label}</div>
  </div>
);

const StatsCards = ({ data }) => {
  const stats = getStats(data);

  const cards = [
    { icon: <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />, label: 'Total Consultas', value: stats.total },
    { icon: <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />, label: 'ALLOW', value: stats.allow, colorClass: 'text-green-400' },
    { icon: <AlertTriangle className="h-8 w-8 text-yellow-400 mx-auto mb-2" />, label: 'REVIEW', value: stats.review, colorClass: 'text-yellow-400' },
    { icon: <XCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />, label: 'DENY', value: stats.deny, colorClass: 'text-red-400' },
    { icon: <Globe className="h-8 w-8 text-purple-400 mx-auto mb-2" />, label: 'Países', value: stats.countries, colorClass: 'text-purple-400' },
    { icon: <TrendingUp className="h-8 w-8 text-blue-400 mx-auto mb-2" />, label: 'Score Médio', value: stats.avgScore, colorClass: getScoreColor(stats.avgScore) },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
    >
      {cards.map((card, index) => (
        <StatCard key={index} {...card} />
      ))}
    </motion.div>
  );
};

export default StatsCards;