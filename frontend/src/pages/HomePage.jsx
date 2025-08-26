
import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Zap, Eye, Lock, TrendingUp, Users, Globe, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HomePage = () => {
  const features = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Análise em Tempo Real',
      description: 'Avaliação instantânea de risco baseada em múltiplos fatores comportamentais e técnicos.'
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: 'Decisões Automatizadas',
      description: 'Sistema inteligente que classifica automaticamente como ALLOW, REVIEW ou DENY.'
    },
    {
      icon: <Eye className="h-8 w-8" />,
      title: 'Monitoramento Contínuo',
      description: 'Acompanhamento 24/7 de atividades suspeitas e padrões de comportamento.'
    },
    {
      icon: <Lock className="h-8 w-8" />,
      title: 'Segurança Avançada',
      description: 'Proteção multicamadas contra fraudes e atividades maliciosas.'
    }
  ];

  const stats = [
    { number: '99.9%', label: 'Precisão na Detecção' },
    { number: '<50ms', label: 'Tempo de Resposta' },
    { number: '24/7', label: 'Monitoramento' },
    { number: '100+', label: 'Fatores Analisados' }
  ];

  const benefits = [
    'Redução de até 95% em fraudes',
    'Melhoria na experiência do usuário',
    'Integração simples via API',
    'Relatórios detalhados em tempo real',
    'Suporte técnico especializado',
    'Conformidade com LGPD e GDPR'
  ];

  return (
    <>
      <Helmet>
        <title>Score Trust - Análise de Risco em Tempo Real para E-commerce</title>
        <meta name="description" content="Solução serverless de análise de risco em tempo real para e-commerces. Detecte fraudes instantaneamente com nossa tecnologia avançada de machine learning." />
        <meta property="og:title" content="Score Trust - Análise de Risco em Tempo Real para E-commerce" />
        <meta property="og:description" content="Solução serverless de análise de risco em tempo real para e-commerces. Detecte fraudes instantaneamente com nossa tecnologia avançada de machine learning." />
      </Helmet>

      <div className="pt-16">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 cyber-grid opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="floating-animation">
                <Shield className="h-24 w-24 mx-auto text-blue-400 neon-glow" />
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold gradient-text">
                Score Trust
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                Solução <span className="text-blue-400 font-semibold">serverless</span> de análise de risco em tempo real para e-commerces. 
                Detecte fraudes instantaneamente e proteja seu negócio com nossa tecnologia avançada.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link to="/analyze">
                  <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 text-lg neon-glow">
                    Testar Agora
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="outline" size="lg" className="border-blue-400 text-blue-400 hover:bg-blue-400/10 px-8 py-4 text-lg">
                    Ver Dashboard
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-black/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-400 text-sm md:text-base">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
                Recursos Avançados
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Nossa plataforma utiliza inteligência artificial e machine learning para fornecer 
                análises precisas e decisões automatizadas em tempo real.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="glass-effect p-6 rounded-xl hover:bg-white/10 transition-all duration-300 group"
                >
                  <div className="text-blue-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="py-20 bg-black/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
                Como Funciona
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Processo simples e eficiente para análise de risco em tempo real
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 neon-glow">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">Coleta de Dados</h3>
                <p className="text-gray-400">
                  Capturamos informações do usuário como IP, dispositivo, localização e comportamento de navegação.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 neon-glow">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">Análise IA</h3>
                <p className="text-gray-400">
                  Nossa inteligência artificial analisa mais de 100 fatores para calcular o score de risco em milissegundos.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 neon-glow">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">Decisão Automática</h3>
                <p className="text-gray-400">
                  Sistema retorna automaticamente ALLOW, REVIEW ou DENY baseado no score calculado.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
                  Benefícios para seu E-commerce
                </h2>
                <p className="text-xl text-gray-300 mb-8">
                  Proteja seu negócio e melhore a experiência dos seus clientes com nossa solução avançada de detecção de fraudes.
                </p>
                
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="flex items-center space-x-3"
                    >
                      <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">{benefit}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <div className="glass-effect p-8 rounded-2xl">
                  <img  
                    alt="Dashboard de análise de risco mostrando gráficos e estatísticas em tempo real"
                    className="w-full h-64 object-cover rounded-lg mb-6"
                   src="https://images.unsplash.com/photo-1598737129494-69cb30f96a73" />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="score-card p-4 rounded-lg text-center">
                      <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">95%</div>
                      <div className="text-sm text-gray-400">Redução Fraudes</div>
                    </div>
                    <div className="score-card p-4 rounded-lg text-center">
                      <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">50ms</div>
                      <div className="text-sm text-gray-400">Tempo Resposta</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <h2 className="text-4xl md:text-5xl font-bold gradient-text">
                Pronto para Proteger seu E-commerce?
              </h2>
              <p className="text-xl text-gray-300">
                Comece a usar nossa solução de análise de risco hoje mesmo e veja a diferença em tempo real.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/analyze">
                  <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 text-lg neon-glow">
                    Testar Gratuitamente
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="outline" size="lg" className="border-blue-400 text-blue-400 hover:bg-blue-400/10 px-8 py-4 text-lg">
                    Ver Demonstração
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default HomePage;
