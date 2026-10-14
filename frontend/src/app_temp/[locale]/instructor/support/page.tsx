import SupportPage from "@/components/common/SupportPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support Formateur | Yinga Academia",
};

export default function InstructorSupport() {
  return <SupportPage role="instructor" />;
}
