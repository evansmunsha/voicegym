import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, successUrl, cancelUrl } = body;

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
    }

    if (!process.env.STRIPE_PRICE_ID) {
      return NextResponse.json({ error: "Missing STRIPE_PRICE_ID" }, { status: 500 });
    }

    // Build form-encoded payload for Stripe Checkout Session
    const params = new URLSearchParams();
    params.append("mode", "subscription");
    params.append("success_url", successUrl || "https://example.com/success");
    params.append("cancel_url", cancelUrl || "https://example.com/cancel");
    params.append("line_items[0][price]", process.env.STRIPE_PRICE_ID!);
    params.append("line_items[0][quantity]", "1");
    if (userId) params.append("metadata[userId]", userId);

    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error("Stripe error:", txt);
      return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
    }

    const json = await res.json();
    return NextResponse.json({ url: json.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
