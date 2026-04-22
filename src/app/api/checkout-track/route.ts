import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const { trackId, trackSlug, trackTitulo, trackEmoji } = await req.json();

  if (!trackId || !trackSlug) {
    return NextResponse.json({ error: "trackId obrigatório" }, { status: 400 });
  }

  const origin = req.headers.get("origin") || "https://app.psicologakarinnebruno.com";

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "brl",
          product_data: {
            name: `${trackEmoji || "📚"} ${trackTitulo || "Desafio"}`,
            description: "Acesso completo ao desafio no Reconecte",
          },
          unit_amount: 1500, // R$ 15,00
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${origin}/trilhas/${trackSlug}?compra=sucesso`,
    cancel_url: `${origin}/trilhas`,
    metadata: {
      track_id: trackId,
      track_slug: trackSlug,
      type: "track_purchase",
    },
  });

  return NextResponse.json({ url: session.url });
}
