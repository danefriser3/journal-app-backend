require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
import { createClient } from "@vercel/postgres";
import { Request, Response } from "express";

const bodyParser = require("body-parser");

// Create application/x-www-form-urlencoded parser
const urlencodedParser = bodyParser.urlencoded({ extended: false });

const client = createClient();
client.connect();

app.use(express.static("public"));
app.use(cors());
app.use(express.json()); // Parse JSON bodies

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  created_at: Date;
  updated_at?: Date;
  user_id?: string;
}

app.get("/journal_entries/:id", async (req: Request, res: Response) => {
  try {
    const { rows: journal_entries } =
      await client.sql`SELECT * FROM journal_entry WHERE user_id = ${req.params.id} ORDER BY created_at DESC`;
    res.status(200).json(journal_entries);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching expenses");
  }
});
app.post("/users", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const { rows: user } =
      await client.sql`SELECT * FROM users where email = ${email} and password = ${password}`;
    res.status(200).json(user[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching user");
  }
});

app.delete("/journal_entries/:id", async (req: Request, res: Response) => {
  try {
    await client.sql`DELETE FROM journal_entry WHERE id = ${req.params.id}`;
    res.status(200).send("Expense deleted successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting expense");
  }
});

app.post(
  "/journal_entries",
  urlencodedParser,
  async (req: Request, res: Response) => {
    const { content, created_at, title, updated_at, user_id }: JournalEntry =
      req.body;
    try {
      await client.sql`INSERT INTO journal_entry (title, content, created_at, updated_at, user_id) VALUES (${title}, ${content}, ${created_at.toLocaleString()}, ${updated_at?.toLocaleString()}, ${user_id})`;
      res.status(201).send("Expense added successfully");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error adding expense");
    }
  }
);
app.put("/users", async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  try {
    await client.sql`INSERT INTO users (name, email, password) VALUES (${name}, ${email}, ${password})`;
    res.status(201).send("User added successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error adding user");
  }
});
app.listen(3000, () => console.log("Server ready on port 3000."));

module.exports = app;
