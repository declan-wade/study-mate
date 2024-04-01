export const dynamic = "force-dynamic";
import { sql } from '@vercel/postgres';

export async function GET() {
  const accountSid = process.env.TWILIO_SID;
  const authToken = process.env.TWILIO_TOKEN;
  const client = require("twilio")(accountSid, authToken);

  const data = await sql`SELECT COUNT(*) FROM tasks WHERE updated_at >= CURRENT_DATE - INTERVAL '3 days';`
  console.log(data.rows[0].count)
  const payload = data.rows[0].count
  if(payload === 0) {

   try {
    const message = await client.messages.create({
      body: `*Note:*\nNo tasks have been modified for three or more days!`,
      from: process.env.TWILIO_FROM,
      to: process.env.TWILIO_TO,
    });
    console.log(message.sid);
    return Response.json({ outcome: `sent message - tasks are stale: ${payload.length}` });
  } catch (error) {
    console.error(error);
    return Response.json({ outcome: "error", message: error.message });
  } 
}
else {
    return Response.json({ outcome: `All tasks up to date.` });
}
}


