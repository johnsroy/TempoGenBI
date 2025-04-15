"use client";

import { User } from "@supabase/supabase-js";
import { Button } from "./ui/button";
import { Check } from "lucide-react";
import { supabase } from "../../supabase/supabase";

export default function PricingCard({
  item,
  user,
}: {
  item: any;
  user: User | null;
}) {
  // Handle checkout process
  const handleCheckout = async (priceId: string) => {
    if (!user) {
      // Redirect to login if user is not authenticated
      window.location.href = "/sign-in?redirect=pricing";
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-create-checkout",
        {
          body: {
            price_id: priceId,
            user_id: user.id,
            return_url: `${window.location.origin}/dashboard`,
          },
          headers: {
            "X-Customer-Email": user.email || "",
          },
        },
      );

      if (error) {
        throw error;
      }

      // Redirect to Stripe checkout
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
    }
  };

  // Define features based on plan type
  const features = [
    "Natural language queries",
    "Interactive visualizations",
    "Data export options",
    item.name !== "Basic" ? "Team collaboration" : null,
    item.name !== "Basic" ? "Advanced analytics" : null,
    item.name === "Enterprise" ? "Custom integrations" : null,
    item.name === "Enterprise" ? "Dedicated support" : null,
  ].filter(Boolean);

  return (
    <div className="group relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
      {/* Glassmorphic background */}
      <div
        className={`absolute inset-0 backdrop-blur-md rounded-xl border shadow-lg transition-all duration-300 
                ${item.popular ? "bg-white/40 border-blue-200/50" : "bg-white/30 border-white/30"}`}
      ></div>

      {/* Subtle gradient overlay */}
      <div
        className={`absolute inset-0 rounded-xl opacity-70 
                ${item.popular ? "bg-gradient-to-br from-blue-50/20 to-purple-50/30" : "bg-gradient-to-br from-blue-50/10 to-purple-50/20"}`}
      ></div>

      {/* Decorative elements */}
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-400/10 rounded-full blur-2xl"></div>
      <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-purple-400/10 rounded-full blur-xl"></div>

      {/* Content */}
      <div className="relative p-8 flex flex-col h-full z-10">
        {item.popular && (
          <div className="px-4 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-full w-fit mb-4 self-start">
            Most Popular
          </div>
        )}

        <h3 className="text-2xl font-bold mb-2 text-gray-900">{item.name}</h3>

        <div className="flex items-baseline gap-2 mb-6">
          <span className="text-4xl font-bold text-gray-900">
            ${item?.amount / 100}
          </span>
          <span className="text-gray-600">/{item?.interval}</span>
        </div>

        <div className="flex-grow">
          <ul className="space-y-3 mb-8">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <Button
          onClick={async () => {
            await handleCheckout(item.id);
          }}
          className={`w-full py-6 text-lg font-medium ${item.popular ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90" : ""}`}
        >
          Get Started
        </Button>
      </div>
    </div>
  );
}
