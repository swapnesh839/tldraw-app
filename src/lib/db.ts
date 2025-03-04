import Dexie, { Table } from "dexie";

// Define the snapshot type
export interface Snapshot {
  id: string;
  data: unknown;
}

class TldrawDB extends Dexie {
  snapshots!: Table<Snapshot>;

  constructor() {
    super("swapnesh_Tldraw"); // Updated database name
    this.version(1).stores({
      snapshots: "id", // Primary key
    });
  }
}

// Create the database instance
export const db = new TldrawDB();
