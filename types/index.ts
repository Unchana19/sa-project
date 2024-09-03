import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export type Product = {
  image: string;
  price: number;
  name: string;
};

export interface ProductType {
  image: string;
  label: string;
}
