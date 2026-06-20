"use client";

import * as React from "react";

interface CountryContextType {
  country: string;
  setCountry: (country: string) => void;
  isDetecting: boolean;
}

const CountryContext = React.createContext<CountryContextType | undefined>(undefined);

// Major movie markets / watch provider regions
export const COUNTRIES = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
];

export function CountryProvider({ children }: { children: React.ReactNode }) {
  const [country, setCountryState] = React.useState("US");
  const [isDetecting, setIsDetecting] = React.useState(true);

  // Read cookies client-side helper
  const getCookie = (name: string): string | null => {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
  };

  // Set cookie helper
  const setCookie = (name: string, val: string) => {
    if (typeof document === "undefined") return;
    document.cookie = `${name}=${val}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
  };

  const setCountry = (newCountry: string) => {
    setCountryState(newCountry);
    setCookie("user-country", newCountry);
  };

  React.useEffect(() => {
    const cached = getCookie("user-country");
    if (cached) {
      setCountryState(cached);
      setIsDetecting(false);
      return;
    }

    // Geolocation detection via ipapi.co
    setIsDetecting(true);
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        if (data.country_code) {
          const detected = data.country_code.toUpperCase();
          // Check if detected country is one of our supported codes, otherwise use US
          const isSupported = COUNTRIES.some((c) => c.code === detected);
          const finalCountry = isSupported ? detected : "US";
          setCountry(finalCountry);
        } else {
          setCountry("US");
        }
      })
      .catch((err) => {
        console.error("Error detecting country, falling back to US:", err);
        setCountry("US");
      })
      .finally(() => {
        setIsDetecting(false);
      });
  }, []);

  return (
    <CountryContext.Provider value={{ country, setCountry, isDetecting }}>
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry() {
  const context = React.useContext(CountryContext);
  if (context === undefined) {
    throw new Error("useCountry must be used within a CountryProvider");
  }
  return context;
}
