"use server"
import { sql } from '@vercel/postgres';
 
export async function putTask(description: any, subject: any, dueDate: any) {
  try {
    const result =
      await sql`INSERT INTO tasks (description, duedate, subject) VALUES (${description}, ${dueDate}, ${subject});`;
      console.log(result)
    return "success";
  } catch (error) {
    console.log(error)
    return "error";
  }
}

export async function getTasks() {
  try {
    const result =
      await sql`SELECT * FROM tasks ORDER BY CASE WHEN complete THEN 1 ELSE 0 END, id DESC;`;
      console.log(result)
    return result;
  } catch (error) {
    console.log(error)
    return "error";
  }
}

export async function deleteTask(id: any) {
  try {
    const result =
      await sql`DELETE FROM tasks WHERE id = ${id};`;
      console.log(result)
      return "success";
  } catch (error) {
    console.log(error)
    return  "error";
  }
}

export async function toggleTask(id: any) {
  try {
    const result =
      await sql`UPDATE tasks SET complete = NOT complete WHERE id = ${id};`;
      console.log(result)
      return "success";
  } catch (error) {
    console.log(error)
    return  "error";
  }
}