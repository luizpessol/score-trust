import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Globe } from 'lucide-react';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const getChartData = (data) => {
  if (!data || data.length === 0) {
    return {
      actions: { allow: 0, review: 0, deny: 0, total: 0 },
      countries: []
    };
  }

  const total = data.length;
  const allow = data.filter(item => item.action === 'ALLOW').length;
  const review = data.filter(item => item.action === 'REVIEW').length;
  const deny = data.filter(item => item.action === 'DENY').length;

  const countryCounts = data.reduce((acc, item) => {
    acc[item.country] = (acc[item.country] || 0) + 1;
    return acc;
  }, {});

  const countries = Object.entries(countryCounts)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    actions: { allow, review, deny, total },
    countries
  };
};

const ActionDistributionBar = ({ icon, label, count, total, colorClass }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center">
      {icon}
      <span className="text-gray-300">{label}</span>
    </div>
    <div className="flex items-center space-x-2">
      <div className="w-32 bg-gray-700 rounded-full h-2">
        <div
          className={`${colorClass} h-2 rounded-full`}
          style={{ width: total > 0 ? `${(count / total) * 100}%` : '0%' }}
        ></div>
      </div>
      <span className="text-white font-semibold w-12 text-right">{count}</span>
    </div>
  </div>
);

const ChartsSection = ({ data }) => {
  const { actions, countries } = getChartData(data);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="grid lg:grid-cols-2 gap-8 mb-8"
    >
      <div className="glass-effect p-6 rounded-xl">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
          <BarChart3 className="h-6 w-6 mr-2 text-blue-400" />
          Distribuição de Ações
        </h2>
        <div className="space-y-4">
          <ActionDistributionBar icon={<CheckCircle className="h-5 w-5 text-green-400 mr-2" />} label="ALLOW" count={actions.allow} total={actions.total} colorClass="bg-green-400" />
          <ActionDistributionBar icon={<AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />} label="REVIEW" count={actions.review} total={actions.total} colorClass="bg-yellow-400" />
          <ActionDistributionBar icon={<XCircle className="h-5 w-5 text-red-400 mr-2" />} label="DENY" count={actions.deny} total={actions.total} colorClass="bg-red-400" />
        </div>
      </div>

      <div className="glass-effect p-6 rounded-xl">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Globe className="h-6 w-6 mr-2 text-blue-400" />
          Países Mais Ativos
        </h2>
        <div className="space-y-3">
          {countries.map((item) => (
            <div key={item.country} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-semibold text-sm">{item.country}</span>
                </div>
                <span className="text-gray-300">{item.country === 'BR' ? 'Brasil' : item.country === 'US' ? 'Estados Unidos' : 'Outro'}</span>
              </div>
              <span className="text-white font-semibold">{item.count}</span>
            </div>
          ))}
          {countries.length === 0 && <p className="text-gray-400 text-center py-4">Sem dados de países para exibir.</p>}
        </div>
      </div>
    </motion.div>
  );
};

export default ChartsSection;