import Hero from "@/components/hero";
import Navbar from "@/components/navbar";
import PricingCard from "@/components/pricing-card";
import Footer from "@/components/footer";
import FeatureCard from "@/components/feature-card";
import { createClient } from "../../supabase/server";
import { ArrowUpRight, CheckCircle2, Zap, Shield, Users } from "lucide-react";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: plans, error } = await supabase.functions.invoke(
    "supabase-functions-get-plans",
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      <Hero />

      {/* Features Section */}
      <section className="py-32 relative overflow-hidden">
        {/* Enhanced background with multiple gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-blue-50/20 to-indigo-50/30 opacity-80"></div>

        {/* Decorative blurred circles */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-100/10 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-block mb-3 px-4 py-1 bg-blue-50/50 backdrop-blur-sm rounded-full text-blue-600 text-sm font-medium">
              AI-Powered Features
            </div>
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Powerful Visualization Tools
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Transform your data into actionable insights with our intuitive
              visualization platform powered by advanced AI technology.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: <Zap className="w-7 h-7" />,
                title: "Natural Language Queries",
                description:
                  "Ask questions about your data in plain English and get instant visualizations",
              },
              {
                icon: <Shield className="w-7 h-7" />,
                title: "Enterprise Security",
                description:
                  "Bank-grade encryption and compliance for all your sensitive business data",
              },
              {
                icon: <Users className="w-7 h-7" />,
                title: "Team Collaboration",
                description:
                  "Share insights and collaborate with your team in real-time across devices",
              },
              {
                icon: <CheckCircle2 className="w-7 h-7" />,
                title: "Interactive Visualizations",
                description:
                  "Explore your data with dynamic, responsive charts and customizable dashboards",
              },
            ].map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 relative overflow-hidden">
        {/* Glassmorphic background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-90"></div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&q=80')] bg-cover opacity-10 mix-blend-overlay"></div>
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-purple-500/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg"></div>
              <div className="relative p-8">
                <div className="text-5xl font-bold mb-3 text-white">10M+</div>
                <div className="text-blue-100 text-lg">
                  Data Points Analyzed
                </div>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg"></div>
              <div className="relative p-8">
                <div className="text-5xl font-bold mb-3 text-white">500+</div>
                <div className="text-blue-100 text-lg">Enterprise Clients</div>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg"></div>
              <div className="relative p-8">
                <div className="text-5xl font-bold mb-3 text-white">99.9%</div>
                <div className="text-blue-100 text-lg">Accuracy Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-32 relative overflow-hidden" id="pricing">
        {/* Subtle background */}
        <div className="absolute inset-0 bg-gradient-to-b from-white to-blue-50/30 opacity-80"></div>

        {/* Decorative elements */}
        <div className="absolute top-40 right-20 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 left-20 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-block mb-3 px-4 py-1 bg-blue-50/50 backdrop-blur-sm rounded-full text-blue-600 text-sm font-medium">
              Flexible Plans
            </div>
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Simple, Transparent Pricing
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Choose the perfect plan for your data visualization needs. No
              hidden fees or complicated pricing structures.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans?.map((item: any) => (
              <PricingCard key={item.id} item={item} user={user} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        {/* Glassmorphic background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 opacity-80"></div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&q=80')] bg-cover opacity-5"></div>
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto relative">
            {/* Glassmorphic card */}
            <div className="absolute inset-0 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/30 shadow-xl"></div>

            <div className="relative p-12 text-center">
              <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Ready to Transform Your Data?
              </h2>
              <p className="text-gray-600 mb-10 max-w-2xl mx-auto text-lg">
                Join thousands of data analysts and business leaders who are
                unlocking insights with GenBI's powerful visualization platform.
              </p>
              <a
                href="/dashboard"
                className="inline-flex items-center px-8 py-4 text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:opacity-90 transition-all text-lg font-medium shadow-lg shadow-blue-500/20"
              >
                Start Visualizing Now
                <ArrowUpRight className="ml-2 w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
