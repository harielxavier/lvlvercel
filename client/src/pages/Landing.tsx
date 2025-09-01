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
  Play
} from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">LVL UP Performance</span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition">Pricing</a>
              <a href="#testimonials" className="text-gray-600 hover:text-blue-600 transition">Reviews</a>
              <Button onClick={() => window.location.href = '/api/login'} variant="outline">Sign In</Button>
              <Button onClick={() => window.location.href = '/api/login'} className="bg-blue-600 hover:bg-blue-700">
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Guardio Style */}
      <section className="pt-20 pb-20">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-6 bg-blue-100 text-blue-700 hover:bg-blue-100">
            🚀 Trusted by 10,000+ HR professionals
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Powerful Performance Management
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              for Your Growing Team
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transform disengaged employees into high performers with our AI-powered feedback system. 
            Real-time insights, 360-degree reviews, and automated performance tracking.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4"
              onClick={() => window.location.href = '/api/login'}
            >
              Start LVL UP's 14-day free trial today
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-4">
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </div>
          
          <p className="text-sm text-gray-500 mb-12">No credit card required • Setup in 5 minutes • Cancel anytime</p>
          
          {/* Hero Image/Stats */}
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white/60 backdrop-blur-sm border border-gray-200 shadow-xl">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">89%</div>
                    <div className="text-sm text-gray-600">Productivity Increase</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">94%</div>
                    <div className="text-sm text-gray-600">Employee Satisfaction</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">67%</div>
                    <div className="text-sm text-gray-600">Faster Promotions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
                    <div className="text-sm text-gray-600">Expert Support</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Problem Section - Guardio Style */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Your Team's Performance is Under Attack
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Every day without proper performance management, your organization loses talent, 
              productivity, and competitive advantage.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-red-600 transform rotate-180" />
                </div>
                <h3 className="text-xl font-semibold text-red-900 mb-2">73% of Employees</h3>
                <p className="text-red-700">Are disengaged due to lack of feedback and recognition</p>
              </CardContent>
            </Card>
            
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-orange-900 mb-2">5.4 Hours/Week</h3>
                <p className="text-orange-700">Wasted on manual performance tracking and reviews</p>
              </CardContent>
            </Card>
            
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold text-yellow-900 mb-2">$15,000 Cost</h3>
                <p className="text-yellow-700">Average cost to replace each employee who leaves</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center">
            <p className="text-lg text-gray-600 mb-8">
              <strong>Don't let poor performance management destroy your team.</strong><br />
              LVL UP Performance provides real-time protection for your workforce.
            </p>
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => window.location.href = '/api/login'}
            >
              Protect Your Team Now
            </Button>
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

      {/* Social Proof - Guardio Style */}
      <section className="py-20 bg-gray-50" id="testimonials">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Trusted by Leading Organizations
            </h2>
            <p className="text-xl text-gray-600">
              See how LVL UP Performance transformed their teams
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="bg-white shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "LVL UP Performance increased our team productivity by 89% in just 3 months. 
                  The AI insights are incredibly accurate at identifying rising stars."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-semibold">SJ</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Sarah Johnson</div>
                    <div className="text-sm text-gray-500">VP of Engineering, TechCorp</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "Setup was incredibly easy. Within 5 minutes we had our entire team connected. 
                  The 24/7 support team responds within an hour - amazing!"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-semibold">MC</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Mike Chen</div>
                    <div className="text-sm text-gray-500">HR Director, Growth Inc</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "The behavioral intelligence feature identified 3 future leaders in our company. 
                  This platform pays for itself with better hiring and promotion decisions."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-semibold">AR</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Amanda Rodriguez</div>
                    <div className="text-sm text-gray-500">CEO, Scale Ventures</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => window.location.href = '/api/login'}
            >
              Join 10,000+ Happy Teams
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing Section - Guardio Style */}
      <section className="py-20" id="pricing">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Choose Your Performance Plan
            </h2>
            <p className="text-xl text-gray-600">
              Start with our free trial. No credit card required.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">Forming</h3>
                <div className="text-3xl font-bold mb-4">$9<span className="text-sm text-gray-500">/user/month</span></div>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-600 mr-2" />Basic feedback collection</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-600 mr-2" />Goal tracking</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-600 mr-2" />Email support</li>
                </ul>
                <Button className="w-full mt-6" variant="outline">Start Free Trial</Button>
              </CardContent>
            </Card>
            
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">Norming</h3>
                  <Badge className="bg-blue-600 text-white">Popular</Badge>
                </div>
                <div className="text-3xl font-bold mb-4">$19<span className="text-sm text-gray-500">/user/month</span></div>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-600 mr-2" />Everything in Forming</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-600 mr-2" />360° feedback system</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-600 mr-2" />AI behavioral insights</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-600 mr-2" />Advanced analytics</li>
                </ul>
                <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700">Start Free Trial</Button>
              </CardContent>
            </Card>
            
            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">Performing</h3>
                <div className="text-3xl font-bold mb-4">$29<span className="text-sm text-gray-500">/user/month</span></div>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-600 mr-2" />Everything in Norming</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-600 mr-2" />Rising star detection</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-600 mr-2" />Leadership pipeline</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-600 mr-2" />Priority support</li>
                </ul>
                <Button className="w-full mt-6 bg-purple-600 hover:bg-purple-700">Start Free Trial</Button>
              </CardContent>
            </Card>
            
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">AppSumo</h3>
                <div className="text-3xl font-bold mb-4">$199<span className="text-sm text-gray-500">/lifetime</span></div>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-600 mr-2" />Everything in Performing</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-600 mr-2" />Unlimited users</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-600 mr-2" />White-label options</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-600 mr-2" />24/7 dedicated support</li>
                </ul>
                <Button className="w-full mt-6 bg-yellow-600 hover:bg-yellow-700">Start Free Trial</Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">All plans include 14-day free trial • No credit card required • Cancel anytime</p>
            <p className="text-sm text-gray-500">24/7 expert support responds within 1 hour</p>
          </div>
        </div>
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
