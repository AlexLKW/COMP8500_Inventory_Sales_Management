const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt');
const app = express();

app.use(express.json());
app.use(cors());

const config = require('./config.json');

const dbConfig = {
  host: config.host,
  user: config.username,
  password: config.password,
  database: config.database,
};

async function createDbConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    return connection;
  } catch (error) {
    console.error('Error creating database connection:', error);
    throw error;
  }
}


// User Management Handler
async function loginHandler(req, res) {
  let connection;
    try {
        const { username, password } = req.body;
        connection = await createDbConnection();

        const [users] = await connection.execute('SELECT * FROM Users WHERE username = ?', [username]);

        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const user = users[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Don't send the password back to the client
        const { password: _, ...userWithoutPassword } = user;
        res.json({ message: 'Login successful', user: userWithoutPassword });

    } catch (err) {
        console.error('Error in login:', err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        if (connection) await connection.end();
    }
}

async function registerHandler(req, res) {
  let connection;
  try {
      const { username, password, fname, lname, gender, address, email } = req.body;
      connection = await createDbConnection();

      // Check if username already exists
      const [existingUsers] = await connection.execute('SELECT * FROM Users WHERE username = ?', [username]);
      if (existingUsers.length > 0) {
          return res.status(400).json({ message: 'Username already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await connection.execute(
          'INSERT INTO Users (username, password, fname, lname, gender, address, email) VALUES (?, ?, ?, ?, ?, ?, ?)', 
          [username, hashedPassword, fname, lname, gender, address, email]
      );

      res.json({ message: 'User created successfully' });

  } catch (err) {
      console.error('Error in register:', err);
      res.status(500).json({ message: 'Server error' });
  } finally {
      if (connection) await connection.end();
  }
}

async function getUsersHandler(req, res) {
  let connection;
  try {
    connection = await createDbConnection();
    const [rows] = await connection.execute('SELECT uid, username, fname, lname, email FROM Users');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Error fetching users' });
  } finally {
    if (connection) await connection.end();
  }
}

async function addUserHandler(req, res) {
  let connection;
  try {
    const { username, password, fname, lname, email } = req.body;
    connection = await createDbConnection();
    const hashedPassword = await bcrypt.hash(password, 10);
    await connection.execute(
      'INSERT INTO Users (username, password, fname, lname, email) VALUES (?, ?, ?, ?, ?)',
      [username, hashedPassword, fname, lname, email]
    );
    res.json({ message: 'User added successfully' });
  } catch (err) {
    console.error('Error adding user:', err);
    res.status(500).json({ error: 'Error adding user' });
  } finally {
    if (connection) await connection.end();
  }
}

async function removeUserHandler(req, res) {
  let connection;
  try {
    const uid = req.params.uid;
    connection = await createDbConnection();
    await connection.execute('DELETE FROM Users WHERE uid = ?', [uid]);
    res.json({ message: 'User removed successfully' });
  } catch (err) {
    console.error('Error removing user:', err);
    res.status(500).json({ error: 'Error removing user' });
  } finally {
    if (connection) await connection.end();
  }
}

async function resetPasswordHandler(req, res) {
  let connection;
  try {
    const { uid, newPassword } = req.body;
    connection = await createDbConnection();
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await connection.execute('UPDATE Users SET password = ? WHERE uid = ?', [hashedPassword, uid]);
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('Error resetting password:', err);
    res.status(500).json({ error: 'Error resetting password' });
  } finally {
    if (connection) await connection.end();
  }
}

async function logoutHandler(req, res) {
  // Implement logout functionality (e.g., clearing session)
  res.json({ message: 'Logged out successfully' });
}

// Inventory Management Handlers
async function addItemHandler(req, res) {
  let connection;
  try {
    const { sku, ...itemFields } = req.body;

    if (!sku) {
      return res.status(400).json({ error: "SKU is required." });
    }

    connection = await createDbConnection();
    const [existingItem] = await connection.execute('SELECT * FROM Items WHERE sku = ?', [sku]);

    if (existingItem.length > 0) {
      // Item exists, update quantity
      const newQuantity = parseInt(existingItem[0].quantity) + parseInt(quantity || 0);
      await connection.execute(
        'UPDATE Items SET quantity = ? WHERE sku = ?',
        [newQuantity, sku]
      );
      return res.json({ message: `Item quantity updated. New quantity: ${newQuantity}` });
    }

    // Item doesn't exist, add new item
    const fields = ['name', 'quantity', 'size', 'color', 'description', 'imageUrl', 'category', 'buyPrice', 'sellPrice', 'minStock'];
    const values = fields.map(field => {
      if (field in itemFields) {
        if (field === 'quantity' || field === 'minStock') return parseInt(itemFields[field]) || 0;
        if (field === 'buyPrice' || field === 'sellPrice') return parseFloat(itemFields[field]) || 0;
        return itemFields[field];
      }
      return null;
    });

    await connection.execute(
      'INSERT INTO Items (sku, ' + fields.join(', ') + ') VALUES (?, ' + fields.map(() => '?').join(', ') + ')',
      [sku, ...values]
    );

    res.json({ message: 'New item added successfully' });

  } catch (err) {
    console.error('Error in addItemHandler:', err);
    res.status(500).json({ error: `Error adding/updating item in inventory. Please check if the item already existed` });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function removeItemHandler(req, res) {
  let connection;
  try {
    const { sku } = req.body;
    connection = await createDbConnection();
    const [existingItem] = await connection.execute('SELECT * FROM Items WHERE sku = ?', [sku]);

    if (existingItem.length > 0) {
      await connection.execute('DELETE FROM Items WHERE sku = ?', [sku]);
      res.json({ message: 'Item removed successfully' });
    } else {
      res.status(404).json({ error: `Item with SKU ${sku} not found` });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: `Error removing item from inventory: ${err.message}` });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function updateItemHandler(req, res) {
  let connection;
  try {
    const { sku, ...updateFields } = req.body;
    connection = await createDbConnection();
    const [existingItem] = await connection.execute('SELECT * FROM Items WHERE sku = ?', [sku]);

    if (existingItem.length > 0) {
      if (Object.keys(updateFields).length > 0) {
        const updateQuery = Object.keys(updateFields).map(field => `${field} = ?`).join(', ');
        const updateValues = Object.keys(updateFields).map(field => {
          const value = updateFields[field];
          if (field === 'quantity' || field === 'minStock') return parseInt(value);
          if (field === 'buyPrice' || field === 'sellPrice') return parseFloat(value);
          return value;
        });

        await connection.execute(`UPDATE Items SET ${updateQuery} WHERE sku = ?`, [...updateValues, sku]);
        res.json({ message: 'Item updated successfully' });
      } else {
        res.json({ message: 'No fields to update' });
      }
    } else {
      res.status(404).json({ error: `Item with SKU ${sku} not found` });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: `Error updating item in inventory: ${err.message}` });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function viewInventoryHandler(req, res) {
  try {
    const db = await createDbConnection();
    const [rows] = await db.execute('SELECT * FROM Items');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send(`Error viewing inventory: ${err.message}`);
  }
}

// Sales Management Handlers
async function createSaleHandler(req, res) {
  let connection;
  try {
      const { uid, items, totalAmount } = req.body;
      connection = await createDbConnection();

      // Start transaction
      await connection.beginTransaction();

      // --- STOCK CHECK --- 
      for (const item of items) {
        const [stockResult] = await connection.execute(
          'SELECT quantity FROM Items WHERE sku = ?', 
          [item.sku]
        );

        if (stockResult.length === 0) {
          await connection.rollback(); // Item doesn't exist
          return res.status(404).json({ message: `Item with SKU ${item.sku} not found` });
        }

        const availableQuantity = stockResult[0].quantity;

        if (item.quantity > availableQuantity) {
          await connection.rollback(); // Not enough stock
          return res.status(400).json({ 
            message: `Not enough stock for item with SKU ${item.sku}. Available: ${availableQuantity}` 
          });
        }
      } 

      // Create sale record
      const [saleResult] = await connection.execute(
          'INSERT INTO Sales (uid, totalAmount, saleDate, status) VALUES (?, ?, NOW(), ?)',
          [uid, totalAmount, 'COMPLETED']
      );
      const saleId = saleResult.insertId;

      // Add order items
      for (const item of items) {
          // Insert order item
          await connection.execute(
              'INSERT INTO OrderItems (saleId, sku, quantity, price) VALUES (?, ?, ?, ?)',
              [saleId, item.sku, item.quantity, item.price]
          );

          // Update inventory
          await connection.execute(
              'UPDATE Items SET quantity = quantity - ? WHERE sku = ?',
              [item.quantity, item.sku]
           );
      }

      // Commit transaction
      await connection.commit();

      res.json({ message: 'Sale created successfully', saleId });
  } catch (error) {
      if (connection) {
          await connection.rollback();
      }
      console.error(error);
      res.status(500).json({ message: 'Failed to create sale' });
  } finally {
      if (connection) {
          await connection.end();
      }
  }
}

async function getSalesHistoryHandler(req, res) {
  let connection;
  try {
    connection = await createDbConnection();

    // Simplified query to fetch all sales history
    const query = `SELECT s.saleId, s.uid, s.totalAmount, s.saleDate, s.status, 
                    GROUP_CONCAT(oi.sku, ' x ', oi.quantity) AS items 
                    FROM Sales s 
                    LEFT JOIN OrderItems oi ON s.saleId = oi.saleId 
                    GROUP BY s.saleId, s.uid, s.totalAmount, s.saleDate, s.status 
                    ORDER BY s.saleDate DESC`; // Removed WHERE clause

    const [salesResult] = await connection.execute(query);

    res.json(salesResult);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to retrieve sales history' });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function itemsHandler(req, res) {
  let connection;
  try {
    const sku = req.params.sku; // Get the SKU from the URL
    connection = await createDbConnection();

    // Fetch the item from the database
    const [rows] = await connection.execute('SELECT * FROM Items WHERE sku = ?', [sku]);

    if (rows.length === 0) {
      // Item not found
      return res.status(404).json({ message: `Item with SKU ${sku} not found` });
    } 

    // Item found, send it as JSON response
    res.json(rows[0]); 

  } catch (err) {
    console.error(`Error fetching item with SKU ${req.params.sku}:`, err);
    res.status(500).json({ error: 'Error fetching item from database' });
  } finally {
    if (connection) {
      await connection.end(); 
    }
  }
}

// User Management
app.post('/login', loginHandler);
app.post('/register', registerHandler);
app.get('/users', getUsersHandler);
app.post('/users', addUserHandler);
app.delete('/users/:uid', removeUserHandler);
app.post('/users/resetPassword', resetPasswordHandler);
app.post('/logout', logoutHandler);

// Inventory Management
app.post('/addItem', addItemHandler);
app.post('/removeItem', removeItemHandler);
app.post('/updateItem', updateItemHandler);
app.get('/viewInventory', viewInventoryHandler);

// Sales Management
app.post('/api/createSale', createSaleHandler);
app.get('/api/salesHistory', getSalesHistoryHandler);
app.get('/api/items/:sku', itemsHandler);

app.listen(3000, () => {
  console.log('Server started on port 3000');
});