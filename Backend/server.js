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

  // Attempt to delete the crop
  const deleteQuery = `DELETE FROM Crop WHERE Crop_ID = ?`;

  db.query(deleteQuery, [cropId], (err, result) => {
    if (err) {
      console.error("Error removing crop:", err);
      return res.status(500).json({ message: "An error occurred while trying to remove the crop." });
    }

    // If no rows were affected, the crop does not exist
    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "The specified crop does not exist or has already been removed.",
      });
    }

    // Successful deletion
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
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = results[0];
    const isMatch = await bcryptjs.compare(password, user.Password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const landlordId = user.Landlord_ID || null;
    const token = jwt.sign({ userId: user.User_ID, role: user.Role }, 'your_secret_key', { expiresIn: '1h' });
    res.status(200).json({ token, landlordId });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});







