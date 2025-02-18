"use client";

import { Suspense } from "react";
import TabsSelect from "@/components/tabs-select";
import { Skeleton } from "@heroui/skeleton";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { Key, useEffect, useState, useTransition } from "react";
import CustomerPurchaseOrder from "./customer-purchase-order";
import MaterialPurchaseOrder from "./material-purchase-order";
import { MPOGetAll } from "@/interfaces/mpo-get-all.interface";
import { useSession } from "next-auth/react";
import { ManagerCPOGetAll } from "@/interfaces/manager-cpo-get-all.interface";

// Separate client component for the main content
function PurchaseOrderContent() {
  const session = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);
  const [mpo, setMpo] = useState<MPOGetAll[]>([]);
  const [cpos, setCPOs] = useState<ManagerCPOGetAll[]>([]);

  const fetchMpo = async () => {
    try {
      const token = session.data?.accessToken;
      const response = await fetch("/api/material-purchase-orders", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (response.ok) {
        setMpo(result);
      }
    } catch (error) {
      setError("Failed to fetch materials");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCPOs = async () => {
    try {
      const token = session.data?.accessToken;
      const response = await fetch("/api/customer-purchase-orders/manager", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (response.ok) {
        setCPOs(result);
      }
    } catch (error) {
      setError("Failed to fetch materials");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session.data?.accessToken) {
      fetchMpo();
      fetchCPOs();
    }
  }, [session.data?.accessToken]);

  const tabs = [
    { id: "customer", label: "Customer" },
    { id: "material", label: "Material" },
  ];

  const handleTabChange = (key: Key) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      params.set("type", key.toString());
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  const getStepContent = (label: string) => {
    switch (label) {
      case "Customer":
        return isLoading ? (
          <SkeletonLoading />
        ) : (
          <CustomerPurchaseOrder cpos={cpos} fetchCPOs={fetchCPOs} />
        );

      case "Material":
        return isLoading ? (
          <SkeletonLoading />
        ) : (
          <MaterialPurchaseOrder mpo={mpo} fetchMPO={fetchMpo} />
        );

      default:
        return "unknown label";
    }
  };

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="mb-40 w-full">
      <TabsSelect
        tabs={tabs}
        handleTabChange={handleTabChange}
        isPending={isPending}
        variant="bordered"
        size="lg"
      />

      <div>
        {tabs.map((tab) => {
          const isSelected = searchParams.get("type") === tab.id;
          return isSelected ? (
            <div key={tab.id} className="mt-5">
              {getStepContent(tab.label)}
            </div>
          ) : null;
        })}
      </div>
    </div>
  );
}

function SkeletonLoading() {
  return (
    <div className="flex flex-col gap-5">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

// Main component wrapped with Suspense
export default function PurchaseOrderTab() {
  return (
    <Suspense fallback={<SkeletonLoading />}>
      <PurchaseOrderContent />
    </Suspense>
  );
}
