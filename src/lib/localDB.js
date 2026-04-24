// Mock Supabase implementation using KVDB (Cloud Key-Value Store)
// This fulfills the requirement of a shared database across all clients without needing API keys.

const KVDB_BUCKET = 'VzEsCWMFimdAmxJaZaB66V';
const BASE_URL = `https://kvdb.io/${KVDB_BUCKET}`;

const storage = {
  get: async (key) => {
    try {
      const res = await fetch(`${BASE_URL}/${key}`);
      if (res.ok) {
        const text = await res.text();
        if (text) return JSON.parse(text);
      }
    } catch(e) {
      console.error("KVDB fetch error:", e);
    }
    // Fallback to localstorage
    return JSON.parse(localStorage.getItem(`mock_db_${key}`)) || [];
  },
  set: async (key, data) => {
    try {
      await fetch(`${BASE_URL}/${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch(e) {
      console.error("KVDB save error:", e);
    }
    localStorage.setItem(`mock_db_${key}`, JSON.stringify(data));
  },
};

// Initialize with some default data if empty
const initDefaults = async () => {
  const msgs = await storage.get('messages');
  if (!msgs || msgs.length === 0) {
    await storage.set('messages', [
      { id: 1, name: 'Antigravity', roll_no: '007', category: 'Appreciation', message: 'Welcome to your digital yearbook! This is now running on a cloud database.', created_at: new Date().toISOString(), likes: 5 },
      { id: 2, name: 'Memory Lane', roll_no: '2024', category: 'Memory', message: 'Remember that rainy day in the canteen?', created_at: new Date(Date.now() - 86400000).toISOString(), likes: 12 }
    ]);
  }
};

initDefaults();

class MockQuery {
  constructor(table) {
    this.table = table;
    this.operations = [];
    this.error = null;
  }

  select(query = '*') {
    this.operations.push({ type: 'select' });
    return this;
  }

  order(column, { ascending = true } = {}) {
    this.operations.push({ type: 'order', column, ascending });
    return this;
  }

  eq(column, value) {
    this.operations.push({ type: 'eq', column, value });
    return this;
  }

  insert(rows) {
    this.operations.push({ type: 'insert', rows });
    return this;
  }

  update(updates) {
    this.operations.push({ type: 'update', updates });
    return this;
  }

  upsert(row, options) {
    this.operations.push({ type: 'upsert', row, options });
    return this;
  }

  async execute() {
    let data = await storage.get(this.table);
    if (!Array.isArray(data)) data = [];

    for (const op of this.operations) {
      if (op.type === 'select') {
        // do nothing
      } else if (op.type === 'eq') {
        data = data.filter(item => item[op.column] === op.value);
      } else if (op.type === 'order') {
        data.sort((a, b) => {
          const valA = a[op.column];
          const valB = b[op.column];
          if (valA < valB) return op.ascending ? -1 : 1;
          if (valA > valB) return op.ascending ? 1 : -1;
          return 0;
        });
      } else if (op.type === 'insert') {
        const newData = op.rows.map(row => ({
          id: Math.random().toString(36).substr(2, 9),
          created_at: new Date().toISOString(),
          likes: 0,
          ...row
        }));
        const allData = [...(await storage.get(this.table) || []), ...newData];
        await storage.set(this.table, allData);
        data = newData;
      } else if (op.type === 'update') {
        const allData = await storage.get(this.table) || [];
        const updatedData = allData.map(item => {
          const isTarget = data.some(d => d.id === item.id);
          return isTarget ? { ...item, ...op.updates } : item;
        });
        await storage.set(this.table, updatedData);
        data = updatedData.filter(item => data.some(d => d.id === item.id));
      } else if (op.type === 'upsert') {
        const allData = await storage.get(this.table) || [];
        const { onConflict } = op.options || { onConflict: 'id' };
        const conflicts = onConflict.split(',');
        
        let index = allData.findIndex(item => 
          conflicts.every(c => item[c.trim()] === op.row[c.trim()])
        );

        let finalRow;
        if (index !== -1) {
          allData[index] = { ...allData[index], ...op.row };
          finalRow = allData[index];
        } else {
          finalRow = { id: Math.random().toString(36).substr(2, 9), created_at: new Date().toISOString(), ...op.row };
          allData.push(finalRow);
        }

        await storage.set(this.table, allData);
        data = [finalRow];
      }
    }
    return { data, error: this.error };
  }

  // Thenable for the final result
  then(onfulfilled) {
    return this.execute().then(onfulfilled);
  }
}

export const localDB = {
  from: (table) => new MockQuery(table),
};
