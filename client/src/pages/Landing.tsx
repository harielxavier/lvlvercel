import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Users, 
  Target, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Star,
  BarChart3,
  MessageSquare,
  Brain,
  Award,
  Zap,
  ArrowRight,
  Play,
  Sparkles,
  Crown,
  Infinity,
  Rocket,
  Eye,
  Layers
} from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-conic from-transparent via-purple-500/10 to-transparent rounded-full animate-spin-slow"></div>
      </div>

      {/* Header */}
      <header className="relative z-50 border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative group">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">LVL UP Performance</h1>
                <p className="text-xs text-gray-400">Next-Gen HR Platform</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105">Features</a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105">Pricing</a>
              <a href="#testimonials" className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105">Reviews</a>
              <Button 
                onClick={() => window.location.href = '/api/login'} 
                variant="outline" 
                className="border-white/20 text-white hover:bg-white/10 backdrop-blur-sm"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => window.location.href = '/api/login'} 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105"
              >
                Start Free Trial
                <Sparkles className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Ultra Modern */}
      <section className="relative pt-32 pb-32">
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="flex items-center justify-center mb-8">
            <Badge className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border-white/20 backdrop-blur-sm px-6 py-2 text-sm animate-pulse">
              <Rocket className="w-4 h-4 mr-2" />
              Trusted by 50,000+ HR professionals worldwide
            </Badge>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tight">
            <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
              Revolutionary
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
              HR Performance
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Intelligence
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Transform every employee into a <span className="text-blue-400 font-semibold">high performer</span> with our 
            <span className="text-purple-400 font-semibold"> AI-powered</span> performance ecosystem. 
            Real-time insights that make traditional reviews obsolete.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-16">
            <Button 
              size="lg" 
              className="group bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-700 hover:via-purple-700 hover:to-blue-700 text-white text-lg px-12 py-6 rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 hover:scale-105 animate-pulse"
              onClick={() => window.location.href = '/api/login'}
            >
              <Sparkles className="w-6 h-6 mr-3 group-hover:animate-spin" />
              Start Your 14-Day Revolution
              <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-white border-white/30 hover:bg-white/10 backdrop-blur-sm text-lg px-12 py-6 rounded-2xl group transition-all duration-300 hover:scale-105"
            >
              <Play className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
              Watch AI in Action
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-8 text-sm text-gray-400 mb-16">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
              No credit card required
            </div>
            <div className="flex items-center">
              <Zap className="w-5 h-5 mr-2 text-yellow-400" />
              5-minute setup
            </div>
            <div className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-blue-400" />
              Enterprise security
            </div>
          </div>
          
          {/* Floating Stats Cards */}
          <div className="relative max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Card className="bg-black/20 backdrop-blur-xl border border-white/10 p-6 rounded-2xl hover:bg-black/30 transition-all duration-300 hover:scale-105 group">
                <div className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">89%</div>
                  <div className="text-sm text-gray-300">Productivity Boost</div>
                </div>
              </Card>
              <Card className="bg-black/20 backdrop-blur-xl border border-white/10 p-6 rounded-2xl hover:bg-black/30 transition-all duration-300 hover:scale-105 group">
                <div className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">94%</div>
                  <div className="text-sm text-gray-300">Employee Satisfaction</div>
                </div>
              </Card>
              <Card className="bg-black/20 backdrop-blur-xl border border-white/10 p-6 rounded-2xl hover:bg-black/30 transition-all duration-300 hover:scale-105 group">
                <div className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">3x</div>
                  <div className="text-sm text-gray-300">Faster Promotions</div>
                </div>
              </Card>
              <Card className="bg-black/20 backdrop-blur-xl border border-white/10 p-6 rounded-2xl hover:bg-black/30 transition-all duration-300 hover:scale-105 group">
                <div className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">24/7</div>
                  <div className="text-sm text-gray-300">AI-Powered Support</div>
                </div>
              </Card>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-1/4 left-10 w-20 h-20 bg-blue-500/10 rounded-full animate-bounce delay-1000"></div>
        <div className="absolute bottom-1/4 right-10 w-16 h-16 bg-purple-500/10 rounded-full animate-bounce delay-2000"></div>
        <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-cyan-500/10 rounded-full animate-pulse delay-500"></div>
      </section>

      {/* Problem Section - Ultra Modern */}
      <section className="relative py-32 bg-gradient-to-b from-slate-900 to-black">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black mb-8 leading-tight">
              <span className="bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
                Performance Crisis
              </span>
              <br />
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Destroying Teams
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Every second your team operates without intelligent performance management, 
              you're hemorrhaging <span className="text-red-400 font-bold">talent</span>, 
              <span className="text-orange-400 font-bold">productivity</span>, and 
              <span className="text-yellow-400 font-bold">competitive edge</span>.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <Card className="relative group bg-gradient-to-br from-red-900/20 to-red-800/20 border border-red-500/30 backdrop-blur-xl p-8 rounded-3xl hover:scale-105 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:animate-pulse">
                  <TrendingUp className="w-10 h-10 text-white transform rotate-180" />
                </div>
                <h3 className="text-3xl font-bold text-red-300 mb-4">73%</h3>
                <p className="text-lg font-semibold text-white mb-2">Disengaged Employees</p>
                <p className="text-red-200 text-sm">Lack of feedback kills motivation and destroys productivity</p>
              </div>
            </Card>
            
            <Card className="relative group bg-gradient-to-br from-orange-900/20 to-orange-800/20 border border-orange-500/30 backdrop-blur-xl p-8 rounded-3xl hover:scale-105 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:animate-pulse">
                  <Clock className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-orange-300 mb-4">5.4 Hours</h3>
                <p className="text-lg font-semibold text-white mb-2">Wasted Weekly</p>
                <p className="text-orange-200 text-sm">Manual tracking processes drain management efficiency</p>
              </div>
            </Card>
            
            <Card className="relative group bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 border border-yellow-500/30 backdrop-blur-xl p-8 rounded-3xl hover:scale-105 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:animate-pulse">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-yellow-300 mb-4">$15,000</h3>
                <p className="text-lg font-semibold text-white mb-2">Replacement Cost</p>
                <p className="text-yellow-200 text-sm">Each talented employee you lose costs you dearly</p>
              </div>
            </Card>
          </div>
          
          <div className="text-center">
            <p className="text-2xl text-gray-200 mb-12 max-w-4xl mx-auto">
              <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent font-bold">
                Stop the bleeding.
              </span>
              <br />
              LVL UP provides <span className="text-blue-400 font-semibold">AI-powered protection</span> for your most valuable asset: your people.
            </p>
            <Button 
              size="lg" 
              className="group bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 hover:from-red-700 hover:via-orange-700 hover:to-yellow-700 text-white text-xl px-16 py-8 rounded-2xl shadow-2xl hover:shadow-red-500/25 transition-all duration-500 hover:scale-110"
              onClick={() => window.location.href = '/api/login'}
            >
              <Shield className="w-6 h-6 mr-3 group-hover:animate-pulse" />
              Stop the Performance Crisis Now
              <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
            </Button>
          </div>
        </div>
        
        {/* Floating danger elements */}
        <div className="absolute top-20 left-20 w-16 h-16 bg-red-500/20 rounded-full animate-ping"></div>
        <div className="absolute bottom-20 right-20 w-20 h-20 bg-orange-500/20 rounded-full animate-ping delay-1000"></div>
      </section>

      {/* Solution Features - Guardio Style */}
      <section className="py-20" id="features">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Complete Performance Protection
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered platform automatically detects performance issues, provides real-time insights, 
              and helps your team reach their full potential.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <div className="flex items-center mb-4">
                <Shield className="w-8 h-8 text-blue-600 mr-3" />
                <h3 className="text-2xl font-bold text-gray-900">Real-time Performance Scanning</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Our system continuously monitors team performance, instantly detecting issues before they 
                impact productivity. Get alerts about declining engagement, missed goals, and team conflicts.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <span>Automatic goal tracking and milestone alerts</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <span>Real-time feedback collection via QR codes</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <span>Instant performance issue detection</span>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-8 rounded-2xl">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-500">Performance Alert</span>
                  <Badge className="bg-red-100 text-red-700">Urgent</Badge>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Sarah Johnson - Engineering</h4>
                <p className="text-sm text-gray-600 mb-4">Goal completion rate dropped to 67% this month</p>
                <Button size="sm" className="w-full">Schedule 1:1 Meeting</Button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
            <div className="bg-gradient-to-br from-green-100 to-blue-100 p-8 rounded-2xl">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <Brain className="w-8 h-8 text-purple-600" />
                  <Badge className="bg-purple-100 text-purple-700">AI Insights</Badge>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Rising Star Detected</h4>
                <p className="text-sm text-gray-600 mb-4">Mike Chen shows strong leadership potential based on collaboration patterns</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Leadership Score</span>
                    <span className="text-xs font-medium">94%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{width: '94%'}}></div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center mb-4">
                <Brain className="w-8 h-8 text-purple-600 mr-3" />
                <h3 className="text-2xl font-bold text-gray-900">AI-Powered Behavioral Intelligence</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Advanced machine learning identifies rising stars, collaboration patterns, and potential 
                issues before they become problems. Available for premium tier members.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <span>Automatic rising star identification</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <span>Collaboration intelligence scoring</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <span>Leadership pipeline development</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-6 text-center">
                <MessageSquare className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-blue-900 mb-2">360° Feedback System</h3>
                <p className="text-blue-700 text-sm">Collect feedback from peers, managers, and direct reports automatically</p>
              </CardContent>
            </Card>
            
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6 text-center">
                <Target className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-900 mb-2">Smart Goal Tracking</h3>
                <p className="text-green-700 text-sm">AI-powered goal setting with milestone tracking and progress alerts</p>
              </CardContent>
            </Card>
            
            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-6 text-center">
                <BarChart3 className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-purple-900 mb-2">Advanced Analytics</h3>
                <p className="text-purple-700 text-sm">Real-time dashboards with predictive insights and trend analysis</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Ultra Modern */}
      <section className="relative py-32 bg-gradient-to-br from-black via-slate-900 to-purple-900" id="testimonials">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-6xl font-black mb-8">
              <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                Legendary Results
              </span>
              <br />
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                From Real Leaders
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Join thousands of industry pioneers who've revolutionized their performance culture
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            <Card className="group relative bg-gradient-to-br from-blue-900/30 to-blue-800/30 border border-blue-500/30 backdrop-blur-xl p-8 rounded-3xl hover:scale-105 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-yellow-400 fill-current mr-1" />
                  ))}
                </div>
                <p className="text-lg text-blue-100 mb-8 leading-relaxed font-medium">
                  "LVL UP Performance is pure magic. Our engagement scores exploded by <span className="text-yellow-400 font-bold">89%</span> in 4 months. 
                  This isn't just software—it's a performance revolution."
                </p>
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-lg">SK</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white">Sarah Kim</h4>
                    <p className="text-blue-300">Chief People Officer, TechNova</p>
                    <p className="text-blue-400 text-sm">50,000+ employees</p>
                  </div>
                </div>
              </div>
            </Card>
            
            <Card className="group relative bg-gradient-to-br from-green-900/30 to-emerald-800/30 border border-green-500/30 backdrop-blur-xl p-8 rounded-3xl hover:scale-105 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-yellow-400 fill-current mr-1" />
                  ))}
                </div>
                <p className="text-lg text-green-100 mb-8 leading-relaxed font-medium">
                  "The AI insights are absolutely mind-blowing. We're identifying future leaders <span className="text-yellow-400 font-bold">6 months</span> before 
                  anyone else notices. It's like having a crystal ball."
                </p>
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-lg">MJ</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white">Michael Johnson</h4>
                    <p className="text-green-300">CEO & Founder, InnovateCorp</p>
                    <p className="text-green-400 text-sm">Series C Unicorn</p>
                  </div>
                </div>
              </div>
            </Card>
            
            <Card className="group relative bg-gradient-to-br from-purple-900/30 to-pink-800/30 border border-purple-500/30 backdrop-blur-xl p-8 rounded-3xl hover:scale-105 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-yellow-400 fill-current mr-1" />
                  ))}
                </div>
                <p className="text-lg text-purple-100 mb-8 leading-relaxed font-medium">
                  "Setup took <span className="text-yellow-400 font-bold">3 minutes</span>. Results were instant. 
                  Our productivity metrics hit records we didn't think were possible. Game-changing."
                </p>
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-lg">AL</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white">Anna Lee</h4>
                    <p className="text-purple-300">VP of Operations, HyperScale</p>
                    <p className="text-purple-400 text-sm">Fortune 500</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
          
          <div className="text-center">
            <Button 
              size="lg" 
              className="group bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 hover:from-yellow-700 hover:via-orange-700 hover:to-red-700 text-white text-xl px-16 py-8 rounded-2xl shadow-2xl hover:shadow-yellow-500/25 transition-all duration-500 hover:scale-110"
              onClick={() => window.location.href = '/api/login'}
            >
              <Sparkles className="w-6 h-6 mr-3 group-hover:animate-spin" />
              Join 50,000+ Revolutionary Teams
              <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
            </Button>
          </div>
        </div>
        
        {/* Testimonial floating elements */}
        <div className="absolute top-32 left-32 w-8 h-8 bg-yellow-500/30 rounded-full animate-pulse"></div>
        <div className="absolute bottom-32 right-32 w-12 h-12 bg-green-500/30 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-20 w-6 h-6 bg-purple-500/30 rounded-full animate-ping delay-500"></div>
      </section>

      {/* Pricing Section - Ultra Modern with Correct Pricing */}
      <section className="relative py-32 bg-gradient-to-br from-black via-slate-900 to-purple-900" id="pricing">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black mb-8">
              <span className="bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Choose Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Performance Tier
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Start your 14-day revolution. No credit card required. Scale with confidence.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-6 gap-6 max-w-7xl mx-auto mb-16">
            {/* MJ Scott */}
            <Card className="relative group bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-600/30 backdrop-blur-xl p-6 rounded-3xl hover:scale-105 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <Crown className="w-8 h-8 text-slate-400" />
                  <Badge className="bg-slate-700 text-slate-200 text-xs">VIP</Badge>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">MJ Scott</h3>
                <div className="mb-6">
                  <div className="text-3xl font-black text-slate-300 mb-1">$9.99</div>
                  <div className="text-sm text-slate-400">/month • Up to 5 employees</div>
                </div>
                <ul className="space-y-3 text-sm text-slate-300 mb-8">
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />Basic performance reviews</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />Simple goal tracking</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />Email notifications</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />Basic reporting</li>
                </ul>
                <Button className="w-full bg-slate-700 hover:bg-slate-600 text-white" onClick={() => window.location.href = '/api/login'}>Start Free Trial</Button>
              </div>
            </Card>

            {/* Forming */}
            <Card className="relative group bg-gradient-to-br from-blue-800/50 to-blue-900/50 border border-blue-500/30 backdrop-blur-xl p-6 rounded-3xl hover:scale-105 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <Target className="w-8 h-8 text-blue-400" />
                  <Badge className="bg-blue-600 text-white text-xs">Growing</Badge>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Forming</h3>
                <div className="mb-6">
                  <div className="text-3xl font-black text-blue-300 mb-1">$24.99</div>
                  <div className="text-sm text-blue-200">/month • Up to 25 employees</div>
                </div>
                <ul className="space-y-3 text-sm text-blue-100 mb-8">
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />Comprehensive reviews</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />360-degree feedback</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />Team analytics</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />SMS notifications</li>
                </ul>
                <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white" onClick={() => window.location.href = '/api/login'}>Start Free Trial</Button>
              </div>
            </Card>

            {/* Storming */}
            <Card className="relative group bg-gradient-to-br from-purple-800/50 to-purple-900/50 border border-purple-500/30 backdrop-blur-xl p-6 rounded-3xl hover:scale-105 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <Layers className="w-8 h-8 text-purple-400" />
                  <Badge className="bg-purple-600 text-white text-xs">Popular</Badge>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Storming</h3>
                <div className="mb-6">
                  <div className="text-3xl font-black text-purple-300 mb-1">$49.99</div>
                  <div className="text-sm text-purple-200">/month • Up to 100 employees</div>
                </div>
                <ul className="space-y-3 text-sm text-purple-100 mb-8">
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />Department management</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />Advanced reporting</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />API access</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />Priority support</li>
                </ul>
                <Button className="w-full bg-purple-600 hover:bg-purple-500 text-white" onClick={() => window.location.href = '/api/login'}>Start Free Trial</Button>
              </div>
            </Card>

            {/* Norming */}
            <Card className="relative group bg-gradient-to-br from-green-800/50 to-emerald-900/50 border border-green-500/30 backdrop-blur-xl p-6 rounded-3xl hover:scale-105 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <Brain className="w-8 h-8 text-green-400" />
                  <Badge className="bg-green-600 text-white text-xs">AI</Badge>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Norming</h3>
                <div className="mb-6">
                  <div className="text-3xl font-black text-green-300 mb-1">$99.99</div>
                  <div className="text-sm text-green-200">/month • Up to 500 employees</div>
                </div>
                <ul className="space-y-3 text-sm text-green-100 mb-8">
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />AI behavioral insights</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />Custom workflows</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />White-label options</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />Account manager</li>
                </ul>
                <Button className="w-full bg-green-600 hover:bg-green-500 text-white" onClick={() => window.location.href = '/api/login'}>Start Free Trial</Button>
              </div>
            </Card>

            {/* Performing */}
            <Card className="relative group bg-gradient-to-br from-orange-800/50 to-red-900/50 border border-orange-500/30 backdrop-blur-xl p-6 rounded-3xl hover:scale-105 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <Rocket className="w-8 h-8 text-orange-400" />
                  <Badge className="bg-orange-600 text-white text-xs">Enterprise</Badge>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Performing</h3>
                <div className="mb-6">
                  <div className="text-3xl font-black text-orange-300 mb-1">$199.99</div>
                  <div className="text-sm text-orange-200">/month • Unlimited employees</div>
                </div>
                <ul className="space-y-3 text-sm text-orange-100 mb-8">
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />Enterprise integrations</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />Advanced security</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />Dedicated infrastructure</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />Dedicated support</li>
                </ul>
                <Button className="w-full bg-orange-600 hover:bg-orange-500 text-white" onClick={() => window.location.href = '/api/login'}>Start Free Trial</Button>
              </div>
            </Card>

            {/* AppSumo */}
            <Card className="relative group bg-gradient-to-br from-yellow-800/50 to-amber-900/50 border border-yellow-500/30 backdrop-blur-xl p-6 rounded-3xl hover:scale-105 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <Infinity className="w-8 h-8 text-yellow-400" />
                  <Badge className="bg-yellow-600 text-black text-xs font-bold">Lifetime</Badge>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">AppSumo</h3>
                <div className="mb-6">
                  <div className="text-3xl font-black text-yellow-300 mb-1">$199</div>
                  <div className="text-sm text-yellow-200">one-time • Unlimited employees</div>
                </div>
                <ul className="space-y-3 text-sm text-yellow-100 mb-8">
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />Lifetime access</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />Core features</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />Team collaboration</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />Email support</li>
                </ul>
                <Button className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold" onClick={() => window.location.href = '/api/login'}>Get Lifetime Deal</Button>
              </div>
            </Card>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center gap-8 p-6 bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl mb-8">
              <div className="flex items-center text-green-400">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span className="text-sm">14-day free trial</span>
              </div>
              <div className="flex items-center text-blue-400">
                <Shield className="w-5 h-5 mr-2" />
                <span className="text-sm">No credit card required</span>
              </div>
              <div className="flex items-center text-purple-400">
                <Zap className="w-5 h-5 mr-2" />
                <span className="text-sm">Cancel anytime</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm">All plans include AI-powered insights • 24/7 expert support • Enterprise security</p>
          </div>
        </div>
        
        {/* Pricing floating elements */}
        <div className="absolute top-20 left-20 w-24 h-24 bg-green-500/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-purple-500/10 rounded-full animate-pulse delay-1000"></div>
      </section>

      {/* Final CTA - Guardio Style */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Team's Performance?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of organizations already using LVL UP Performance
          </p>
          <Button 
            size="lg" 
            className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4"
            onClick={() => window.location.href = '/api/login'}
          >
            Start Your Free Trial Now
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="text-sm mt-4 opacity-75">Setup takes less than 5 minutes</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">LVL UP Performance</span>
              </div>
              <p className="text-gray-400 text-sm">
                Transform your team's performance with AI-powered insights and real-time feedback.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Demo</a></li>
                <li><a href="#" className="hover:text-white transition">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition">Status</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            © 2025 LVL UP Performance. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
