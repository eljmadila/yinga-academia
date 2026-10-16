"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { useLocale } from "next-intl";
import { resolveApiUrl } from "@/lib/api";

function getAccessToken() {
  const match = document.cookie.match(/(?:^|; )access_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : "";
}

export default function CertificateDownloadButton({
  courseId,
  className,
}: {
  courseId: string;
  className: string;
}) {
  const locale = useLocale();
  const isFrench = locale === "fr";
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const handleDownload = async () => {
    const token = getAccessToken();
    if (!token) {
      setError(
        isFrench
          ? "Veuillez vous reconnecter pour télécharger votre certificat."
          : "Please sign in again to download your certificate."
      );
      return;
    }

    setDownloading(true);
    setError("");
    try {
      const response = await fetch(
        resolveApiUrl(`/enrollments/certificate/?course_id=${encodeURIComponent(courseId)}`),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error(isFrench ? "Échec du téléchargement du certificat." : "Certificate download failed.");

      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = `Certificate_${courseId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (downloadError) {
      console.error(downloadError);
      setError(
        isFrench
          ? "Impossible de télécharger le certificat. Veuillez réessayer."
          : "Unable to download the certificate. Please try again."
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        className={`${className} disabled:cursor-wait disabled:opacity-60`}
      >
        {downloading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
        {isFrench ? "Télécharger le certificat PDF" : "Download PDF Certificate"}
      </button>
      {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}