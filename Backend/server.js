const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  port: 3006,
  user: 'root',
  password: 'Hassan#849',
  database: 'cams'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.code, err.sqlMessage);
    return;
  }
  console.log('Connected to MySQL');
});


const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, 'your_secret_key', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};



app.get('/yields/:landlordId', authenticateToken, (req, res) => {
  const { landlordId } = req.params;

  const query = `
    SELECT y.*, f.Location AS Field_Location, c.Crop_Name AS Crop_Name
    FROM Yield y
    JOIN Field f ON y.Field_ID = f.Field_ID
    JOIN Crop c ON y.Crop_ID = c.Crop_ID
    WHERE f.Landlord_ID = ?
  `;

  db.query(query, [landlordId], (err, results) => {
    if (err) {
      console.error('Error fetching yields:', err);
      return res.status(500).json({ message: 'Error fetching yields.' });
    }
    res.status(200).json(results);
  });
});

app.post('/add-yield', authenticateToken, (req, res) => {
  const { SFID, cropId, predictedYield, actualYield, year } = req.body;

  if (!SFID || !cropId || !predictedYield || !year) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  const query = `
    INSERT INTO Yield (Field_ID, Crop_ID, Predicted_Yield, Actual_Yield, Year)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(query, [SFID, cropId, predictedYield, actualYield || null, year], (err, result) => {
    if (err) {
      console.error('Error adding yield:', err);
      return res.status(500).json({ message: 'Error adding yield.' });
    }
    res.status(201).json({
      message: 'Yield added successfully.',
      yieldId: result.insertId,
    });
  });
});
app.delete('/remove-yield/:yieldId', authenticateToken, (req, res) => {
  const { yieldId } = req.params;

  const query = `DELETE FROM Yield WHERE Yield_ID = ?`;

  db.query(query, [yieldId], (err, result) => {
    if (err) {
      console.error('Error removing yield:', err);
      return res.status(500).json({ message: 'Error removing yield.' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Yield not found.' });
    }
    res.status(200).json({ message: 'Yield removed successfully.' });
  });
});





app.get('/expenses/:landlordId', authenticateToken, (req, res) => {
  const { landlordId } = req.params;
  const { fId } = req.query;

  if (!landlordId) {
    return res.status(400).json({ message: 'Landlord ID is required.' });
  }

  const query = fId
    ? `
      SELECT Expense.Expense_ID, Expense.Amount, Expense.Description, Expense.Expense_Type, 
             Expense.Date, Field.Location AS Field_Location
      FROM Expense
      LEFT JOIN Field ON Expense.Field_ID = Field.Field_Id
      WHERE Expense.Landlord_ID = ? AND Expense.Field_ID = ?
    `
    : `
      SELECT Expense.Expense_ID, Expense.Amount, Expense.Description, Expense.Expense_Type, 
             Expense.Date, Field.Location AS Field_Location
      FROM Expense
      LEFT JOIN Field ON Expense.Field_ID = Field.Field_ID
      WHERE Expense.Landlord_ID = ?
    `;

  const params = fId ? [landlordId, fId] : [landlordId];

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error fetching expenses:', err);
      return res.status(500).json({ message: 'Error fetching expenses.' });
    }
    res.status(200).json(results);
  });
});

app.delete('/remove-expense/:expenseId', authenticateToken, (req, res) => {
  const { expenseId } = req.params;

  if (!expenseId) {
    return res.status(400).json({ message: 'Expense ID is required.' });
  }

  const query = 'DELETE FROM Expense WHERE Expense_ID = ?';

  db.query(query, [expenseId], (err, result) => {
    if (err) {
      console.error('Error removing expense:', err);
      return res.status(500).json({ message: 'Error removing expense.' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Expense not found or already removed.' });
    }

    res.status(200).json({ message: 'Expense removed successfully.' });
  });
});

app.post('/add-expense', authenticateToken, (req, res) => {
    const { landlordId, fId, amount, description, expenseType, date } = req.body;
  
    if (!landlordId || !amount || !description || !expenseType || !date) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    // Validate Field_ID (fId)
    const fieldIdValue = fId && !isNaN(fId) ? fId : null;

    const query = `
      INSERT INTO Expense (Landlord_ID, Field_ID, Amount, Description, Expense_Type, Date)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
  
    db.query(query, [landlordId, fieldIdValue, amount, description, expenseType, date], (err, result) => {
      if (err) {
        console.error('Error adding expense:', err);
        return res.status(500).json({ message: 'Error adding expense.', error: err.sqlMessage });
      }
      res.status(201).json({
        message: 'Expense added successfully.',
        expenseId: result.insertId,
      });
    });
  });
  
app.get('/workers/:landlordId', authenticateToken, (req, res) => {
  const { landlordId } = req.params;

  const query = `
    SELECT Worker.Worker_ID, Worker.Name, Worker.Contact, Worker.Role, Worker.Assigned_Field_ID
    FROM Worker
    WHERE Worker.Landlord_ID = ?
  `;

  db.query(query, [landlordId], (err, results) => {
    if (err) {
      console.error('Error fetching workers:', err);
      return res.status(500).json({ message: 'Failed to fetch workers.' });
    }
    res.status(200).json(results);
  });
});
app.post('/add-worker', authenticateToken, (req, res) => {
  const { name, contact, role, assignedFieldId, landlordId } = req.body;

  if (!name || !contact || !role || !landlordId) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  const query = `
    INSERT INTO Worker (Name, Contact, Role, Assigned_Field_ID, Landlord_ID)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(query, [name, contact, role, assignedFieldId || null, landlordId], (err, result) => {
    if (err) {
      console.error('Error adding worker:', err);
      return res.status(500).json({ message: 'Failed to add worker.' });
    }

    res.status(201).json({
      Worker_ID: result.insertId,
      Name: name,
      Contact: contact,
      Role: role,
      Assigned_Field_ID: assignedFieldId,
    });
  });
});
app.delete('/remove-worker/:workerId', authenticateToken, (req, res) => {
  const { workerId } = req.params;

  const query = `
    DELETE FROM Worker
    WHERE Worker_ID = ?
  `;

  db.query(query, [workerId], (err, result) => {
    if (err) {
      console.error('Error removing worker:', err);
      return res.status(500).json({ message: 'Failed to remove worker.' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Worker not found.' });
    }

    res.status(200).json({ message: 'Worker removed successfully.' });
  });
});



app.get('/resources/:landlordId', authenticateToken, (req, res) => {
  const { landlordId } = req.params;

  const query = `SELECT * FROM Resource WHERE Landlord_ID = ?`;

  db.query(query, [landlordId], (err, results) => {
    if (err) {
      console.error('Error fetching resources:', err);
      return res.status(500).json({ message: 'Failed to fetch resources.' });
    }
    res.status(200).json(results);
  });
});
app.post('/add-resource', authenticateToken, (req, res) => {
  const { landlordId, name, quantity, unit, status } = req.body;

  if (!landlordId || !name || !quantity || !unit || !status) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  const query = `
    INSERT INTO Resource (Landlord_ID, Name, Quantity, Unit, Status)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(query, [landlordId, name, quantity, unit, status], (err, result) => {
    if (err) {
      console.error('Error adding resource:', err);
      return res.status(500).json({ message: 'Failed to add resource.' });
    }
    res.status(201).json({
      Resource_ID: result.insertId,
      Landlord_ID: landlordId,
      Name: name,
      Quantity: quantity,
      Unit: unit,
      Status: status,
    });
  });
});
app.delete('/remove-resource/:resourceId', authenticateToken, (req, res) => {
  const { resourceId } = req.params;

  const query = `DELETE FROM Resource WHERE Resource_ID = ?`;

  db.query(query, [resourceId], (err, result) => {
    if (err) {
      console.error('Error removing resource:', err);
      return res.status(500).json({ message: 'Failed to remove resource.' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Resource not found.' });
    }

    res.status(200).json({ message: 'Resource removed successfully.' });
  });
});





app.get('/landlord-info/:landlordId', authenticateToken, (req, res) => {
  const { landlordId } = req.params;
  const query = 'SELECT Name FROM Landlord WHERE Landlord_ID = ?';

  
    db.query(query, [landlordId], (err, results) => {
      if (err) {
        console.error("Database query error:", err);
        return res.status(500).json({ error: 'Database error' });
      }
  
      if (results.length === 0) {
        console.log("No landlord found with ID:", landlordId);
        return res.status(400).json({ error: 'Landlord not found' });
      }
  

       res.json(results[0]);

   });
});
app.get('/fields/:landlordId', authenticateToken, (req, res) => {
  const { landlordId } = req.params;

  if (!landlordId) {
    return res.status(400).json({ message: 'Landlord ID is required' });
  }

  const query = `SELECT * FROM Field WHERE Landlord_ID = ?`;

  db.query(query, [landlordId], (err, results) => {
    if (err) {
      console.error('Error fetching fields:', err);
      return res.status(500).json({ message: 'Error fetching fields' });
    }
    res.status(200).json(results);
  });
});

app.get('/managers/:landlordId', authenticateToken, (req, res) => {
  console.log(req.query.Landlord_ID);
  const {landlordId} = req.params;
  console.log("MAN",landlordId);
  const query = 'SELECT * FROM Landlord_Farm_Manager WHERE Landlord_ID = ?';
  db.query(query, [landlordId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

app.post('/add-field', authenticateToken, (req, res) => {
  const { size, location, landlordId, selectedManagerId } = req.body;
  if (!size || !location || !landlordId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const query = `
    INSERT INTO Field (Size, Location, Landlord_ID, Landlord_Manager_ID)
    VALUES (?, ?, ?, ?)
  `;

  db.query(query, [size, location, landlordId, selectedManagerId || null], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Field added successfully', fieldId: result.insertId });
  });
});

app.post('/add-crop', authenticateToken, (req, res) => {
  const { cropName, plantingDate, growthStage, fieldId } = req.body;

  if (!cropName || !plantingDate || !growthStage || !fieldId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const query = `
    INSERT INTO Crop (Crop_Name, Planting_Date, Growth_Stage, Field_ID)
    VALUES (?, ?, ?, ?)
  `;

  db.query(query, [cropName, plantingDate, growthStage, fieldId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ 
      message: 'Crop added successfully', 
      cropId: result.insertId 
    });
  });
});

app.get('/crops/:landlordId', authenticateToken, (req, res) => {
  const { landlordId } = req.params;


  const query = `SELECT  Crop.Crop_ID, Crop.Crop_Name, Crop.Planting_Date, Crop.Growth_Stage, 
      Crop.Field_ID FROM Crop JOIN  Field ON Crop.Field_ID = Field.Field_ID
    JOIN Landlord ON Field.Landlord_ID = Landlord.Landlord_ID WHERE Field.Landlord_ID = ?`;

  db.query(query, [landlordId], (err, results) => {
    if (err) {
      console.error("Error fetching crops:", err);
      return res.status(500).json({ error: "An error occurred while fetching crops" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "No crops found for this landlord" });
    }

    res.status(200).json(results);
  });
});


app.post('/add-machinery', authenticateToken, (req, res) => {
  const { landlordId, name, type, status } = req.body;
  db.query(
    'INSERT INTO Machinery (Landlord_ID, Name, Type, Status) VALUES (?, ?, ?, ?)',
    [landlordId, name, type, status],
    (err, result) => {
      if (err) {
        console.error('Error adding machinery:', err);
        return res.status(500).json({ message: 'Failed to add machinery.' });
      }
      res.status(201).json({
        Machinery_ID: result.insertId,
        Landlord_ID: landlordId,
        Name: name,
        Type: type,
        Status: status,
      });
    }
  );
});

app.get('/machinery/:landlordId', authenticateToken, (req, res) => {
  const { landlordId } = req.params;
  db.query('SELECT * FROM Machinery WHERE Landlord_ID = ?', [landlordId], (err, results) => {
    if (err) {
      console.error('Error fetching machinery:', err);
      return res.status(500).json({ message: 'Failed to fetch machinery.' });
    }
    res.status(200).json(results);
  });
});

app.delete('/remove-machinery/:machineryId', authenticateToken, (req, res) => {
  const { machineryId } = req.params;
  db.query('DELETE FROM Machinery WHERE Machinery_ID = ?', [machineryId], (err, result) => {
    if (err) {
      console.error('Error removing machinery:', err);
      return res.status(500).json({ message: 'Failed to remove machinery.' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Machinery not found or already deleted.' });
    }
    res.status(200).json({ message: 'Machinery removed successfully.' });
  });
});


app.post('/add-manager', authenticateToken, async (req, res) => {
  const { name, contact, username, password, landlordId } = req.body;

  try {
    const hashedPassword = await bcryptjs.hash(password, 10);

    const userQuery = 'INSERT INTO Users (Username, Password, Role, Landlord_ID) VALUES (?, ?, ?, ?)';
    db.query(userQuery, [username, hashedPassword, 'Manager', landlordId], (err, userResult) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }


      const managerQuery = 'INSERT INTO landlord_Farm_Manager (Name, Contact_Information, Landlord_ID,User_ID) VALUES (?, ?, ?,?)';
      db.query(managerQuery, [name, contact, landlordId,userResult.insertId], (err, managerResult) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Manager added successfully', id: managerResult.insertId });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Error adding manager' });
  }
});

app.delete('/remove-manager/:managerId', authenticateToken, (req, res) => {
  const { managerId } = req.params;

  const checkQuery = `
    SELECT COUNT(*) AS fieldCount
    FROM Field
    WHERE Landlord_Manager_ID = ?
  `;

  db.query(checkQuery, [managerId], (err, results) => {
    if (err) {
      console.error('Error checking manager assignments:', err);
      return res.status(500).json({ error: 'Error checking manager assignments' });
    }

    const fieldCount = results[0].fieldCount;

    if (fieldCount > 0) {
      return res.status(400).json({
        message: 'Manager cannot be removed because they are assigned to fields.',
      });
    }

    // Query to delete the manager if they are not assigned to any fields
    const deleteQuery = `
      DELETE FROM Landlord_Farm_Manager
      WHERE Landlord_Manager_ID = ?
    `;

    db.query(deleteQuery, [managerId], (err) => {
      if (err) {
        console.error('Error removing manager:', err);
        return res.status(500).json({ error: 'Error removing manager' });
      }

      res.status(200).json({ message: 'Manager removed successfully' });
    });
  });
});

app.delete('/remove-field/:fieldId', authenticateToken, (req, res) => {
  const { fieldId } = req.params;

  const checkQuery = `
    SELECT COUNT(*) AS cropCount
    FROM Crop
    WHERE Field_ID = ?
  `;

  db.query(checkQuery, [fieldId], (err, results) => {
    if (err) {
      console.error("Error checking for crops:", err);
      return res.status(500).json({ message: "An error occurred while checking for crops." });
    }

    const { cropCount } = results[0];

    // If crops exist, prevent deletion
    if (cropCount > 0) {
      return res.status(400).json({
        message: "This field cannot be removed because it has associated crops. Please remove the crops first.",
      });
    }

    console.log("CHECK");
    // Proceed with field deletion
    const deleteQuery = `DELETE FROM Field WHERE Field_ID = ?`;

    db.query(deleteQuery, [fieldId], (err, result) => {
      if (err) {
        console.error("Error removing field:", err);
        return res.status(500).json({ message: "An error occurred while trying to remove the field." });
      }

      res.status(200).json({ message: "Field removed successfully." });
    });
  });
});

app.delete('/remove-crop/:cropId', authenticateToken, (req, res) => {
  const { cropId } = req.params;

  const deleteQuery = `DELETE FROM Crop WHERE Crop_ID = ?`;

  db.query(deleteQuery, [cropId], (err, result) => {
    if (err) {
      console.error("Error removing crop:", err);
      return res.status(500).json({ message: "An error occurred while trying to remove the crop." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "The specified crop does not exist or has already been removed.",
      });
    }

    res.status(200).json({ message: "Crop removed successfully." });
  });
});



app.post('/signup', async (req, res) => {
  const { username, password, email, name, contactInformation } = req.body;

  if (!username || !password || !name) {
    return res.status(400).json({ error: 'Username, password, and name are required.' });
  }

  try {
    const hashedPassword = await bcryptjs.hash(password, 10);

    const landlordQuery = 'INSERT INTO Landlord (Name, Contact_Information) VALUES (?, ?)';
    db.query(landlordQuery, [name, contactInformation], (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const newLandlordID = result.insertId;
      const userQuery = 'INSERT INTO Users (Username, Password, Email, Role, Landlord_ID) VALUES (?, ?, ?, ?, ?)';
      db.query(userQuery, [username, hashedPassword, email, 'Landlord', newLandlordID], (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        return res.status(201).json({ message: 'Landlord signed up successfully.' });
      });
    });
  } catch (error) {
    return res.status(500).json({ error: 'Server error during signup.' });
  }
});


app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const query = 'SELECT * FROM Users WHERE Username = ?';
  db.query(query, [username], async (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err.message });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = results[0];
    const isMatch = await bcryptjs.compare(password, user.Password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Role-specific details
    const role = user.Role;
    const tokenPayload = { userId: user.User_ID, role };
    let additionalData = {};

    if (role === 'Landlord') {
      additionalData.landlordId = user.Landlord_ID; // Landlord-specific ID
    } else if (role === 'Manager') {
      // Fetch Manager details if role is Manager
      const managerQuery = `
        SELECT LFM.Landlord_ID, LFM.Landlord_Manager_ID 
        FROM Landlord_Farm_Manager AS LFM 
        WHERE LFM.User_ID = ?
      `;
    
      const managerResults = await new Promise((resolve, reject) =>
        db.query(managerQuery, [user.User_ID], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        })
      );
    
      if (managerResults.length > 0) {
        const managerData = managerResults[0];
        additionalData.landlordId = managerData.Landlord_ID; // Linked landlord ID for Manager
        additionalData.managerId = managerData.Landlord_Manager_ID; // Manager-specific ID
      } else {
        return res.status(400).json({ error: 'Manager not associated with any landlord' });
      }
    }

    const token = jwt.sign(tokenPayload, 'your_secret_key', { expiresIn: '1h' });

    res.status(200).json({
      token,
      role,
      ...additionalData,
    });
  });
});

app.get('/manager-info/:managerId', (req, res) => {
  const { managerId } = req.params; 

  const query = `
    SELECT 
      Name AS ManagerName, 
      Landlord_ID AS LandlordID 
    FROM Landlord_Farm_Manager
    WHERE Landlord_Manager_ID = ?
  `;

  db.query(query, [managerId], (err, results) => {
    if (err) {
      console.error('Database query error:', err.message);
      return res.status(500).json({ error: 'Failed to retrieve manager information.', details: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Manager not found.' });
    }

    res.status(200).json({
      managerName: results[0].ManagerName,
      landlordId: results[0].LandlordID,
    });
  });
});


app.get('/flds/:managerId', (req, res) => {
  const { managerId } = req.params;
  const query = `
    SELECT F.Field_ID, F.Size, F.Location, F.Landlord_ID, F.Landlord_Manager_ID
    FROM Field AS F
    WHERE F.Landlord_Manager_ID = ?;
  `;
  
  db.query(query, [managerId], (err, results) => {
    if (err) {
      console.error('Database query error:', err.message);
      return res.status(500).json({ error: 'Failed to retrieve fields.', details: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'No fields found for this manager.' });
    }

    res.status(200).json(results);
  });
});


app.get('/cropps/:managerId', (req, res) => {
  const { managerId } = req.params;

  const query = `
    SELECT 
      C.Crop_ID, 
      C.Crop_Name, 
      C.Planting_Date, 
      C.Growth_Stage, 
      F.Location AS Field_Location
    FROM Crop AS C
    INNER JOIN Field AS F ON C.Field_ID = F.Field_ID
    WHERE F.Landlord_Manager_ID = ?
  `;

  db.query(query, [managerId], (err, results) => {
    if (err) {
      console.error('Database query error:', err.message);
      return res.status(500).json({ error: 'Failed to retrieve crops.', details: err.message });
    }
    res.status(200).json(results);
  });
});

app.get('/machinery/:landlordId', (req, res) => {
  const { landlordId } = req.params;

  const query = `
    SELECT 
      Machinery_ID, 
      Name, 
      Type, 
      Status
    FROM Machinery
    WHERE Landlord_ID = ?
  `;

  db.query(query, [landlordId], (err, results) => {
    if (err) {
      console.error('Database query error:', err.message);
      return res.status(500).json({ error: 'Failed to retrieve machinery.', details: err.message });
    }

    res.status(200).json(results);
  });
});
app.get('/workers/:landlordId', (req, res) => {
  const { landlordId } = req.params;

  const query = `
    SELECT 
      Worker_ID, 
      Name, 
      Contact, 
      Role, 
      Assigned_Field_ID
    FROM Worker
    WHERE Landlord_ID = ?
  `;

  db.query(query, [landlordId], (err, results) => {
    if (err) {
      console.error('Database query error:', err.message);
      return res.status(500).json({ error: 'Failed to retrieve workers.', details: err.message });
    }

    res.status(200).json(results);
  });
});
app.get('/resources/:landlordId', (req, res) => {
  const { landlordId } = req.params;

  const query = `
    SELECT 
      Resource_ID, 
      Name, 
      Quantity, 
      Unit, 
      Status
    FROM Resource
    WHERE Landlord_ID = ?
  `;

  db.query(query, [landlordId], (err, results) => {
    if (err) {
      console.error('Database query error:', err.message);
      return res.status(500).json({ error: 'Failed to retrieve resources.', details: err.message });
    }

    res.status(200).json(results);
  });
});



app.put('/update-crop/:cropId', (req, res) => {
  const { cropId } = req.params;
  const { Crop_Name, Growth_Stage, Planting_Date } = req.body;

  // Query to update crop details
  const query = `
    UPDATE Crop
    SET Crop_Name = ?, Growth_Stage = ?, Planting_Date = ?
    WHERE Crop_ID = ?
  `;

  db.query(query, [Crop_Name, Growth_Stage, Planting_Date, cropId], (err, results) => {
    if (err) {
      console.error('Database query error:', err.message);
      return res.status(500).json({ error: 'Failed to update crop.', details: err.message });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Crop not found.' });
    }

    res.status(200).json({ message: 'Crop updated successfully.' });
  });
});


app.put('/update-machinery/:machineryId', (req, res) => {
  const { machineryId } = req.params;
  const { Name, Type, Status } = req.body;
  const query = `
    UPDATE Machinery
    SET Name = ?, Type = ?, Status = ?
    WHERE Machinery_ID = ?
  `;

  db.query(query, [Name, Type, Status, machineryId], (err, results) => {
    if (err) {
      console.error('Error updating machinery:', err.message);
      return res.status(500).json({ error: 'Failed to update machinery.' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Machinery not found.' });
    }

    res.status(200).json({ message: 'Machinery updated successfully.' });
  });
});


app.put('/update-resources/:resourceId', (req, res) => {
  const { resourceId } = req.params;
  const { Quantity, Status } = req.body;

  const query = `
    UPDATE Resource
    SET Quantity = ?, Status = ?
    WHERE Resource_ID = ?
  `;

  db.query(query, [Quantity, Status, resourceId], (err, results) => {
    if (err) {
      console.error('Error updating resource:', err.message);
      return res.status(500).json({ error: 'Failed to update resource.' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Resource not found.' });
    }

    res.status(200).json({ message: 'Resource updated successfully.' });
  });
});


app.put('/update-workers/:workerId', (req, res) => {
  const { workerId } = req.params;
  const { Name, Contact, Role, Assigned_Field_ID } = req.body;

  const query = `
    UPDATE Worker
    SET Name = ?, Contact = ?, Role = ?, Assigned_Field_ID = ?
    WHERE Worker_ID = ?
  `;

  db.query(query, [Name, Contact, Role, Assigned_Field_ID || null, workerId], (err, results) => {
    if (err) {
      console.error('Error updating worker:', err.message);
      return res.status(500).json({ error: 'Failed to update worker.' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Worker not found.' });
    }

    res.status(200).json({ message: 'Worker updated successfully.' });
  });
});

app.get('/fetch-expenses/:managerId', (req, res) => {
  const { managerId } = req.params;

  const query = `
    SELECT E.Expense_ID, E.Amount, E.Expense_Type, E.Description, E.Date
    FROM Expense AS E
    INNER JOIN Field AS F ON E.Field_ID = F.Field_ID
    WHERE F.Landlord_Manager_ID = ?
  `;

  db.query(query, [managerId], (err, results) => {
    if (err) {
      console.error('Error fetching expenses:', err.message);
      return res.status(500).json({ error: 'Failed to fetch expenses.' });
    }
    res.status(200).json(results);
  });
});
app.post('/add-expenses', (req, res) => {
  const { Landlord_ID, Field_ID, Amount, Expense_Type, Description, Date } = req.body;

  const query = `
    INSERT INTO Expense (Landlord_ID, Field_ID, Amount, Expense_Type, Description, Date)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [Landlord_ID, Field_ID || null, Amount, Expense_Type, Description, Date], (err, results) => {
    if (err) {
      console.error('Error adding expense:', err.message);
      return res.status(500).json({ error: 'Failed to add expense.' });
    }
    res.status(201).json({ message: 'Expense added successfully.', expenseId: results.insertId });
  });
});


app.put('/update-expenses/:expenseId', (req, res) => {
  const { expenseId } = req.params;
  const { Field_ID, Amount, Expense_Type, Description, Date } = req.body;

  const query = `
    UPDATE Expense
    SET Field_ID = ?, Amount = ?, Expense_Type = ?, Description = ?, Date = ?
    WHERE Expense_ID = ?
  `;

  db.query(query, [Field_ID || null, Amount, Expense_Type, Description, Date, expenseId], (err) => {
    if (err) {
      console.error('Error updating expense:', err.message);
      return res.status(500).json({ error: 'Failed to update expense.' });
    }
    res.status(200).json({ message: 'Expense updated successfully.' });
  });
});

app.delete('/del-expenses/:expenseId', (req, res) => {
  const { expenseId } = req.params;

  const query = `
    DELETE FROM Expense
    WHERE Expense_ID = ?
  `;

  db.query(query, [expenseId], (err) => {
    if (err) {
      console.error('Error deleting expense:', err.message);
      return res.status(500).json({ error: 'Failed to delete expense.' });
    }
    res.status(200).json({ message: 'Expense deleted successfully.' });
  });
});

app.get('/reports/expenses', authenticateToken, async (req, res) => {
  try {
    const { landlordId, startDate, endDate, expenseType } = req.query;

    if (!landlordId) {
      return res.status(400).json({ error: 'Missing landlordId in query parameters.' });
    }

    // Initialize query and parameters
    let query = `
      SELECT Expense_ID, Amount, Description, Expense_Type, Date, Field_ID
      FROM Expense
      WHERE Landlord_ID = ?
    `;
    const params = [landlordId];

    // Add conditions dynamically and push parameters
    if (startDate) {
      query += ' AND Date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND Date <= ?';
      params.push(endDate);
    }

    if (expenseType) {
      query += ' AND Expense_Type = ?';
      params.push(expenseType);
    }

    // Execute query with parameters
    db.query(query, params, (err, results) => {
      if (err) {
        console.error('Error fetching expenses:', err.message);
        return res.status(500).json({ error: 'Failed to fetch expenses.' });
      }
      res.status(200).json(results);
    });
  } catch (error) {
    console.error('Error fetching expense report:', error);
    res.status(500).json({ error: 'An error occurred while fetching expense report.' });
  }
});

app.get('/reports/cropperformance', authenticateToken,async (req, res) => {
  const { landlordId, selectedField, selectedCrop, startYear, endYear } = req.query;

  if (!landlordId) {
      return res.status(400).json({ error: 'Landlord ID is required.' });
  }

  // Base SQL query
  let query = `
      SELECT 
          y.Yield_ID,
          f.Location AS Field,
          c.Crop_Name,
          y.Predicted_Yield,
          y.Actual_Yield,
          y.Year
      FROM Yield y
      INNER JOIN Field f ON y.Field_ID = f.Field_ID
      INNER JOIN Crop c ON y.Crop_ID = c.Crop_ID
      WHERE f.Landlord_ID = ?`;

  const queryParams = [landlordId];

  if (selectedField) {
      query += ' AND f.Field_ID = ?';
      queryParams.push(selectedField);
  }

  if (selectedCrop) {
      query += ' AND c.Crop_ID = ?';
      queryParams.push(selectedCrop);
  }

  if (startYear) {
      query += ' AND y.Year >= ?';
      queryParams.push(startYear);
  }
  if (endYear) {
      query += ' AND y.Year <= ?';
      queryParams.push(endYear);
  }

  try {
      db.query(query, queryParams, (err, results) => {
          if (err) {
              console.error('Error fetching crop performance data:', err);
              return res.status(500).json({ error: 'Failed to fetch crop performance data.' });
          }
          res.status(200).json(results);
      });
  } catch (error) {
      console.error('Unexpected error:', error);
      res.status(500).json({ error: 'An unexpected error occurred.' });
  }
});



app.get('/reports/resourceutilization', (req, res) => {
  const { landlordId, resourceName, resourceStatus, selectedField } = req.query;

  if (!landlordId) {
    return res.status(400).json({ error: 'Landlord ID is required.' });
  }
  // Base query
  let query = `
    SELECT 
      Resource_ID,
      Name,
      Quantity,
      Unit,
      Status
    FROM resource
    WHERE Landlord_ID = ?
  `;

  // Array to hold query parameters
  const params = [landlordId];

  // Apply filters if provided
  if (resourceName) {
    query += ' AND Name LIKE ?';
    params.push(`%${resourceName}%`); // Partial match
  }

  if (resourceStatus) {
    query += ' AND Status = ?';
    params.push(resourceStatus);
  }

  if (selectedField) {
    query += ' AND Field_ID = ?';
    params.push(selectedField);
  }

  // Execute the query
  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error fetching resource utilization data:', err);
      return res.status(500).json({ error: 'Failed to fetch resource utilization data.' });
    }
    res.status(200).json(results);
  });
});

app.get('/reports/machineryusage', async (req, res) => {
  const { landlordId, machineryName, machineryStatus } = req.query;

    let query = `
      SELECT 
        Machinery_ID, Name, Status
      FROM 
        Machinery 
      WHERE 
        Landlord_ID = ?
    `;

    const params = [landlordId];

    if (machineryName) {
      query += ' AND Name LIKE ?';
      params.push(`%${machineryName}%`);
    }

    if (machineryStatus) {
      query += ' AND Status = ?';
      params.push(machineryStatus);
    }

    db.query(query, params, (err, results) => {
      if (err) {
        console.error('Error fetching resource utilization data:', err);
        return res.status(500).json({ error: 'Failed to fetch resource utilization data.' });
      }
      res.status(200).json(results);
    });
  });


  app.get('/roles/:landlordId', authenticateToken, async (req, res) => {
    try {
      const { landlordId } = req.params; // Correct casing
      const query = `
        SELECT DISTINCT Role
        FROM Worker
        WHERE Landlord_ID = ?
      `;
      db.query(query, [landlordId], (err, results) => {
        if (err) {
          console.error('Error fetching roles:', err.message);
          return res.status(500).json({ error: 'Failed to fetch roles.' });
        }
        const roles = results.map((row) => row.Role);
        res.status(200).json(roles);
      });
    } catch (error) {
      console.error('Error in roles endpoint:', error);
      res.status(500).json({ error: 'An error occurred.' });
    }
  });
  
  
  app.get('/reports/workeractivity', authenticateToken, async (req, res) => {
    try {
      const { landlordId, workerName, workerContact, workerRole, selectedField } = req.query;
  
      if (!landlordId) {
        return res.status(400).json({ error: 'Landlord ID is required.' });
      }
  
      let query = `
        SELECT 
          Worker.Worker_ID, 
          Worker.Name, 
          Worker.Contact, 
          Worker.Role, 
          Field.Location AS Field_Location
        FROM 
          Worker
        LEFT JOIN 
          Field ON Worker.Assigned_Field_ID = Field.Field_ID
        WHERE 
          Worker.Landlord_ID = ?
      `;
  
      const params = [landlordId];
  
      // Add filters dynamically
      if (workerName) {
        query += ' AND Worker.Name LIKE ?';
        params.push(`%${workerName}%`);
      }
  
      if (workerContact) {
        query += ' AND Worker.Contact LIKE ?';
        params.push(`%${workerContact}%`);
      }
  
      if (workerRole) {
        query += ' AND Worker.Role = ?';
        params.push(workerRole);
      }
  
      if (selectedField) {
        query += ' AND Worker.Assigned_Field_ID = ?';
        params.push(selectedField);
      }
  
      query += ' ORDER BY Worker.Name';
  
      console.log('Generated Query:', query);
  
      // Execute the query
      db.query(query, params, (err, results) => {
        if (err) {
          console.error('Error fetching worker activity data:', err.message);
          return res.status(500).json({ error: 'Failed to fetch worker activity data.' });
        }
        res.status(200).json(results);
      });
    } catch (error) {
      console.error('Error in Worker Activity endpoint:', error);
      res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
  });
  
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});







