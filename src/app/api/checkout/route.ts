import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const { appointmentId, dataHora } = await req.json();

  if (!appointmentId) {
    return NextResponse.json({ error: "appointmentId obrigatório" }, { status: 400 });
  }

  const origin = req.headers.get("origin") || "https://app.psicologakarinnebruno.com";

  const descricao = dataHora
    ? new Date(dataHora).toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Sessão agendada";

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "brl",
          product_data: {
            name: "Sessão de Orientação",
            description: `Com Karinne Bruno · ${descricao}`,
          },
          unit_amount: 25000,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${origin}/agenda/sucesso?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/agenda/checkout?appointment=${appointmentId}`,
    metadata: {
      appointment_id: appointmentId,
    },
  });

  return NextResponse.json({ url: session.url });
}
