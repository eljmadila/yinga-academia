import { setRequestLocale } from "next-intl/server";
import CheckoutStatus from "./CheckoutStatus";

export default async function CheckoutSuccessPage({
	params,
	searchParams,
}: {
	params: Promise<{ locale: string }>;
	searchParams: Promise<{ order_id?: string }>;
}) {
	const [{ locale }, { order_id: orderId }] = await Promise.all([params, searchParams]);
	setRequestLocale(locale);

	return <CheckoutStatus orderId={orderId ?? null} />;
}
