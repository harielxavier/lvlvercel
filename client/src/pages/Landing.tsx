import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Users, Target, Star, ArrowRight, CheckCircle } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="glass-morphism border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <div>
                <h1 className="font-bold text-xl gradient-text">LVL UP</h1>
                <p className="text-xs text-muted-foreground">Performance</p>
              </div>
            </div>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              data-testid="button-login"
            >
              Sign In
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <Badge className="mb-6 bg-blue-100 text-blue-800 hover:bg-blue-200" data-testid="badge-hero">
            🚀 Next-Generation HR Platform
          </Badge>
          <h1 className="text-5xl font-bold mb-6 gradient-text max-w-4xl mx-auto leading-tight">
            Revolutionary HR Performance & Feedback System
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Make every employee a feedback node in a living, breathing performance ecosystem. 
            Collect feedback as easily as sharing a link.
          </p>
          <Button 
            size="lg" 
            onClick={() => window.location.href = '/api/login'}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-lg px-8 py-4"
            data-testid="button-get-started"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="glass-card border-0" data-testid="card-universal-feedback">
              <CardHeader>
                <Target className="w-10 h-10 text-blue-600 mb-4" />
                <CardTitle className="text-lg">Universal Feedback Links</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Every employee gets a personalized feedback collection system with QR codes, 
                  custom URLs, and email signature integration.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="glass-card border-0" data-testid="card-real-time">
              <CardHeader>
                <BarChart3 className="w-10 h-10 text-green-600 mb-4" />
                <CardTitle className="text-lg">Real-Time Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Live performance tracking, sentiment analysis, and predictive insights 
                  that make traditional annual reviews obsolete.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="glass-card border-0" data-testid="card-multi-tenant">
              <CardHeader>
                <Users className="w-10 h-10 text-purple-600 mb-4" />
                <CardTitle className="text-lg">Multi-Tenant Architecture</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Sophisticated role-based access control with seamless tenant isolation 
                  for organizations of any size.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="glass-card border-0" data-testid="card-ai-powered">
              <CardHeader>
                <Star className="w-10 h-10 text-orange-600 mb-4" />
                <CardTitle className="text-lg">AI-Powered Intelligence</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Smart notifications, predictive coaching, and automated insights 
                  that help managers support their teams proactively.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-16 bg-white/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Choose Your Performance Tier</h2>
            <p className="text-muted-foreground">Scalable pricing for teams of every size</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="glass-card border-0 relative" data-testid="card-forming-tier">
              <CardHeader>
                <Badge className="w-fit mb-2 bg-green-100 text-green-800">Most Popular</Badge>
                <CardTitle className="text-2xl">Forming</CardTitle>
                <div className="text-3xl font-bold">
                  $5<span className="text-lg font-normal text-muted-foreground">/month</span>
                </div>
                <CardDescription>Perfect for small teams starting their performance journey</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span>Core Performance Management</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span>360° Feedback</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span>Goal Tracking</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span>QR Code Feedback</span>
                  </li>
                </ul>
                <Button className="w-full mt-6" data-testid="button-choose-forming">
                  Choose Forming
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-card border-0" data-testid="card-storming-tier">
              <CardHeader>
                <CardTitle className="text-2xl">Storming</CardTitle>
                <div className="text-3xl font-bold">
                  $10<span className="text-lg font-normal text-muted-foreground">/month</span>
                </div>
                <CardDescription>Growing companies with structured processes</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span>Everything in Forming</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span>Advanced Performance Reviews</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span>Team Collaboration Tools</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span>Priority Support</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full mt-6" data-testid="button-choose-storming">
                  Choose Storming
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-card border-0" data-testid="card-performing-tier">
              <CardHeader>
                <Badge className="w-fit mb-2 bg-purple-100 text-purple-800">Enterprise</Badge>
                <CardTitle className="text-2xl">Performing</CardTitle>
                <div className="text-3xl font-bold">
                  $20<span className="text-lg font-normal text-muted-foreground">/month</span>
                </div>
                <CardDescription>Large enterprises with advanced requirements</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span>Full Enterprise Suite</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span>Custom Integrations</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span>White-label Options</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span>Premium Support</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full mt-6" data-testid="button-choose-performing">
                  Choose Performing
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your HR?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join the future of performance management where feedback flows naturally 
            and every employee thrives.
          </p>
          <Button 
            size="lg" 
            onClick={() => window.location.href = '/api/login'}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-lg px-8 py-4"
            data-testid="button-start-free-trial"
          >
            Start Your Free Trial
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>
    </div>
  );
}
