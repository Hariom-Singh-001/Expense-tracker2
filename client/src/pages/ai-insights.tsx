import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";
import { MOCK_INSIGHTS } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const AIInsights = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [localInsights, setLocalInsights] = useState(MOCK_INSIGHTS);

  const generateNewInsight = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setLocalInsights(prev => [
        {
          id: Date.now().toString(),
          title: "New Opportunity Detected",
          description: "Based on your spending patterns, you could save $45/month by switching your coffee habits.",
          type: "tip",
          date: new Date().toISOString()
        },
        ...prev
      ]);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold tracking-tight">Gemini Insights</h1>
            <Badge variant="outline" className="border-primary/50 text-primary animate-pulse">
              AI Powered
            </Badge>
          </div>
          <p className="text-muted-foreground">Smart financial analysis powered by Google's Gemini models.</p>
        </div>
        <Button 
          onClick={generateNewInsight} 
          disabled={isGenerating}
          className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg shadow-primary/25 border-0"
        >
          {isGenerating ? (
            <Sparkles className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {isGenerating ? "Analyzing..." : "Generate Analysis"}
        </Button>
      </div>

      <div className="grid gap-6">
        <AnimatePresence mode="popLayout">
          {localInsights.map((insight) => (
            <motion.div
              key={insight.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-primary/10 overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="flex flex-row items-start gap-4">
                  <div className={cn(
                    "p-3 rounded-xl",
                    insight.type === 'warning' && "bg-destructive/10 text-destructive",
                    insight.type === 'tip' && "bg-primary/10 text-primary",
                    insight.type === 'positive' && "bg-emerald-500/10 text-emerald-500",
                  )}>
                    {insight.type === 'warning' && <AlertTriangle className="w-6 h-6" />}
                    {insight.type === 'tip' && <Lightbulb className="w-6 h-6" />}
                    {insight.type === 'positive' && <TrendingUp className="w-6 h-6" />}
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{insight.title}</CardTitle>
                    <CardDescription className="text-xs">
                      Generated on {new Date(insight.date).toLocaleDateString()}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="pl-[5.5rem]">
                  <p className="leading-relaxed text-muted-foreground">
                    {insight.description}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" className="text-xs">
                      View Details
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs">
                      Dismiss
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

import { cn } from "@/lib/utils";

export default AIInsights;
