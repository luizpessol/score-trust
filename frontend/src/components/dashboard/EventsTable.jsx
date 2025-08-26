import React from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

const getActionIcon = (action) => {
  switch (action) {
    case 'ALLOW':
      return <CheckCircle className="h-5 w-5 text-green-400" />;
    case 'REVIEW':
      return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
    case 'DENY':
      return <XCircle className="h-5 w-5 text-red-400" />;
    default:
      return <Shield className="h-5 w-5 text-gray-400" />;
  }
};

const getActionColor = (action) => {
  switch (action) {
    case 'ALLOW':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'REVIEW':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'DENY':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

const getScoreColor = (score) => {
    if (score > 75) return 'text-red-400';
    if (score > 30) return 'text-yellow-400';
    return 'text-green-400';
};

const EventsTable = ({ data, loading }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="glass-effect rounded-xl overflow-hidden"
    >
      <div className="p-6 border-b border-white/10">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <Shield className="h-6 w-6 mr-2 text-blue-400" />
          Eventos Recentes
        </h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">IP</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Ação</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">País</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {data && data.map((event) => (
              <tr key={event.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-white font-medium">{event.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300 font-mono">{event.ip_address}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm font-bold ${getScoreColor(event.score)}`}>
                    {event.score}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getActionColor(event.action)}`}>
                    {getActionIcon(event.action)}
                    <span className="ml-1">{event.action}</span>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300">{event.country}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-400">
                    {new Date(event.timestamp).toLocaleString('pt-BR')}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {(!data || data.length === 0) && !loading && (
        <div className="p-12 text-center">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">Nenhum evento encontrado</p>
        </div>
      )}
      
      {loading && (
        <div className="p-12 text-center">
          <RefreshCw className="h-12 w-12 text-blue-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-400">Carregando dados...</p>
        </div>
      )}
    </motion.div>
  );
};

export default EventsTable;