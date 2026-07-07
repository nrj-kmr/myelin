import { NextResponse } from "next/server";
import { ImapFlow } from "imapflow";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { host, port, user, pass } = body;

    if (!host || !user || !pass) {
      return NextResponse.json(
        { error: "Missing required configuration fields (IMAP host, user, or pass)" },
        { status: 400 }
      );
    }

    const client = new ImapFlow({
      host,
      port: Number(port) || 993,
      secure: true,
      auth: {
        user,
        pass,
      },
      logger: false,
    });

    await client.connect();

    // Select INBOX mailbox
    const lock = await client.getMailboxLock("INBOX");
    const emails: any[] = [];

    try {
      const mailbox = client.mailbox;
      const totalMessages = mailbox && typeof mailbox !== "boolean" ? mailbox.exists : 0;

      if (totalMessages > 0) {
        // Fetch the last 10 messages in sequence
        const start = Math.max(1, totalMessages - 9);
        const range = `${start}:${totalMessages}`;

        for await (const msg of client.fetch(range, { envelope: true })) {
          if (msg.envelope) {
            const sender = msg.envelope.from?.[0];
            const senderName = sender?.name || sender?.address || "Unknown Sender";
            
            emails.push({
              sender: senderName,
              subject: msg.envelope.subject || "(No Subject)",
              summary: "AI Priority Alert: Scan verified from mail header.",
              time: msg.envelope.date
                ? new Date(msg.envelope.date).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Unknown",
              dateRaw: msg.envelope.date,
            });
          }
        }
      }
    } finally {
      // Always release the lock
      lock.release();
    }

    await client.logout();

    // Sort emails by raw date (newest first)
    emails.sort((a, b) => {
      const dateA = a.dateRaw ? new Date(a.dateRaw).getTime() : 0;
      const dateB = b.dateRaw ? new Date(b.dateRaw).getTime() : 0;
      return dateB - dateA;
    });

    return NextResponse.json({ emails });
  } catch (error: any) {
    console.error("IMAP Connection / Fetch Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to establish IMAP server connection. Please verify your credentials/app password." },
      { status: 500 }
    );
  }
}
