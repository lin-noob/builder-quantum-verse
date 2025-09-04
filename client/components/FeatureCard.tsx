import React from "react";
import { CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  benefits: string[];
}

export default React.memo(function FeatureCard({
  icon,
  title,
  description,
  benefits,
}: FeatureCardProps) {
  return (
    <Card className="h-full group bg-gray-800/50 border-gray-700 hover:border-cyan-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 hover:scale-105 backdrop-blur-sm">
      <CardContent className="p-8">
        <div className="flex items-center mb-6">
          <div className="p-3 bg-cyan-500/10 rounded-lg mr-4 group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
          <h3 className="text-2xl font-semibold text-white">{title}</h3>
        </div>
        <p className="text-gray-300 mb-6 text-lg leading-relaxed">{description}</p>
        <ul className="space-y-3">
          {benefits.map((benefit, idx) => (
            <li key={idx} className="flex items-center text-gray-400">
              <CheckCircle className="h-5 w-5 text-cyan-400 mr-3" />
              {benefit}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
});
