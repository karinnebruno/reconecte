import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date"); // formato: YYYY-MM-DD

  if (!date) {
    return NextResponse.json({ error: "date obrigatório" }, { status: 400 });
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
    });

    const calendar = google.calendar({ version: "v3", auth });
    const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";

    // Usa timezone America/Fortaleza (UTC-3)
    const timeMin = new Date(`${date}T00:00:00-03:00`).toISOString();
    const timeMax = new Date(`${date}T23:59:59-03:00`).toISOString();

    const { data } = await calendar.freebusy.query({
      requestBody: {
        timeMin,
        timeMax,
        timeZone: "America/Fortaleza",
        items: [{ id: calendarId }],
      },
    });

    const busy = data.calendars?.[calendarId]?.busy || [];

    const timeOptions = { hour: "2-digit", minute: "2-digit", timeZone: "America/Fortaleza" } as const;

    const ocupados = busy.map((slot) => ({
      inicio: new Date(slot.start!).toLocaleTimeString("pt-BR", timeOptions),
      fim: new Date(slot.end!).toLocaleTimeString("pt-BR", timeOptions),
    }));

    return NextResponse.json({ ocupados });
  } catch (err) {
    console.error("Google Calendar error:", err);
    return NextResponse.json({ ocupados: [] });
  }
}
