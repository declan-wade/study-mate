export const dynamic = "force-dynamic";
import { sql } from '@vercel/postgres';
import { format, parseISO  } from "date-fns";

export async function GET() {
  const accountSid = process.env.TWILIO_SID;
  const authToken = process.env.TWILIO_TOKEN;
  const client = require("twilio")(accountSid, authToken);

  const data = await sql`SELECT * FROM tasks WHERE duedate < CURRENT_DATE AND complete = FALSE;`
  console.log(data.rows)
  const payload = data.rows
  if(payload.length > 0){
  const formattedTasks = payload.map(task => {
    return `*New Overdue Tasks:*\nDescription: ${task.description}\nSubject: ${task.subject}\nDue Date: ${format((task.duedate), 'dd MMMM')}\n`;
  }).join('\n');

  try {
    const message = await client.messages.create({
      body: `${formattedTasks}`,
      from: process.env.TWILIO_FROM,
      to: process.env.TWILIO_TO,
    });
    console.log(message.sid);
    return Response.json({ outcome: `sent message - total overdue tasks: ${payload.length}` });
  } catch (error) {
    console.error(error);
    return Response.json({ outcome: "error", message: error.message });
  }
}
else {
    return Response.json({ outcome: `No overdue tasks.` });
}
}


