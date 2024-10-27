"use client";

import { CPOGetAll } from "@/interfaces/cpo-get-all.interface";
import StatusTab from "./status-tab";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Spinner } from "@nextui-org/spinner";

interface Props {
  searchParams: { type: string };
}

export default function MyOrderPage({ searchParams }: Props) {
  const session = useSession();
  const [cpos, setCPOs] = useState<CPOGetAll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCPOs = async () => {
    if (!session.data?.userId || !session.data?.accessToken) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/customer-purchase-orders?id=${session.data.userId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.data.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const result = await response.json();
      setCPOs(result);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setError("Failed to load orders. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session.status === "authenticated") {
      fetchCPOs();
    }
  }, [session.status]);

  if (session.status === "loading" || isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (session.status === "unauthenticated") {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <p className="text-danger">Please login to view your orders</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <StatusTab cpos={cpos} />
    </div>
  );
}
