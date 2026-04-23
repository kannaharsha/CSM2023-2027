// Mock Supabase implementation using LocalStorage
// This removes the dependency on an external database while keeping the site functional.

const storage = {
  get: (key) => JSON.parse(localStorage.getItem(`mock_db_${key}`)) || [],
  set: (key, data) => localStorage.setItem(`mock_db_${key}`, JSON.stringify(data)),
};

// Initialize with some default data if empty
const initDefaults = () => {
  if (storage.get('messages').length === 0) {
    storage.set('messages', [
      { id: 1, name: 'Antigravity', roll_no: '007', category: 'Appreciation', message: 'Welcome to your digital yearbook! This is now running locally.', created_at: new Date().toISOString(), likes: 5 },
      { id: 2, name: 'Memory Lane', roll_no: '2024', category: 'Memory', message: 'Remember that rainy day in the canteen?', created_at: new Date(Date.now() - 86400000).toISOString(), likes: 12 }
    ]);
  }
};

initDefaults();

class MockQuery {
  constructor(table) {
    this.table = table;
    this.data = storage.get(table);
    this.error = null;
  }

  select(query = '*') {
    return this;
  }

  order(column, { ascending = true } = {}) {
    this.data.sort((a, b) => {
      const valA = a[column];
      const valB = b[column];
      if (valA < valB) return ascending ? -1 : 1;
      if (valA > valB) return ascending ? 1 : -1;
      return 0;
    });
    return this;
  }

  eq(column, value) {
    this.data = this.data.filter(item => item[column] === value);
    return this;
  }

  insert(rows) {
    const newData = rows.map(row => ({
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      likes: 0,
      ...row
    }));
    const allData = [...storage.get(this.table), ...newData];
    storage.set(this.table, allData);
    this.data = newData;
    return this;
  }

  update(updates) {
    const allData = storage.get(this.table);
    const updatedData = allData.map(item => {
      const isTarget = this.data.some(d => d.id === item.id);
      return isTarget ? { ...item, ...updates } : item;
    });
    storage.set(this.table, updatedData);
    this.data = updatedData.filter(item => this.data.some(d => d.id === item.id));
    return this;
  }

  upsert(row, options) {
    const allData = storage.get(this.table);
    const { onConflict } = options || { onConflict: 'id' };
    const conflicts = onConflict.split(',');
    
    let index = allData.findIndex(item => 
      conflicts.every(c => item[c.trim()] === row[c.trim()])
    );

    let finalRow;
    if (index !== -1) {
      allData[index] = { ...allData[index], ...row };
      finalRow = allData[index];
    } else {
      finalRow = { id: Math.random().toString(36).substr(2, 9), created_at: new Date().toISOString(), ...row };
      allData.push(finalRow);
    }

    storage.set(this.table, allData);
    this.data = [finalRow];
    return this;
  }

  // Thenable for the final result
  then(onfulfilled) {
    return Promise.resolve({ data: this.data, error: this.error }).then(onfulfilled);
  }
}

export const localDB = {
  from: (table) => new MockQuery(table),
};
