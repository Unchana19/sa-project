"use client";
import EmptyComponents from "@/components/empty-components";
import PopupModal from "@/components/popup-modal";
import ProductCardSmall from "@/components/product-card-small";
import { Category } from "@/interfaces/category.interface";
import { Product } from "@/interfaces/product.interface";
import { Button } from "@nextui-org/button";
import { Card } from "@nextui-org/card";
import { useDisclosure } from "@nextui-org/modal";
import { Skeleton } from "@nextui-org/skeleton";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaCartPlus } from "react-icons/fa";

export default function AllProductsPage() {
  const session = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/categories/product-categories");
      const result = await response.json();
      if (response.ok) {
        setCategories(result);
      }
    } catch (error) {
      console.error("Error fetching product categories:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/products?id=${session.data?.userId}`);
      const result = await response.json();
      if (response.ok) {
        setProducts(result);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const handleAddToCart = async (product: Product) => {
    if (session.status === "authenticated" && session.data?.userId) {
      await addToCart(product);
    } else {
      setModalMessage("Please login to add items to cart");
      onOpen();
    }
  };

  const addToCart = async (product: Product) => {
    if (isAddingToCart) return;

    setIsAddingToCart(true);

    try {
      if (!session.data?.userId) {
        setModalMessage("Unable to add to cart. Please try again.");
        onOpen();
        return;
      }

      const data = {
        product_id: product.id,
        order_id: session.data.userId,
      };

      const response = await fetch("/api/carts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.data.accessToken}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setModalMessage("Product added to cart successfully!");
      } else {
        setModalMessage("Failed to add product to cart");
      }
      onOpen();
    } catch (error) {
      setModalMessage("An error occurred. Please try again.");
      onOpen();
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-8 w-32 rounded-lg mb-10" />
        <div className="flex flex-col gap-10">
          {[...Array(3)].map((_, categoryIndex) => (
            <div key={categoryIndex} className="flex flex-col">
              <div className="flex justify-between mb-5">
                <Skeleton className="h-6 w-40 rounded-lg" />
                <Skeleton className="h-10 w-32 rounded-full" />
              </div>
              <div className="flex flex-wrap justify-start">
                {[...Array(4)].map((_, productIndex) => (
                  <div
                    key={productIndex}
                    className="w-full md:w-1/2 xl:w-1/4 p-5"
                  >
                    <Card className="w-full space-y-5 p-4">
                      <Skeleton className="rounded-lg">
                        <div className="h-52 rounded-lg bg-default-300"></div>
                      </Skeleton>
                      <div className="space-y-3">
                        <Skeleton className="w-3/5 rounded-lg">
                          <div className="h-3 w-3/5 rounded-lg bg-default-200"></div>
                        </Skeleton>
                        <Skeleton className="w-4/5 rounded-lg">
                          <div className="h-3 w-4/5 rounded-lg bg-default-200"></div>
                        </Skeleton>
                        <Skeleton className="w-2/5 rounded-lg">
                          <div className="h-3 w-2/5 rounded-lg bg-default-300"></div>
                        </Skeleton>
                      </div>
                      <div className="flex gap-4">
                        <Skeleton className="w-32 rounded-lg">
                          <div className="h-10 rounded-lg bg-default-200"></div>
                        </Skeleton>
                        <Skeleton className="w-10 rounded-lg">
                          <div className="h-10 rounded-lg bg-default-200"></div>
                        </Skeleton>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-bold text-lg">All products</h2>
      <div className="flex flex-col mt-10 gap-10">
        {categories.map((category) => {
          const productsFilter = products.filter(
            (product) => product.category_id === category.id
          );
          return (
            <div key={category.id} className="flex flex-col">
              <div className="flex justify-between mb-5">
                <div>{category.name}</div>
                <Button
                  as={Link}
                  href={`/all-products/${category.id}`}
                  color="primary"
                  radius="full"
                  className="text-white"
                >
                  <p>See all {category.name}</p>
                </Button>
              </div>
              <div className="flex flex-wrap justify-start min-h-[200px]">
                {productsFilter.length > 0 ? (
                  productsFilter.map((product, index) => (
                    <div
                      key={product.id}
                      className="w-full md:w-1/2 xl:w-1/4 p-5"
                    >
                      <Link href={`/product/${product.id}`}>
                        <ProductCardSmall
                          isTopSeller={index === 0}
                          product={product}
                          cardButton={
                            <div className="flex gap-4">
                              <Button
                                as={Link}
                                href={`/product/${product.id}`}
                                color="primary"
                                variant="bordered"
                              >
                                <p>See detail</p>
                              </Button>
                              <Button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleAddToCart(product);
                                }}
                                radius="full"
                                className="z-10"
                                isIconOnly
                                color="primary"
                                isLoading={isAddingToCart}
                              >
                                <FaCartPlus color="white" size={20} />
                              </Button>
                            </div>
                          }
                        />
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="w-full flex items-center justify-center">
                    <EmptyComponents
                      title="No products available in this category"
                      subTitle=""
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <PopupModal
        message={modalMessage}
        isOpen={isOpen}
        onClose={onOpenChange}
      />
    </div>
  );
}
