import type { Metadata } from "next";
import { OrderScreen } from "@/components/deck/order-screen";

export const metadata: Metadata = { title: { absolute: "prototype" } };

export default function Page() {
  return <OrderScreen />;
}
