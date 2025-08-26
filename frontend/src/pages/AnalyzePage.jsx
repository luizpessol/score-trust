import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Search, Shield, AlertTriangle, CheckCircle, XCircle, Clock, Globe, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

const generateDeviceHash = async () => {
  const userAgent = navigator.userAgent || '';
  const language = navigator.language || '';
  const screenSize = `${window.screen.width}x${window.screen.height}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';

  const raw = `${userAgent}|${language}|${screenSize}|${timezone}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(raw);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

const sendRiskPayload = async (email) => {
  const userAgent = navigator.userAgent || '';
  const language = navigator.language || '';
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  const deviceHash = await generateDeviceHash();

  const payload = {
    email: email,
    device_name: userAgent,
    user_agent: userAgent,
    language: language,
    timezone: timezone,
    device_hash: deviceHash
  };

  try {
    const response = await fetch("https://api.score-trust.com/identity/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "5DSXER5tno7m0UiayNXipuAWKqcBg713eppFhNFd"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Erro ao verificar identidade.');
    }
    
    return result;

  } catch (error) {
    console.error("Erro ao enviar payload:", error);
    throw error;
  }
};


const AnalyzePage = () => {
  const [email, setEmail] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const getScoreColor = (score) => {
    if (score >= 76) return 'text-red-400';
    if (score >= 31) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'ALLOW':
        return <CheckCircle className="h-8 w-8 text-green-400" />;
      case 'REVIEW':
        return <AlertTriangle className="h-8 w-8 text-yellow-400" />;
      case 'DENY':
        return <XCircle className="h-8 w-8 text-red-400" />;
      default:
        return <Shield className="h-8 w-8 text-gray-400" />;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'ALLOW':
        return 'risk-low';
      case 'REVIEW':
        return 'risk-medium';
      case 'DENY':
        return 'risk-high';
      default:
        return 'bg-gray-600';
    }
  };

  const handleAnalyze = async () => {
    if (!email) {
      toast({
        title: "Email obrigatório",
        description: "Por favor, insira um email para análise.",
        variant: "destructive"
      });
      return;
    }

    if (!email.includes('@')) {
      toast({
        title: "Email inválido",
        description: "Por favor, insira um email válido.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setResult(null);
    
    try {
      const apiResult = await sendRiskPayload(email);
      
      const analysisResult = {
        email,
        score: apiResult.score,
        action: apiResult.action,
        userInfo: {
            userAgent: navigator.userAgent,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language,
            platform: navigator.platform,
            ipAddress: apiResult.ip_address || "N/A"
        },
        timestamp: new Date().toISOString(),
        reasons: apiResult.reason || [
          'Análise de reputação do IP',
          'Verificação de padrões comportamentais',
          'Análise de dispositivo e localização',
        ]
      };
      
      setResult(analysisResult);
      
      toast({
        title: "Análise concluída!",
        description: `Risco: ${apiResult.action} (score ${apiResult.score})`,
      });
      
    } catch (error) {
      toast({
        title: "Erro na análise",
        description: error.message || "Ocorreu um erro. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Análise de Risco - Score Trust</title>
        <meta name="description" content="Analise o risco de fraude em tempo real. Insira um email e obtenha instantaneamente o score de risco e recomendação de ação." />
        <meta property="og:title" content="Análise de Risco - Score Trust" />
        <meta property="og:description" content="Analise o risco de fraude em tempo real. Insira um email e obtenha instantaneamente o score de risco e recomendação de ação." />
      </Helmet>

      <div className="pt-24 pb-12 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
              Análise de Risco em Tempo Real
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Insira um email para analisar o risco de fraude baseado em múltiplos fatores comportamentais e técnicos.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-effect p-8 rounded-2xl mb-8"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="Digite o email para análise..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/5 border-white/20 text-white placeholder-gray-400 h-12 text-lg"
                  disabled={isAnalyzing}
                />
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 h-12 neon-glow"
              >
                {isAnalyzing ? (
                  <>
                    <Clock className="h-5 w-5 mr-2 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-2" />
                    Analisar
                  </>
                )}
              </Button>
            </div>
          </motion.div>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="glass-effect p-8 rounded-2xl text-center">
                <div className="mb-6">
                  {getActionIcon(result.action)}
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Score de Risco</h2>
                <div className={`text-6xl font-bold mb-4 ${getScoreColor(result.score)}`}>
                  {result.score}
                </div>
                <div className={`inline-block px-6 py-3 rounded-full text-white font-semibold text-lg ${getActionColor(result.action)}`}>
                  Ação: {result.action}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="glass-effect p-6 rounded-xl">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <Monitor className="h-6 w-6 mr-2 text-blue-400" />
                    Informações Detectadas
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Email:</span>
                      <span className="text-white font-mono">{result.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">IP:</span>
                      <span className="text-white font-mono">{result.userInfo.ipAddress}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Timezone:</span>
                      <span className="text-white">{result.userInfo.timezone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Plataforma:</span>
                      <span className="text-white">{result.userInfo.platform}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Idioma:</span>
                      <span className="text-white">{result.userInfo.language}</span>
                    </div>
                  </div>
                </div>

                <div className="glass-effect p-6 rounded-xl">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <Shield className="h-6 w-6 mr-2 text-blue-400" />
                    Fatores Analisados
                  </h3>
                  <div className="space-y-3">
                    {result.reasons && result.reasons.length > 0 ? (
                      result.reasons.map((reason, index) => (
                        <div key={index} className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                          <span className="text-gray-300">{reason}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400">Nenhuma razão específica fornecida.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="glass-effect p-6 rounded-xl">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Globe className="h-6 w-6 mr-2 text-blue-400" />
                  User Agent Detectado
                </h3>
                <p className="text-gray-300 font-mono text-sm break-all">
                  {result.userInfo.userAgent}
                </p>
              </div>

              <div className="text-center text-gray-400 text-sm">
                Análise realizada em: {new Date(result.timestamp).toLocaleString('pt-BR')}
              </div>
            </motion.div>
          )}

          {!result && !isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="glass-effect p-8 rounded-2xl"
            >
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Ações Baseadas no Score Final
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 score-card rounded-lg">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <CheckCircle className="h-8 w-8 text-green-400" />
                    <h3 className="text-lg font-semibold text-white">Allow</h3>
                  </div>
                  <p className="text-2xl font-bold text-green-400 mb-2">0 - 30</p>
                  <p className="text-gray-400 text-sm">
                    Risco baixo. Acesso liberado automaticamente.
                  </p>
                </div>
                <div className="text-center p-4 score-card rounded-lg">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <AlertTriangle className="h-8 w-8 text-yellow-400" />
                    <h3 className="text-lg font-semibold text-white">Review</h3>
                  </div>
                  <p className="text-2xl font-bold text-yellow-400 mb-2">31 - 75</p>
                  <p className="text-gray-400 text-sm">
                    Risco médio. Requer revisão manual ou verificação adicional.
                  </p>
                </div>
                <div className="text-center p-4 score-card rounded-lg">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <XCircle className="h-8 w-8 text-red-400" />
                    <h3 className="text-lg font-semibold text-white">Deny</h3>
                  </div>
                   <p className="text-2xl font-bold text-red-400 mb-2">76 - 100</p>
                  <p className="text-gray-400 text-sm">
                    Risco alto. Acesso bloqueado para prevenir fraudes.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default AnalyzePage;