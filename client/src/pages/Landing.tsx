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
  Layers,
  X
} from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">LVL UP Performance</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
              <Button 
                onClick={() => window.location.href = '/api/login'} 
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => window.location.href = '/employees'} 
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-8">
              Protect Your Team's Performance
              <br />
              <span className="text-blue-600">with AI-Powered HR Intelligence</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
              LVL UP Performance safeguards your workforce with real-time performance monitoring, 
              360-degree feedback systems, and advanced threat detection for disengaged employees.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
                onClick={() => window.location.href = '/employees'}
              >
                Start Free 14-Day Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg"
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>
            
            <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                No credit card required
              </div>
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-2 text-blue-500" />
                Enterprise-grade security
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2 text-purple-500" />
                24/7 expert support
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Your Team's Performance is Under Attack
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Every day without proper performance management, your organization loses talent, 
              productivity, and competitive advantage. Don't let these threats destroy your team.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white p-8 text-center border border-gray-200 shadow-sm">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-red-600 transform rotate-180" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">73%</h3>
              <p className="text-lg font-semibold text-gray-900 mb-2">Disengaged Employees</p>
              <p className="text-gray-600">Lack of feedback and recognition leads to decreased motivation and productivity</p>
            </Card>
            
            <Card className="bg-white p-8 text-center border border-gray-200 shadow-sm">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">5.4 Hours</h3>
              <p className="text-lg font-semibold text-gray-900 mb-2">Wasted Weekly</p>
              <p className="text-gray-600">Manual performance tracking processes drain valuable management time</p>
            </Card>
            
            <Card className="bg-white p-8 text-center border border-gray-200 shadow-sm">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">$15,000</h3>
              <p className="text-lg font-semibold text-gray-900 mb-2">Replacement Cost</p>
              <p className="text-gray-600">Average cost to replace each employee who leaves due to poor management</p>
            </Card>
          </div>
        </div>
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

      {/* Features Section */}
      <section className="bg-white py-20" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Comprehensive Performance Protection
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Advanced threat detection and monitoring tools designed to protect your team's performance
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-white p-8 border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Real-time Performance Monitoring</h3>
              <p className="text-gray-600">Monitor employee engagement and productivity in real-time with advanced analytics and alerts</p>
            </Card>
            
            <Card className="bg-white p-8 border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Goal Tracking & Management</h3>
              <p className="text-gray-600">Set, track, and achieve goals with intelligent milestone management and progress tracking</p>
            </Card>
            
            <Card className="bg-white p-8 border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">AI-Powered Insights</h3>
              <p className="text-gray-600">Advanced behavioral intelligence to identify performance patterns and predict outcomes</p>
            </Card>
            
            <Card className="bg-white p-8 border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
                <MessageSquare className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">360° Feedback System</h3>
              <p className="text-gray-600">Comprehensive feedback collection from all stakeholders with anonymous reporting options</p>
            </Card>
            
            <Card className="bg-white p-8 border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Advanced Analytics</h3>
              <p className="text-gray-600">Detailed performance analytics and reporting with customizable dashboards</p>
            </Card>
            
            <Card className="bg-white p-8 border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Team Collaboration</h3>
              <p className="text-gray-600">Enhanced team collaboration tools with peer recognition and cross-functional feedback</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-gray-50 py-20" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Choose Your Protection Plan
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start your free trial today. No credit card required. Cancel anytime.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* MJ Scott */}
            <Card className="bg-white border border-gray-200 shadow-sm p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">MJ Scott</h3>
                <Badge className="bg-blue-100 text-blue-800">Entry</Badge>
              </div>
              <div className="mb-6">
                <div className="text-4xl font-bold text-gray-900 mb-2">$9.99</div>
                <div className="text-gray-600">/month • Up to 5 employees</div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" />Basic performance reviews</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" />Simple goal tracking</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" />Email notifications</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" />Basic reporting</li>
              </ul>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => window.location.href = '/employees'}>Start Free Trial</Button>
            </Card>

            {/* Forming */}
            <Card className="bg-white border-2 border-blue-200 shadow-lg p-8 relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Badge className="bg-blue-600 text-white px-4 py-1">Most Popular</Badge>
              </div>
              <div className="flex items-center justify-between mb-6 mt-4">
                <h3 className="text-2xl font-bold text-gray-900">Forming</h3>
                <Badge className="bg-green-100 text-green-800">Best Value</Badge>
              </div>
              <div className="mb-6">
                <div className="text-4xl font-bold text-gray-900 mb-2">$24.99</div>
                <div className="text-gray-600">/month • Up to 25 employees</div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" />Comprehensive reviews</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" />360-degree feedback</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" />Team analytics</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" />SMS notifications</li>
              </ul>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => window.location.href = '/employees'}>Start Free Trial</Button>
            </Card>

            {/* Storming */}
            <Card className="bg-white border border-gray-200 shadow-sm p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Storming</h3>
                <Badge className="bg-purple-100 text-purple-800">Professional</Badge>
              </div>
              <div className="mb-6">
                <div className="text-4xl font-bold text-gray-900 mb-2">$49.99</div>
                <div className="text-gray-600">/month • Up to 100 employees</div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" />Department management</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" />Advanced reporting</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" />API access</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" />Priority support</li>
              </ul>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => window.location.href = '/employees'}>Start Free Trial</Button>
            </Card>

            {/* Norming */}
            <Card className="bg-white border border-gray-200 shadow-sm p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Norming</h3>
                <Badge className="bg-orange-100 text-orange-800">AI Powered</Badge>
              </div>
              <div className="mb-6">
                <div className="text-4xl font-bold text-gray-900 mb-2">$99.99</div>
                <div className="text-gray-600">/month • Up to 500 employees</div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" />AI behavioral insights</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" />Custom workflows</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" />White-label options</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" />Account manager</li>
              </ul>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => window.location.href = '/employees'}>Start Free Trial</Button>
            </Card>

            {/* Performing */}
            <Card className="bg-white border border-gray-200 shadow-sm p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Performing</h3>
                <Badge className="bg-red-100 text-red-800">Enterprise</Badge>
              </div>
              <div className="mb-6">
                <div className="text-4xl font-bold text-gray-900 mb-2">$199.99</div>
                <div className="text-gray-600">/month • Unlimited employees</div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" />Enterprise integrations</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" />Advanced security</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" />Dedicated infrastructure</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" />Dedicated support</li>
              </ul>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => window.location.href = '/employees'}>Start Free Trial</Button>
            </Card>

            {/* AppSumo */}
            <Card className="bg-white border border-gray-200 shadow-sm p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">AppSumo</h3>
                <Badge className="bg-yellow-100 text-yellow-800">Lifetime</Badge>
              </div>
              <div className="mb-6">
                <div className="text-4xl font-bold text-gray-900 mb-2">$199</div>
                <div className="text-gray-600">one-time • Limited features</div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" />Lifetime access</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" />Core features</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" />Team collaboration</li>
                <li className="flex items-center"><X className="w-5 h-5 text-red-500 mr-3" />No AI insights</li>
              </ul>
              <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white" onClick={() => window.location.href = '/api/login'}>Get Lifetime Deal</Button>
            </Card>
          </div>
          
          <div className="text-center mt-16">
            <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
              All plans include a 14-day free trial. No credit card required. 
              Cancel anytime with no questions asked.
            </p>
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-12 py-4"
              onClick={() => window.location.href = '/api/login'}
            >
              Start Your Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Protect Your Team's Performance?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of organizations already protecting their workforce with LVL UP Performance
          </p>
          <Button 
            size="lg" 
            className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4"
            onClick={() => window.location.href = '/api/login'}
          >
            Start Free Trial - No Credit Card Required
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="text-blue-100 text-sm mt-4">Setup takes less than 5 minutes</p>
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
