"use client";

import { useEffect, useState } from "react";

export function useDemoBanner() {
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // Show banner in production or when DEMO_MODE is enabled
        const isDemo = process.env.NODE_ENV === 'production' ||
            process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
        setShowBanner(isDemo);
    }, []);

    return showBanner;
}