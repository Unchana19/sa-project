"use client";

import { Suspense } from "react";
import { useEffect, useState, useTransition } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import TabsSelect from "@/components/tabs-select";
import CategoriesPage from "./categories";
import EditCategory from "./edit-categories";
import ProductsPage from "./products";
import ComponentsPage from "./components";
import EditProduct from "./edit-product";
import EditComponent from "./edit-component";
import { Category } from "@/interfaces/category.interface";
import { Product } from "@/interfaces/product.interface";
import { Component } from "@/interfaces/component.interface";
import { CreateCategorySchema } from "@/lib/schemas/createCategoySchema";
import { Skeleton } from "@heroui/skeleton";
import PopupModal from "@/components/popup-modal";
import { useDisclosure } from "@heroui/modal";
import { CreateComponentSchema } from "@/lib/schemas/createComponentSchema";
import { Material } from "@/interfaces/material.interface";
import { CreateProductSchema } from "@/lib/schemas/createProductSchema";
import { SelectedComponent } from "@/interfaces/select-component";

const useStepChange = (initialStep: number) => {
  const [activeStep, setActiveStepState] = useState(initialStep);

  const setActiveStep = (step: number) => {
    setActiveStepState(step);
    window.scrollTo({ top: 0 });
  };

  return [activeStep, setActiveStep] as const;
};

// Loading component
function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="w-3/4 h-8 rounded-lg" />
      <Skeleton className="w-full h-64 rounded-lg" />
    </div>
  );
}

// Main content component
function ProductComponentContent() {
  const session = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  const [activeStep, setActiveStep] = useStepChange(0);
  const [category, setCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filterCategories, setFilterCategories] = useState<Category[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [component, setComponent] = useState<Component | null>(null);

  const { isOpen, onOpenChange } = useDisclosure();
  const [message, setMessage] = useState("");

  const tabs = [
    { id: "product", label: "Product" },
    { id: "component", label: "Component" },
  ];

  useEffect(() => {
    if (session.data?.accessToken) {
      fetchCategories();
    }
  }, [session.data?.accessToken]);

  useEffect(() => {
    const type = searchParams.get("type") || "product";
    filterTypeCategories(type);
  }, [searchParams, categories]);

  const fetchCategories = async () => {
    try {
      const token = session.data?.accessToken;
      const response = await fetch("/api/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (response.ok) {
        setCategories(result);
      }
    } catch (error) {
      setMessage(error as string);
      onOpenChange();
    } finally {
      setIsLoading(false);
    }
  };

  const filterTypeCategories = (type: string) => {
    setFilterCategories(
      categories.filter((category) => category.type === type)
    );
  };

  const handleTabChange = (key: string) => {
    setActiveStep(0);
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      params.set("type", key);
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

 const handleSeeAll = (category: Category, label: string) => {
   setCategory(category);
   if (label === "product") {
     setActiveStep(2);
   } else {
     setActiveStep(3);
   }
 };

 const handleCategoryEdit = (category: Category | null) => {
   setCategory(category || null);
   setActiveStep(1);
 };

 const handleCategorySave = async (
   data: CreateCategorySchema,
   file: File | null,
   componentCategories?: string[]
 ) => {
   try {
     const formData = new FormData();
     formData.append("name", data.name);
     formData.append("type", data.type);
     if (componentCategories) {
       formData.append(
         "componentCategories",
         JSON.stringify(componentCategories)
       );
     }
     if (category) {
       formData.append("id", category.id);
     }
     if (file) formData.append("file", file);

     const response = await fetch("/api/categories", {
       method: category ? "PATCH" : "POST",
       headers: { Authorization: `Bearer ${session.data?.accessToken}` },
       body: formData,
     });
     const result = await response.json();
     if (response.ok) {
       await fetchCategories();
       setActiveStep(0);
     } else {
       setMessage(result.message as string);
       onOpenChange();
     }
   } catch (error) {
     setMessage(error instanceof Error ? error.message : String(error));
     onOpenChange();
   }
 };

 const handleDelete = async (categoryId: string) => {
   try {
     const response = await fetch(`/api/categories?id=${categoryId}`, {
       method: "DELETE",
       headers: {
         "Content-Type": "application/json",
         Authorization: `Bearer ${session.data?.accessToken}`,
       },
     });

     const result = await response.json();
     if (response.ok) {
       await fetchCategories();
     } else {
       setMessage(result.message as string);
       onOpenChange();
     }
   } catch (error) {
     setMessage(error instanceof Error ? error.message : String(error));
     onOpenChange();
   }
 };

 const handleDiscard = () => setActiveStep(0);

 const handleProductEdit = (product: Product | null) => {
   setProduct(product);
   setActiveStep(4);
 };

 const handleProductSave = async (
   data: CreateProductSchema,
   selectedComponents: SelectedComponent[],
   file: File | null
 ) => {
   try {
     const formData = new FormData();

     if (product) formData.append("id", product.id);

     formData.append("category_id", data.category);
     formData.append("name", data.name);
     formData.append("detail", data.detail);
     formData.append("price", data.price);

     const simplifiedComponents = selectedComponents.map((item) => ({
       id: item.component,
       primary_color: item.primary_color?.id,
       pattern_color: item.pattern_color?.id,
     }));
     formData.append("components", JSON.stringify(simplifiedComponents));

     if (file) formData.append("file", file);

     const response = await fetch("/api/products", {
       method: product ? "PATCH" : "POST",
       headers: { Authorization: `Bearer ${session.data?.accessToken}` },
       body: formData,
     });
     const result = await response.json();
     if (response.ok) {
       setActiveStep(2);
     } else {
       setMessage(result.message as string);
       onOpenChange();
     }
   } catch (error) {
     setMessage(error instanceof Error ? error.message : String(error));
     onOpenChange();
   }
 };

 const handleProductDelete = async (productId: string) => {
   try {
     const response = await fetch(`/api/products?id=${productId}`, {
       method: "DELETE",
       headers: {
         "Content-Type": "application/json",
         Authorization: `Bearer ${session.data?.accessToken}`,
       },
     });

     const result = await response.json();
     if (response.ok) {
       setMessage("");
     } else {
       setMessage(result.message);
       onOpenChange();
     }
   } catch (error) {
     setMessage(error as string);
     onOpenChange();
   }
 };

 const handleProductDiscard = () => setActiveStep(2);

 const handleComponentEdit = (component: Component | null) => {
   setComponent(component);
   setActiveStep(5);
 };

 const handleComponentSave = async (
   data: CreateComponentSchema,
   materials: { material: Material; quantity: string }[],
   file: File | null
 ) => {
   try {
     const formData = new FormData();

     if (component) formData.append("id", component.id);

     formData.append("category_id", data.category);
     formData.append("name", data.name);
     formData.append("price", data.price);
     formData.append("color_primary_use", data.color_primary_use);
     formData.append("color_pattern_use", data.color_pattern_use);

     const simplifiedMaterials = materials.map((item) => ({
       material_id: item.material.id,
       quantity: item.quantity,
     }));
     formData.append("materials", JSON.stringify(simplifiedMaterials));

     if (file) formData.append("file", file);

     const response = await fetch("/api/components", {
       method: component ? "PATCH" : "POST",
       headers: { Authorization: `Bearer ${session.data?.accessToken}` },
       body: formData,
     });
     const result = await response.json();
     if (response.ok) {
       await fetchCategories();
       setActiveStep(3);
     } else {
       setMessage(result.message as string);
       onOpenChange();
     }
   } catch (error) {
     setMessage(error instanceof Error ? error.message : String(error));
     onOpenChange();
   }
 };

 const handleComponentDelete = async (componentId: string) => {
   try {
     const response = await fetch(`/api/components?id=${componentId}`, {
       method: "DELETE",
       headers: {
         "Content-Type": "application/json",
         Authorization: `Bearer ${session.data?.accessToken}`,
       },
     });

     const result = await response.json();
     if (response.ok) {
       setMessage("");
     } else {
       setMessage(result.message);
       onOpenChange();
     }
   } catch (error) {
     setMessage(error as string);
     onOpenChange();
   }
 };

 const handleComponentDiscard = () => setActiveStep(3);

 const handleBack = () => setActiveStep(0);

  const renderContent = () => {
    if (isLoading) {
      return <LoadingSkeleton />;
    }

    switch (activeStep) {
      case 0:
        return (
          <CategoriesPage
            label={searchParams.get("type") || "product"}
            categories={filterCategories}
            handleSeeAll={handleSeeAll}
            handleEdit={handleCategoryEdit}
            handleDelete={handleDelete}
          />
        );
      case 1:
        return (
          <EditCategory
            label={searchParams.get("type") || "product"}
            category={category}
            handleSave={handleCategorySave}
            handleDiscard={handleDiscard}
          />
        );
      case 2:
        return (
          <ProductsPage
            label={category?.name || ""}
            categoryId={category?.id || ""}
            handleEdit={handleProductEdit}
            handleDelete={handleProductDelete}
            handleBack={handleBack}
          />
        );
      case 3:
        return (
          <ComponentsPage
            label={category?.name || ""}
            categoryId={category?.id || ""}
            handleEdit={handleComponentEdit}
            handleDelete={handleComponentDelete}
            handleBack={handleBack}
          />
        );
      case 4:
        return (
          <EditProduct
            category={category || categories[0]}
            product={product}
            handleSave={handleProductSave}
            handleDiscard={handleProductDiscard}
          />
        );
      case 5:
        return (
          <EditComponent
            category={category || categories[0]}
            component={component}
            handleSave={handleComponentSave}
            handleDiscard={handleComponentDiscard}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="mb-40">
      <h3 className="font-bold text-xl mb-5">Product & Component</h3>
      <TabsSelect
        tabs={tabs}
        handleTabChange={handleTabChange}
        isPending={isPending}
        variant="bordered"
        size="lg"
      />
      <div className="mt-8">{renderContent()}</div>
      <PopupModal message={message} isOpen={isOpen} onClose={onOpenChange} />
    </div>
  );
}

// Main component wrapped with Suspense
export default function ProductComponentTab() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <ProductComponentContent />
    </Suspense>
  );
}
