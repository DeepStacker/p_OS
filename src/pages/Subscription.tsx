import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Check, Sparkles, Zap, Shield, Star, Crown, ShieldCheck, Heart } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Standard",
    price: "₹0",
    description: "Essential tools for starting your regime.",
    features: ["5 Archive Artifacts / month", "Basic Market Scanning", "Community Node Support"],
    buttonText: "Current Plan",
    recommended: false,
    icon: Shield,
  },
  {
    name: "Architect Pro",
    price: "₹499",
    period: "/mo",
    description: "The gold standard for elite freelancers.",
    features: [
      "Infinite Generation Capacity",
      "Priority AI Model Access",
      "Dynamic Market Telemetry",
      "Curation Lab Hosting",
    ],
    buttonText: "Execute Upgrade",
    recommended: true,
    icon: Crown,
  },
  {
    name: "Elite Agency",
    price: "₹999",
    period: "/mo",
    description: "Maximum output for high-ticket agencies.",
    features: [
      "Everything in Pro",
      "Multi-user Authentication",
      "White-label Architect",
      "Direct Support Frequency",
    ],
    buttonText: "Contact Sales",
    recommended: false,
    icon: Star,
  },
];

const Subscription = () => {
  const [loading, setLoading] = useState(false);

  const handleSubscription = async (planName: string) => {
    if (planName === "Standard") return;
    
    setLoading(true);
    try {
      toast.info(`Initializing secure protocol for ${planName}...`);
      
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder",
          amount: planName === "Architect Pro" ? 49900 : 99900,
          currency: "INR",
          name: "Proposal Pro",
          description: `${planName} Subscription`,
          image: "https://api.iconify.design/lucide:sparkles.svg?color=%2310b981",
          handler: function (response: any) {
            toast.success(`Protocol Verified! Welcome to ${planName}. ID: ${response.razorpay_payment_id}`);
          },
          prefill: {
            name: "Freelancer",
            email: "ops@proposalpro.ai",
          },
          theme: {
            color: "#10b981",
          },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      };
    } catch (err) {
      toast.error("Initialization failure. Check telemetry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background mesh-bg font-sans">
      <Navbar />
      <main className="container mx-auto px-6 pt-40 pb-20">
        <div className="text-center mb-24 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary/10 blur-[100px] rounded-full" />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative z-10"
          >
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 px-6 py-1.5 rounded-full uppercase font-black tracking-[0.2em] text-[10px]">Vault Access Protocols</Badge>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 uppercase leading-none">
              Command Your <br />
              <span className="text-gradient">Income Velocity.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground font-medium leading-relaxed">
              Every elite freelancer needs the right arsenal. Select your tactical package and start winning higher ticket contracts.
            </p>
          </motion.div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3 max-w-6xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              className="h-full"
            >
              <Card className={cn(
                "relative h-full flex flex-col glass-card rounded-[2.5rem] border-white/5 group transition-all duration-500",
                plan.recommended && "border-primary/40 shadow-[0_0_80px_-20px_rgba(16,185,129,0.3)] scale-[1.05] z-10"
              )}>
                {plan.recommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-2xl">
                    Tactical Priority
                  </div>
                )}
                
                <CardHeader className="p-10 pb-6">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                    <plan.icon className={cn("h-7 w-7", plan.recommended ? "text-primary" : "text-muted-foreground")} />
                  </div>
                  <CardTitle className="text-2xl font-black tracking-tight mb-2 uppercase">{plan.name}</CardTitle>
                  <CardDescription className="text-muted-foreground font-medium">{plan.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="px-10 pb-10 flex-1">
                  <div className="mb-10 flex items-baseline gap-1">
                    <span className="text-5xl font-black tracking-tighter">{plan.price}</span>
                    {plan.period && <span className="text-sm font-black text-muted-foreground uppercase opacity-50">{plan.period}</span>}
                  </div>
                  <div className="space-y-5">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-4 text-sm font-bold">
                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-foreground/80 leading-snug">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                
                <CardFooter className="p-10 pt-0">
                  <Button
                    variant={plan.recommended ? "default" : "outline"}
                    className={cn(
                      "w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs transition-all duration-500",
                      plan.recommended ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20" : "border-white/10 hover:bg-white/5"
                    )}
                    onClick={() => handleSubscription(plan.name)}
                    disabled={loading || plan.name === "Standard"}
                  >
                    {plan.buttonText}
                    {plan.recommended && <Sparkles className="ml-3 h-4 w-4" />}
                    {!plan.recommended && plan.name !== "Standard" && <Zap className="ml-3 h-4 w-4" />}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* trust indicators */}
        <div className="mt-32 max-w-4xl mx-auto border-t border-white/5 pt-16 grid grid-cols-2 lg:grid-cols-4 gap-8 opacity-40">
           <div className="flex flex-col items-center gap-3">
              <ShieldCheck className="h-8 w-8" />
              <span className="text-[10px] font-black uppercase tracking-widest text-center">Military-Grade Encryption</span>
           </div>
           <div className="flex flex-col items-center gap-3">
              <Heart className="h-8 w-8" />
              <span className="text-[10px] font-black uppercase tracking-widest text-center">Trusted by 4k+ Clients</span>
           </div>
           <div className="flex flex-col items-center gap-3">
              <Star className="h-8 w-8" />
              <span className="text-[10px] font-black uppercase tracking-widest text-center">Elite Model Pipeline</span>
           </div>
           <div className="flex flex-col items-center gap-3">
              <Crown className="h-8 w-8" />
              <span className="text-[10px] font-black uppercase tracking-widest text-center">Proprietary AI Logic</span>
           </div>
        </div>
      </main>
    </div>
  );
};

export default Subscription;
