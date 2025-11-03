"use client";

import { useDemoBanner } from "@/hooks/useDemoBanner";
import { GlobalDemoBanner } from "./GlobalDemoBanner";

interface DemoLayoutWrapperProps {
  children: React.ReactNode;
}

export function DemoLayoutWrapper({ children }: DemoLayoutWrapperProps) {
  const showBanner = useDemoBanner();
  
  return (
    <>
      {/* Show demo banner when in demo mode */}
      {showBanner && <GlobalDemoBanner />}
      
      {/* Add top padding when banner is visible to prevent overlap */}
      <div className={showBanner ? "pt-10" : ""}>
        {children}
      </div>
    </>
  );
}