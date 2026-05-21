"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { format, addDays, subDays, parseISO } from "date-fns";

export default function DayKeyNav({ date }: { date: string }) {
  const router = useRouter();

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const current = parseISO(date);
      if (e.key === "ArrowLeft") {
        router.push(`/day/${format(subDays(current, 1), "yyyy-MM-dd")}`);
      }
      if (e.key === "ArrowRight") {
        router.push(`/day/${format(addDays(current, 1), "yyyy-MM-dd")}`);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [date, router]);

  return null;
}
