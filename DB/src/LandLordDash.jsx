import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const LandlordDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

const [cropName, setCropName] = useState("");
const [plantingDate, setPlantingDate] = useState("");
const [growthStage, setGrowthStage] = useState("");
const [selectedFieldId, setSelectedFieldId] = useState("");
const [crops, setCrops] = useState([]); // Initially, no crops
  
  const [landlordName, setLandlordName] = useState('');
  const [managers, setManagers] = useState([]);
  const [managerName, setManagerName] = useState('');
  const [managerContact, setManagerContact] = useState('');
  const [managerUsername, setManagerUsername] = useState('');
  const [managerPassword, setManagerPassword] = useState('');
  const [managerID, setManagerId]=useState(''); 
  const [selectedManagerId, setSelectedManagerId] = useState(''); // State for selected manager ID
  const [fields, setFields] = useState([]); // State to hold fields data
  const [fieldSize, setFieldSize] = useState('');
  const [fieldLocation, setFieldLocation] = useState('');
  const [loading, setLoading] = useState(false); // Track loading state
  const [error, setError] = useState(null); //
  const landlordId = location.state?.landlordId || localStorage.getItem('landlordId');

  useEffect(() => {
    if (!landlordId) {
      navigate('/login');
    } else {
      fetchLandlordInfo();
      fetchManagers();
      fetchFields();
      fetchCrops();
    }
    console.log(managers);
    console.log(fields);
  }, [landlordId]);

  const fetchLandlordInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3001/landlord-info/${landlordId}`, {
        headers: { Authorization: token },
      });
      console.log("NAME",response.data.Name);
      setLandlordName(response.data.Name);
    } catch (error) {
      console.error("Error fetching landlord info:", error);
    }
  };
  const fetchManagers = async () => {
    try {
      const token = localStorage.getItem('token');
      //const landlordId = location.state?.landlordId || localStorage.getItem('landlordId');

      const response = await axios.get(`http://localhost:3001/managers/${landlordId}`, {
        headers: { Authorization: token },
    });


    setManagers(response.data);

    console.log(response.data);

      // setManagers(response.data);
    } catch (error) {
      console.error("Error fetching managers:", error);
    }
  };



  const handleAddManager = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:3001/add-manager', {
        name: managerName,
        contact: managerContact,
        username: managerUsername,
        password: managerPassword,
        role: 'Manager',
        landlordId,
      }, {
        headers: { Authorization: token },
      });
      setManagers([...managers, response.data]);
      setManagerName('');
      setManagerContact('');
      setManagerUsername('');
      setManagerPassword('');
      window.location.reload();
    } catch (error) {
      console.error("Error adding manager:", error);
    }
  };

  const fetchFields = async () => {
    try {
      const token = localStorage.getItem('token');
      // Ensure landlordId is available from the state or local storage
      const landlordId = location.state?.landlordId || localStorage.getItem('landlordId');
  
      const response = await axios.get(`http://localhost:3001/fields/${landlordId}`, {
        headers: { Authorization: token },
      });
  
      // Update the state with the fetched fields
      setFields(response.data);
  
      console.log("Fetched fields:", response.data);
    } catch (error) {
      console.error("Error fetching fields:", error);
    }
  };
  
  const fetchCrops = async () => {
    try {
      const token = localStorage.getItem('token');
      const landlordId = location.state?.landlordId || localStorage.getItem('landlordId');
  
      const response = await axios.get(`http://localhost:3001/crops/${landlordId}`, {
        headers: { Authorization: token },
      });
  
      // Update the state with the fetched crops
      setCrops(response.data);
  
      console.log("Fetched crops:", response.data);
    } catch (error) {
      console.error("Error fetching crops:", error);
    }
  };
  
  const handleRemoveManager = async (managerId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3001/remove-manager/${managerId}`, {
        headers: { Authorization: token },
      });
      alert(response.data.message);

      setManagers(managers.filter(manager => manager.id !== managerId));
      
      window.location.reload();
    } catch (error) {
      if (error.response && error.response.status === 400) {
        alert(error.response.data.message); 
      } else {
        console.error("Error removing manager:", error);
        alert("An error occurred while trying to remove the manager.");
      }
    }
  };

  const handleRemoveField = async (fieldId) => {
    try {
      const token = localStorage.getItem('token');
  
      // Send the delete request
      const response = await axios.delete(`http://localhost:3001/remove-field/${fieldId}`, {
        headers: { Authorization: token },
      });
  
      alert(response.data.message);
  
      setFields(fields.filter(field => field.id !== fieldId));
    } catch (error) {
      if (error.response && error.response.status === 400) {
        alert(error.response.data.message);
      } else {
        console.error("Error removing field:", error);
        alert("An error occurred while trying to remove the field.");
      }
    }
  };
  
  const handleRemoveCrop = async (cropId) => {
    try {
      const token = localStorage.getItem('token');
  
      // Send the delete request
      const response = await axios.delete(`http://localhost:3001/remove-crop/${cropId}`, {
        headers: { Authorization: token },
      });
  
      window.location.reload();
      alert(response.data.message);
  
      setFields(crops.filter(crop => crop.id !== cropId));
    } catch (error) {
      if (error.response && error.response.status === 400) {
        alert(error.response.data.message);
      } else {
        console.error("Error removing crop:", error);
        alert("An error occurred while trying to remove the crop.");
      }
    }
  };
  

  const handleAddField = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log(fieldSize,location,landlordId,selectedManagerId);
      const response = await axios.post('http://localhost:3001/add-field', {
        size: fieldSize,
        location: fieldLocation,
        landlordId,
        selectedManagerId
      }, {
        headers: { Authorization: token },
      });
      setFields([...fields, response.data]);
      setFieldLocation('');
      setFieldSize('');
      setSelectedManagerId('');
      window.location.reload();
      console.log(response.data);
    } catch (error) {
      setError('Error adding field');
      console.error("Error adding field:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleAddCrop = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
  
      // Send crop details to the backend
      const response = await axios.post(
        'http://localhost:3001/add-crop',
        {
          cropName,
          plantingDate,
          growthStage,
          fieldId: selectedFieldId, // Field to which the crop is assigned
        },
        {
          headers: { Authorization: token },
        }
      );
  
      // Update the crop state with the newly added crop
      setCrops([...crops, response.data]);
  
      // Clear the form fields
      setCropName('');
      setPlantingDate('');
      setGrowthStage('');
      setSelectedFieldId('');
  
      // Optionally reload or provide user feedback
      window.location.reload(); // If real-time updates aren't implemented
      console.log(response.data);
    } catch (error) {
      setError('Error adding crop');
      console.error('Error adding crop:', error);
    } finally {
      setLoading(false);
    }
  };
  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toISOString().split("T")[0]; // Returns YYYY-MM-DD
  };
  
return (
  <div style={styles.dashboardContainer}>
    <div style={styles.welcomeSection}>
      <h1 style={styles.welcomeText}>Welcome, {landlordName}!</h1>
    </div>

    {/* Flexbox container for forms */}
    <div style={styles.flexContainer}>
      <div style={styles.card}>
        <h2 style={styles.sectionHeading}>Add New Manager</h2>
        <form onSubmit={handleAddManager} style={styles.form}>
          <input
            type="text"
            placeholder="Manager Name"
            value={managerName}
            onChange={(e) => setManagerName(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="text"
            placeholder="Contact Info"
            value={managerContact}
            onChange={(e) => setManagerContact(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="text"
            placeholder="Username"
            value={managerUsername}
            onChange={(e) => setManagerUsername(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={managerPassword}
            onChange={(e) => setManagerPassword(e.target.value)}
            required
            style={styles.input}
          />
          <button type="submit" style={styles.button}>Add Manager</button>
        </form>
      </div>

      <div style={styles.card}>
        <h2 style={styles.sectionHeading}>Add New Field</h2>
        <form onSubmit={handleAddField} style={styles.form}>
          <input
            type="number"
            placeholder="Field Size (Acres)"
            value={fieldSize}
            onChange={(e) => setFieldSize(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="text"
            placeholder="Field Location"
            value={fieldLocation}
            onChange={(e) => setFieldLocation(e.target.value)}
            required
            style={styles.input}
          />
          <select
            value={selectedManagerId}
            onChange={(e) => setSelectedManagerId(e.target.value)}
            required
            style={styles.input}
          >
            <option value="">Select Manager</option>
            {managers.map((manager) => (
              <option key={manager.Landlord_Manager_ID} value={manager.Landlord_Manager_ID}>
                {manager.Name}
              </option>
            ))}
          </select>
          <button type="submit" style={styles.fieldbutton}>Add Field</button>
        </form>
      </div>
      <div style={styles.card}>
  <h2 style={styles.sectionHeading}>Add New Crop</h2>
  <form onSubmit={handleAddCrop} style={styles.form}>
  <input
    type="text"
    placeholder="Crop Name"
    value={cropName}
    onChange={(e) => setCropName(e.target.value)}
    required
    style={styles.input}
  />
  <input
    type="date"
    placeholder="Planting Date"
    value={plantingDate}
    onChange={(e) => setPlantingDate(e.target.value)}
    required
    style={styles.input}
  />
  <input
    type="text"
    placeholder="Growth Stage"
    value={growthStage}
    onChange={(e) => setGrowthStage(e.target.value)}
    required
    style={styles.input}
  />
  <select
    value={selectedFieldId}
    onChange={(e) => setSelectedFieldId(e.target.value)}
    required
    style={styles.input}
  >
    <option value="">Select Field</option>
    {fields.map((field) => (
      <option key={field.Field_ID} value={field.Field_ID}>
        {field.Location}
      </option>
    ))}
  </select>
  <button type="submit" style={styles.button}>Add Crop</button>
  </form>
  </div>



    </div>
    

    {/* Flexbox container for lists */}
    <div style={styles.flexContainer}>
      {/* List of existing managers */}
      <div style={styles.card}>
        <h2 style={styles.sectionHeading}>Existing Managers</h2>
        {managers.length > 0 ? (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>ID</th>
                <th style={styles.tableHeader}>Name</th>
                <th style={styles.tableHeader}>Contact</th>
                <th style={styles.tableHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {managers.map((manager) => (
                <tr key={manager.Landlord_Manager_ID} style={styles.tableRow}>
                  <td style={styles.tableCell}>{manager.Landlord_Manager_ID}</td>
                  <td style={styles.tableCell}>{manager.Name}</td>
                  <td style={styles.tableCell}>{manager.Contact_Information}</td>
                  <td style={styles.tableCell}>
                    <button
                      onClick={() => handleRemoveManager(manager.Landlord_Manager_ID)}
                      style={styles.removeButton}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={styles.noManagersText}>No managers assigned yet.</p>
        )}
      </div>

      {/* List of existing fields */}
      <div style={styles.card}>
        <h2 style={styles.sectionHeading}>Existing Fields</h2>
        {fields.length > 0 ? (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Field ID</th>
                <th style={styles.tableHeader}>Size</th>
                <th style={styles.tableHeader}>Location</th>
                <th style={styles.tableHeader}>Manager</th>
                <th style={styles.tableHeader}>Actions</th>

              </tr>
            </thead>
            <tbody>
              {fields.map((field) => (
                <tr key={field.Field_ID} style={styles.tableRow}>
                  <td style={styles.tableCell}>{field.Field_ID}</td>
                  <td style={styles.tableCell}>{field.Size}</td>
                  <td style={styles.tableCell}>{field.Location}</td>
                  <td style={styles.tableCell}>
                    {managers.find(manager => manager.Landlord_Manager_ID === field.Landlord_Manager_ID)?.Name || "N/A"}
                  </td>
                  <td style={styles.tableCell}>
                    <button
                      onClick={() => handleRemoveField(field.Field_ID)}
                      style={styles.removeButton}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={styles.noManagersText}>No fields added yet.</p>
        )}
      </div>
      
      
      
            {/* List of existing crops */}

      <div style={styles.card}>
        <h2 style={styles.sectionHeading}>Existing Crops</h2>
        {crops.length > 0 ? (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Crop ID</th>
                <th style={styles.tableHeader}>Field</th>
                <th style={styles.tableHeader}>Crop Name</th>
                <th style={styles.tableHeader}>Planting Date</th>
                <th style={styles.tableHeader}>Growth Stage</th>
                <th style={styles.tableHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {crops.map((crop) => (
                <tr key={crop.Crop_ID} style={styles.tableRow}>
                  <td style={styles.tableCell}>{crop.Crop_ID}</td>
                  <td style={styles.tableCell}>
                    {fields.find((field) => field.Field_ID === crop.Field_ID)?.Location || "N/A"}
                  </td>
                  <td style={styles.tableCell}>{crop.Crop_Name}</td>
                  <td style={styles.tableCell}>{formatDate(crop.Planting_Date)}</td>
                  <td style={styles.tableCell}>{crop.Growth_Stage}</td>
                  <td style={styles.tableCell}>
                    <button
                      onClick={() => handleRemoveCrop(crop.Crop_ID)}
                      style={styles.removeButton}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={styles.noManagersText}>No crops added yet.</p>
        )}
      </div>
    </div>
  </div>
)};



const styles = {
  flexContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '20px', 
    flexWrap: 'wrap',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '20px',
  },
  tableHeader: {
    backgroundColor: '#007BFF',
    color: '#fff',
    padding: '10px',
    textAlign: 'left',
  },
  tableRow: {
    backgroundColor: '#f9f9f9',
  },
  tableCell: {
    padding: '10px',
    borderBottom: '1px solid #ddd',
  },
  heading: {
    textAlign: 'center',
    marginBottom: '20px',
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    padding: '20px',
    marginBottom: '20px',
    width:'510px',
  },
  sectionHeading: {
    fontSize: '18px',
    marginBottom: '15px',
    color: '#007BFF',
    fontWeight: 'bold',
  },
  managerDetails: {
    fontSize: '14px',
    color: '#555',
  },
  noManagersText: {
    fontSize: '14px',
    color: '#777',
    textAlign: 'center',
  },
  dashboardContainer: {
    padding: '20px',
    backgroundColor: '#f4f4f4',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  welcomeSection: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007BFF',
    color: '#fff',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  },
  welcomeText: {
    fontSize: '24px',
    fontWeight: 'bold',
    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
    margin: 0,
  },
  section: {
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    width: '300px',
    marginTop: '10px',
  },
  input: {
    padding: '8px',
    marginBottom: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
  },
  button: {
    padding: '10px 15px',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease',
  },
  fieldbutton: {
    padding: '10px 15px',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    marginTop:'45px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease',
  },
  buttonHover: {
    backgroundColor: '#0056b3',
  },
  managerList: {
    listStyleType: 'none',
    padding: 0,
  },
  managerItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: '10px',
    marginBottom: '5px',
    borderRadius: '4px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  removeButton: {
    backgroundColor: '#FF4D4D',
    color: '#fff',
    border: 'none',
    padding: '1px 8px ',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  removeButtonHover: {
    backgroundColor: '#CC0000',
  },
};


export default LandlordDashboard;
