import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const { appointmentId } = await req.json();
  if (!appointmentId) {
    return NextResponse.json({ error: "appointmentId obrigatório" }, { status: 400 });
  }

  const supabase = createClient();
  const { data: appointment } = await supabase
    .from("appointments")
    .select("id, data_hora, user_id")
    .eq("id", appointmentId)
    .single();

  if (!appointment) {
    return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 });
  }

  const origin = req.headers.get("origin") || "https://app.psicologakarinnebruno.com";

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "brl",
          product_data: {
            name: "Sessão de Orientação",
            description: `Com Karinne Bruno · ${new Date(appointment.data_hora).toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              hour: "2-digit",
              minute: "2-digit",
            })}`,
          },
          unit_amount: 25000, // R$ 250,00 em centavos
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${origin}/agenda/sucesso?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/agenda/checkout?appointment=${appointmentId}`,
    metadata: {
      appointment_id: appointmentId,
      user_id: appointment.user_id,
    },
  });

  return NextResponse.json({ url: session.url });
}
