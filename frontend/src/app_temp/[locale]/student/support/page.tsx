import SupportPage from "@/components/common/SupportPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support | Yinga Academia",
};

export default function StudentSupport() {
  return <SupportPage role="student" />;
}
