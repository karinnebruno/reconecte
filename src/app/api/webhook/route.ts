import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Configuração de webhook ausente" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const supabase = createClient();

    if (session.metadata?.type === "track_purchase") {
      const trackId = session.metadata.track_id;
      const userId = session.customer_details?.email
        ? (await supabase.from("profiles").select("id").eq("email", session.customer_details.email).single()).data?.id
        : null;

      if (trackId && userId) {
        await supabase.from("user_track_purchases").upsert({
          user_id: userId,
          track_id: trackId,
          stripe_session_id: session.id,
        });
      }
    } else {
      const appointmentId = session.metadata?.appointment_id;
      if (appointmentId) {
        await supabase
          .from("appointments")
          .update({ status: "confirmed", stripe_session_id: session.id })
          .eq("id", appointmentId);
      }
    }
  }

  return NextResponse.json({ received: true });
}
