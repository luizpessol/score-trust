import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { RefreshCw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import StatsCards from '@/components/dashboard/StatsCards';
import ChartsSection from '@/components/dashboard/ChartsSection';
import EventsTable from '@/components/dashboard/EventsTable';

const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://api.score-trust.com/getRiskEvents', {
        method: 'GET',
        headers: {
          'x-api-key': '5DSXER5tno7m0UiayNXipuAWKqcBg713eppFhNFd',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      const processedData = result.data.map(item => {
        let action = 'ALLOW';
        if (item.score > 75) {
            action = 'DENY';
        } else if (item.score > 30) {
            action = 'REVIEW';
        }
        return { ...item, action };
      });

      setData(processedData);
      setLastUpdate(new Date());
      
      toast({
        title: "Dados atualizados!",
        description: `${processedData.length} eventos carregados com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível conectar à API. Usando dados de demonstração.",
        variant: "destructive"
      });
      
      const demoData = [
        {
          abuse_score: 0,
          action: "ALLOW",
          device_hash: "f8255775111e837562950532ec777a95fa944bf6bedb059b08559945fe5c9e76",
          ip_address: "177.33.126.12",
          timestamp: "2025-08-21T19:56:43.666676+00:00",
          score: 10,
          ttl: 1756421803,
          device_name: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
          id: "4e1d03cb-3b27-4866-bfae-a2bc9f4afdbc",
          email: "carolzinhaaraujo.paro@gmail.com",
          country: "BR",
          reason: []
        },
        {
          abuse_score: 15,
          action: "REVIEW",
          device_hash: "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456",
          ip_address: "192.168.1.100",
          timestamp: "2025-08-21T18:30:15.123456+00:00",
          score: 55,
          ttl: 1756421803,
          device_name: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          id: "7f2e8d9c-1a2b-3c4d-5e6f-789012345678",
          email: "usuario.suspeito@email.com",
          country: "US",
          reason: ["IP suspeito", "Padrão anômalo"]
        },
        {
          abuse_score: 85,
          action: "DENY",
          device_hash: "9876543210abcdef9876543210abcdef9876543210abcdef9876543210abcdef",
          ip_address: "10.0.0.1",
          timestamp: "2025-08-21T17:15:30.987654+00:00",
          score: 90,
          ttl: 1756421803,
          device_name: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
          id: "abc123def-456-789-012-345678901234",
          email: "fraude@malicious.com",
          country: "XX",
          reason: ["IP blacklist", "Dispositivo comprometido", "Padrão de fraude"]
        }
      ];
      setData(demoData);
      setLastUpdate(new Date());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <Helmet>
        <title>Dashboard - Score Trust</title>
        <meta name="description" content="Dashboard completo com estatísticas de análise de risco, eventos de segurança e métricas em tempo real do Score Trust." />
        <meta property="og:title" content="Dashboard - Score Trust" />
        <meta property="og:description" content="Dashboard completo com estatísticas de análise de risco, eventos de segurança e métricas em tempo real do Score Trust." />
      </Helmet>

      <div className="pt-24 pb-12 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                Dashboard
              </h1>
              <p className="text-xl text-gray-300">
                Monitoramento em tempo real de eventos de risco
              </p>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              {lastUpdate && (
                <div className="text-sm text-gray-400 flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Atualizado: {lastUpdate.toLocaleTimeString('pt-BR')}
                </div>
              )}
              <Button
                onClick={fetchData}
                disabled={loading}
                variant="outline"
                className="border-blue-400 text-blue-400 hover:bg-blue-400/10"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Atualizar
              </Button>
            </div>
          </motion.div>

          <StatsCards data={data} />
          <ChartsSection data={data} />
          <EventsTable data={data} loading={loading} />

        </div>
      </div>
    </>
  );
};

export default DashboardPage;