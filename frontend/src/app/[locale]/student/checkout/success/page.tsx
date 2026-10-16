import { setRequestLocale } from "next-intl/server";
import CheckoutStatus from "./CheckoutStatus";

export default async function CheckoutSuccessPage({
	params,
	searchParams,
}: {
	params: Promise<{ locale: string }>;
	searchParams: Promise<{ order_id?: string; reference?: string; trxref?: string }>;
}) {
	const [{ locale }, query] = await Promise.all([params, searchParams]);
	setRequestLocale(locale);

	const orderId = query.order_id ?? null;
	const reference = query.reference || query.trxref || null;

	return <CheckoutStatus orderId={orderId} reference={reference} />;
}

