"use client";

import { useEffect } from "react";
import OneSignal from "react-onesignal";

export const OneSignalInitializer = () => {
  useEffect(() => {
    const initializeOneSignal = async () => {
      // Skip OneSignal in development if having issues
      if (process.env.NODE_ENV === 'development') {
        console.log("[OneSignal] Skipping initialization in development mode");
        return;
      }

      if (!process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID) {
        console.error("OneSignal App ID is not configured.");
        return;
      }
      
      try {
        // Check if service worker is available
        if (!('serviceWorker' in navigator)) {
          console.warn("Service Worker not supported in this browser");
          return;
        }

        console.log("[OneSignal] Initializing with App ID:", process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID);

        await OneSignal.init({
          appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
          allowLocalhostAsSecureOrigin: true,
          serviceWorkerParam: { scope: "/" },
          serviceWorkerPath: "/OneSignalSDKWorker.js",
          notificationClickHandlerMatch: "origin",
          notificationClickHandlerAction: "navigate",
        });

        console.log("[OneSignal] ✅ Initialized successfully");
      } catch (error) {
        console.error("[OneSignal] ❌ Failed to initialize:", error);
        
        // If initialization fails, try to unregister any existing service workers
        if ('serviceWorker' in navigator) {
          try {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (const registration of registrations) {
              if (registration.scope.includes('OneSignal') || registration.active?.scriptURL.includes('OneSignal')) {
                console.log("[OneSignal] Unregistering problematic service worker:", registration);
                await registration.unregister();
              }
            }
          } catch (cleanupError) {
            console.error("[OneSignal] Failed to cleanup service workers:", cleanupError);
          }
        }
      }
    };

    // Add a small delay to ensure the service worker is ready
    const timer = setTimeout(initializeOneSignal, 1000);

    return () => clearTimeout(timer);
  }, []);

  return null; // This component does not render any UI
};
