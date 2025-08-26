import React from "react";
import { CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  benefits: string[];
}

export default React.memo(function FeatureCard({ icon, title, description, benefits }: FeatureCardProps) {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-8">
        <div className="flex items-center mb-6">
          {icon}
          <h3 className="text-2xl font-semibold text-gray-900 ml-4">{title}</h3>
        </div>
        <p className="text-gray-600 mb-6 text-lg">{description}</p>
        <ul className="space-y-3">
          {benefits.map((benefit, idx) => (
            <li key={idx} className="flex items-center text-gray-600">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
              {benefit}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
});
