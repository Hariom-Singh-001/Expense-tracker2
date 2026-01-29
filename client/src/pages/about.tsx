import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowLeft, Code, Database, Layout, Server, Sparkles, Target, Users, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function About() {
  // Animation variants for smooth entry
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const developers = [
    { name: "Hariom Singh", role: "Full Stack Developer" },
    { name: "Rabbi Rasspreet Kaur", role: "Frontend Developer" },
    { name: "Priyanshu Sharma", role: "Backend Developer" }
  ];

  return (
    <div className="min-h-screen bg-background p-6 md:p-12 flex items-center justify-center">
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full max-w-4xl"
      >
        <Card className="shadow-2xl border-primary/20">
          <CardHeader className="text-center border-b pb-8 bg-primary/5">
            <motion.div variants={item}>
              <CardTitle className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-purple-500 to-blue-600 bg-clip-text text-transparent pb-2">
                About Expense Tracker
              </CardTitle>
              <p className="text-muted-foreground text-lg mt-2 max-w-2xl mx-auto">
                Empowering your financial journey with AI-driven insights and effortless tracking.
              </p>
            </motion.div>
          </CardHeader>

          <CardContent className="space-y-10 pt-8 p-6 md:p-10">
            
            {/* GOAL SECTION */}
            <motion.section variants={item} className="grid md:grid-cols-[1fr_2fr] gap-6 items-start">
              <div className="flex items-center gap-3 text-primary">
                <Target className="w-8 h-8" />
                <h2 className="text-2xl font-bold">Our Goal</h2>
              </div>
              <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed text-lg">
                  Our mission is to simplify financial literacy for students and professionals. We believe that tracking expenses shouldn't be a chore—it should be an intelligent, automated experience that helps you save more and stress less.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Smart Analysis", "Data Visualization", "Secure & Private"].map((tag) => (
                    <Badge key={tag} variant="secondary" className="px-3 py-1">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </motion.section>

            <hr className="border-border/50" />

            {/* TECH & FEATURES GRID */}
            <motion.div variants={item} className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="font-semibold text-xl flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" /> Key Features
                </h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="bg-primary/10 p-1 rounded-full mt-0.5"><CheckCircle2 className="w-3 h-3 text-primary" /></span>
                    <span><strong>AI Insights:</strong> Powered by Google Gemini to analyze spending habits.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-primary/10 p-1 rounded-full mt-0.5"><CheckCircle2 className="w-3 h-3 text-primary" /></span>
                    <span><strong>Real-time Charts:</strong> Interactive visualization of your data.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-primary/10 p-1 rounded-full mt-0.5"><CheckCircle2 className="w-3 h-3 text-primary" /></span>
                    <span><strong>Secure Cloud:</strong> Data persisted safely with Neon PostgreSQL.</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-xl flex items-center gap-2">
                  <Code className="w-5 h-5 text-blue-500" /> Tech Stack
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 bg-secondary/50 p-2 rounded-md">
                    <Layout className="w-4 h-4 text-blue-400" /> <span className="text-sm">React + Tailwind</span>
                  </div>
                  <div className="flex items-center gap-2 bg-secondary/50 p-2 rounded-md">
                    <Server className="w-4 h-4 text-green-400" /> <span className="text-sm">Node.js + Express</span>
                  </div>
                  <div className="flex items-center gap-2 bg-secondary/50 p-2 rounded-md">
                    <Database className="w-4 h-4 text-orange-400" /> <span className="text-sm">PostgreSQL</span>
                  </div>
                  <div className="flex items-center gap-2 bg-secondary/50 p-2 rounded-md">
                    <Sparkles className="w-4 h-4 text-purple-400" /> <span className="text-sm">Gemini AI</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <hr className="border-border/50" />

            {/* TEAM SECTION */}
            <motion.section variants={item} className="space-y-6">
              <div className="flex items-center justify-center gap-3">
                <Users className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-center">Meet the Developers</h2>
              </div>
              
              <div className="grid sm:grid-cols-3 gap-6">
                {developers.map((dev) => (
                  <Card key={dev.name} className="border bg-card/50 hover:bg-card hover:shadow-md transition-all duration-300 text-center">
                    <CardContent className="pt-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold text-primary">
                        {dev.name.charAt(0)}
                      </div>
                      <h3 className="font-bold text-lg">{dev.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{dev.role}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.section>

            {/* FOOTER */}
            <motion.div variants={item} className="pt-4 flex justify-center">
              <Link href="/">
                <Button size="lg" className="gap-2 px-8 rounded-full shadow-lg hover:shadow-xl transition-all">
                  <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                </Button>
              </Link>
            </motion.div>

          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}