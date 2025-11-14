// import sqlite3 from 'sqlite3';

// export const db = new sqlite3.Database('./database.db')

import sqlite3 from "sqlite3";
import { open } from "sqlite";

export const dbPromise = open({
  filename: "./database.db",
  driver: sqlite3.Database,
});