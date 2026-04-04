import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Check, Shield, Activity, Users } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSystem } from "@/contexts/SystemContext";

const plans = [
  {
    name: "Standard",
    price: "₹0",
    description: "Essential tools for personal use.",
    features: ["5 Proposals / month", "Global Search", "Email Support"],
    buttonText: "Current",
    recommended: false,
    icon: Shield,
  },
  {
    name: "Professional",
    price: "₹499",
    period: "/mo",
    description: "Advanced capabilities for power users.",
    features: [
      "Unlimited Proposals",
      "Priority Processing",
      "Advanced Filtering",
      "Project Indexing",
    ],
    buttonText: "Select",
    recommended: true,
    icon: Activity,
  },
  {
    name: "Enterprise",
    price: "₹999",
    period: "/mo",
    description: "Full potential for large scale operations.",
    features: [
      "Everything in Pro",
      "Multi-user Access",
      "Shared Environment",
      "24/7 Priority Support",
    ],
    buttonText: "Contact",
    recommended: false,
    icon: Users,
  },
];

const Pricing = () => {
  const { subscriptionTier, setSubscriptionTier, addLog } = useSystem();
  const [loading, setLoading] = useState(false);

  const handleSubscription = async (planName: string) => {
    if (planName === subscriptionTier) return;
    setLoading(true);
    try {
      toast.info(`Initializing ${planName} request...`);
      setTimeout(() => {
        setSubscriptionTier(planName as any);
        addLog(`System subscription upgraded to ${planName}`, "success");
        toast.success(`System successfully upgraded to ${planName} Tier.`);
        setLoading(false);
      }, 1500);
    } catch (err) {
      toast.error("Process failed.");
      setLoading(false);
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto custom-scrollbar bg-black/40 backdrop-blur-3xl font-sans">
      <div className="text-center mb-16 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
          <h1 className="text-2xl font-bold tracking-tight mb-2 uppercase text-white">
            System <span className="text-primary opacity-60">Subscription</span>
          </h1>
          <p className="max-w-md mx-auto text-muted-foreground font-bold text-[9px] uppercase tracking-widest opacity-60">
            Tiered access for professional operations.
          </p>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 max-w-6xl mx-auto">
        {plans.map((plan, i) => (
          <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className={cn(
              "relative h-full flex flex-col border-white/5 bg-white/5 transition-all duration-300 rounded-xl shadow-inner group py-4",
              plan.recommended && "border-primary/20 bg-primary/5"
            )}>
              <CardHeader className="p-6 pb-4 text-center">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/10 group-hover:border-primary/30 transition-all">
                    <plan.icon className="h-4 w-4 text-primary opacity-60" />
                </div>
                <CardTitle className="text-sm font-bold tracking-tight mb-1 uppercase opacity-80 text-white">{plan.name}</CardTitle>
                <CardDescription className="text-muted-foreground text-[8px] font-bold uppercase tracking-widest opacity-50">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="px-6 pb-6 flex-1">
                <div className="mb-6 flex items-baseline justify-center gap-1 text-white">
                  <span className="text-3xl font-bold tracking-tight">{plan.price}</span>
                  {plan.period && <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-40">{plan.period}</span>}
                </div>
                <div className="space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide opacity-70 text-white">
                      <Check className="h-3 w-3 text-primary" />
                      <span className="truncate">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
              
              <CardFooter className="px-6">
                <Button
                  variant={plan.recommended ? "default" : "outline"}
                  className={cn(
                    "w-full h-9 rounded-lg font-bold uppercase tracking-widest text-[9px] transition-all",
                    plan.recommended ? "bg-primary text-primary-foreground shadow-lg" : "border-white/10 bg-white/5 hover:bg-white/10"
                  )}
                  onClick={() => handleSubscription(plan.name)}
                  disabled={loading || plan.name === subscriptionTier}
                >
                  {plan.name === subscriptionTier ? "Current Tier" : plan.buttonText}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-16 flex justify-center items-center gap-10 opacity-30 grayscale filter text-white">
         <span className="text-[8px] font-bold uppercase tracking-widest">Secure Storage</span>
         <span className="text-[8px] font-bold uppercase tracking-widest">AI Optimized</span>
         <span className="text-[8px] font-bold uppercase tracking-widest">Global Support</span>
      </div>
    </div>
  );
};

export default Pricing;
