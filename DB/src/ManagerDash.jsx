import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const ManagerDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [managerName, setManagerName] = useState('');
  const [fields, setFields] = useState([]);
  const [crops, setCrops] = useState([]);
  const [machinery, setMachinery] = useState([]);
  const [resources, setResources] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);


  const [editCropId, setEditCropId] = useState(null); 
  const [editCropDetails, setEditCropDetails] = useState({
    Crop_Name: '',
    Growth_Stage: '',
    Planting_Date: '',
  });

  const [editMachinery, setEditMachinery] = useState(null);
  const [editResource, setEditResource] = useState(null);
  const [editWorker, setEditWorker] = useState(null);



  const managerId = location.state?.managerId || localStorage.getItem('managerId');
  const landlordId = location.state?.landlordId || localStorage.getItem('landlordId');

  useEffect(() => {
    if (!managerId || !landlordId) {
      navigate('/login');
    } else {
      fetchAllData();
    }
  }, [managerId, landlordId]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        
        fetchManagerInfo(),
        fetchFields(),
        fetchCrops(),
        fetchMachinery(),
        fetchResources(),
        fetchWorkers(),
        fetchExpenses(),
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchManagerInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3001/manager-info/${managerId}`, {
        headers: { Authorization: token },
      });
      setManagerName(response.data.managerName);
    } catch (error) {
      console.error('Error fetching manager info:', error);
    }
  };

  const fetchFields = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log(managerId);
      const response = await axios.get(`http://localhost:3001/flds/${managerId}`, {
        headers: { Authorization: token },
      });
      setFields(response.data);
    } catch (error) {
      console.error('Error fetching fields:', error);
    }
  };

  const fetchCrops = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3001/cropps/${managerId}`, {
        headers: { Authorization: token },
      });
      console.log(response.data);
      setCrops(response.data);
    } catch (error) {
      console.error('Error fetching crops:', error);
    }
  };

  const fetchMachinery = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3001/machinery/${landlordId}`, {
        headers: { Authorization: token },
      });
      setMachinery(response.data);
    } catch (error) {
      console.error('Error fetching machinery:', error);
    }
  };

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3001/expenses/${managerId}`, {
        headers: { Authorization: token },
      });
      setExpenses(response.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };
  

  const fetchResources = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3001/resources/${landlordId}`, {
        headers: { Authorization: token },
      });
      setResources(response.data);
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
  };

  const fetchWorkers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3001/workers/${landlordId}`, {
        headers: { Authorization: token },
      });
      setWorkers(response.data);
    } catch (error) {
      console.error('Error fetching workers:', error);
    }
  };


  const handleEditCrop = (crop) => {
    setEditCropId(crop.Crop_ID);
    setEditCropDetails({
      Crop_Name: crop.Crop_Name,
      Growth_Stage: crop.Growth_Stage,
      Planting_Date: crop.Planting_Date.split('T')[0], 
    });
  };
  const handleUpdateCrop = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:3001/update-crop/${editCropId}`,
        editCropDetails,
        { headers: { Authorization: token } }
      );
      alert('Crop updated successfully!');
      setEditCropId(null); // Exit edit mode
      fetchCrops(); // Refresh crop list
    } catch (error) {
      console.error('Error updating crop:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditCropId(null);
    setEditCropDetails({ Crop_Name: '', Growth_Stage: '', Planting_Date: '' });
  };
  

  const handleUpdateMachinery = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const { Machinery_ID, ...updatedData } = editMachinery;
      await axios.put(`http://localhost:3001/update-machinery/${Machinery_ID}`, updatedData, {
        headers: { Authorization: token },
      });
      setMachinery((prev) =>
        prev.map((item) =>
          item.Machinery_ID === Machinery_ID ? editMachinery : item
        )
      );
      setEditMachinery(null);
      alert('Machinery updated successfully!');
    } catch (error) {
      console.error('Error updating machinery:', error);
      alert('Failed to update machinery. Please try again.');
    }
  };
  

  const handleUpdateResource = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const { Resource_ID, ...updatedData } = editResource;
      await axios.put(`http://localhost:3001/update-resources/${Resource_ID}`, updatedData, {
        headers: { Authorization: token },
      });
      setResources((prev) =>
        prev.map((resource) =>
          resource.Resource_ID === Resource_ID ? editResource : resource
        )
      );
      setEditResource(null);
      alert('Resource updated successfully!');
    } catch (error) {
      console.error('Error updating resource:', error);
      alert('Failed to update resource. Please try again.');
    }
  };
  const handleUpdateWorker = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const { Worker_ID, ...updatedData } = editWorker;
      await axios.put(
        `http://localhost:3001/update-workers/${Worker_ID}`,
        updatedData,
        {
          headers: { Authorization: token },
        }
      );
      setWorkers((prev) =>
        prev.map((worker) =>
          worker.Worker_ID === Worker_ID ? editWorker : worker
        )
      );
      setEditWorker(null);
      alert('Worker updated successfully!');
    } catch (error) {
      console.error('Error updating worker:', error);
      alert('Failed to update worker. Please try again.');
    }
  };
  

  
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={styles.dashboardContainer}>
      <div style={styles.welcomeSection}>
        <h1 style={styles.welcomeText}>Welcome, {managerName}!</h1>
      </div>

      <div style={styles.flexContainer}>
        {/* Fields */}
        <div style={styles.card}>
          <h2 style={styles.sectionHeading}>Fields</h2>
          {fields.length > 0 ? (
            <ul style={styles.list}>
              {fields.map((field) => (
                <li key={field.Field_ID} style={styles.listItem}>
                  <strong>{field.Location}</strong> - {field.Size} acres
                </li>
              ))}
            </ul>
          ) : (
            <p>No fields available.</p>
          )}
        </div>

        {/* Crops */}
        <div style={styles.card}>
        <h2 style={styles.sectionHeading}>Crops</h2>
        {editCropId ? (
          <form onSubmit={handleUpdateCrop} style={styles.form}>
            <h3>Edit Crop</h3>
            <input
              type="text"
              placeholder="Crop Name"
              value={editCropDetails.Crop_Name}
              onChange={(e) => setEditCropDetails({ ...editCropDetails, Crop_Name: e.target.value })}
              style={styles.input}
              required
            />
            <input
              type="text"
              placeholder="Growth Stage"
              value={editCropDetails.Growth_Stage}
              onChange={(e) => setEditCropDetails({ ...editCropDetails, Growth_Stage: e.target.value })}
              style={styles.input}
              required
            />
            <input
              type="date"
              value={editCropDetails.Planting_Date}
              onChange={(e) => setEditCropDetails({ ...editCropDetails, Planting_Date: e.target.value })}
              style={styles.input}
              required
            />
            <div style={styles.buttonContainer}>
              <button type="submit" style={styles.saveButton}>Save</button>
              <button type="button" onClick={handleCancelEdit} style={styles.cancelButton}>Cancel</button>
            </div>
          </form>
        ) : crops.length > 0 ? (
          <ul style={styles.list}>
            {crops.map((crop) => (
              <li key={crop.Crop_ID} style={styles.listItem}>
                <strong>{crop.Crop_Name}</strong> - {crop.Growth_Stage} (Planted on {crop.Planting_Date.split('T')[0]})
                <button onClick={() => handleEditCrop(crop)} style={styles.editButton}>
                  Edit
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No crops available.</p>
        )}
      </div>

        {/* Machinery */}
        <div style={styles.card}>
  <h2 style={styles.sectionHeading}>Machinery</h2>
  {machinery.length > 0 ? (
    <ul style={styles.list}>
      {machinery.map((item) => (
        <li key={item.Machinery_ID} style={styles.listItem}>
          <strong>{item.Name}</strong> - {item.Type} ({item.Status})
          <button
            style={styles.editButton}
            onClick={() => setEditMachinery(item)}
          >
            Edit
          </button>
        </li>
      ))}
    </ul>
  ) : (
    <p>No machinery available.</p>
  )}

  {editMachinery && (
    <form onSubmit={handleUpdateMachinery} style={styles.form}>
      <h3>Edit Machinery</h3>
      <input
        type="text"
        placeholder="Name"
        value={editMachinery.Name}
        onChange={(e) =>
          setEditMachinery({ ...editMachinery, Name: e.target.value })
        }
        style={styles.input}
        required
      />
      <input
        type="text"
        placeholder="Type"
        value={editMachinery.Type}
        onChange={(e) =>
          setEditMachinery({ ...editMachinery, Type: e.target.value })
        }
        style={styles.input}
        required
      />
      <select
        value={editMachinery.Status}
        onChange={(e) =>
          setEditMachinery({ ...editMachinery, Status: e.target.value })
        }
        style={styles.input}
      >
        <option value="Available">Available</option>
        <option value="In Use">In Use</option>
        <option value="Under Maintenance">Under Maintenance</option>
      </select>
      <div style={styles.buttonContainer}>
        <button type="submit" style={styles.button}>
          Update
        </button>
        <button
          type="button"
          style={styles.cancelButton}
          onClick={() => setEditMachinery(null)}
        >
          Cancel
        </button>
      </div>
    </form>
  )}
        </div>



        {/* Resources */}
        <div style={styles.card}>
         <h2 style={styles.sectionHeading}>Resources</h2>
        {resources.length > 0 ? (
          <ul style={styles.list}>
            {resources.map((resource) => (
              <li key={resource.Resource_ID} style={styles.listItem}>
                <strong>{resource.Name}</strong> - {resource.Quantity} {resource.Unit} ({resource.Status})
                <button
            style={styles.editButton}
            onClick={() => setEditResource(resource)} 
          >
            Edit
          </button>
        </li>
      ))}
    </ul>
  ) : (
    <p>No resources available.</p>
  )}

  {editResource && (
    <form onSubmit={handleUpdateResource} style={styles.form}>
      <h3>Edit Resource</h3>
      <input
        type="text"
        placeholder="Name"
        value={editResource.Name}
        onChange={(e) =>
          setEditResource({ ...editResource, Name: e.target.value })
        }
        style={styles.input}
        required
        disabled 
      />
      <input
        type="number"
        placeholder="Quantity"
        value={editResource.Quantity}
        onChange={(e) =>
          setEditResource({ ...editResource, Quantity: e.target.value })
        }
        style={styles.input}
        required
      />
      <select
        value={editResource.Status}
        onChange={(e) =>
          setEditResource({ ...editResource, Status: e.target.value })
        }
        style={styles.input}
      >
        <option value="Available">Available</option>
        <option value="In Use">In Use</option>
        <option value="Depleted">Depleted</option>
      </select>
      <div style={styles.buttonContainer}>
        <button type="submit" style={styles.button}>
          Update
        </button>
        <button
          type="button"
          style={styles.cancelButton}
          onClick={() => setEditResource(null)}
        >
          Cancel
        </button>
      </div>
    </form>
  )}
         </div>



        {/* Workers */}
        <div style={styles.card}>
        <h2 style={styles.sectionHeading}>Workers</h2>
        {workers.length > 0 ? (
          <ul style={styles.list}>
            {workers.map((worker) => (
              <li key={worker.Worker_ID} style={styles.listItem}>
                <strong>{worker.Name}</strong> - {worker.Role} ({worker.Contact})
                <button
                  style={styles.editButton}
                  onClick={() => setEditWorker(worker)}
                >
              Edit
            </button>
          </li>
        ))}
    </ul>
  ) : (
    <p>No workers available.</p>
  )}

  {editWorker && (
    <form onSubmit={handleUpdateWorker} style={styles.form}>
      <h3>Edit Worker</h3>
      <input
        type="text"
        placeholder="Name"
        value={editWorker.Name}
        onChange={(e) =>
          setEditWorker({ ...editWorker, Name: e.target.value })
        }
        style={styles.input}
        required
      />
      <input
        type="text"
        placeholder="Contact"
        value={editWorker.Contact}
        onChange={(e) =>
          setEditWorker({ ...editWorker, Contact: e.target.value })
        }
        style={styles.input}
        required
      />
      <input
        type="text"
        placeholder="Role"
        value={editWorker.Role}
        onChange={(e) =>
          setEditWorker({ ...editWorker, Role: e.target.value })
        }
        style={styles.input}
        required
      />
      <select
        value={editWorker.Assigned_Field_ID || ''}
        onChange={(e) =>
          setEditWorker({ ...editWorker, Assigned_Field_ID: e.target.value })
        }
        style={styles.input}
      >
        <option value="">Unassign Field</option>
        {fields.map((field) => (
          <option key={field.Field_ID} value={field.Field_ID}>
            {field.Location}
          </option>
        ))}
      </select>
      <div style={styles.buttonContainer}>
        <button type="submit" style={styles.button}>
          Update
        </button>
        <button
          type="button"
          style={styles.cancelButton}
          onClick={() => setEditWorker(null)}
        >
          Cancel
        </button>
      </div>
    </form>
  )}
        </div>

      </div>
    </div>
  );
}; 


const styles = {
    dashboardContainer: {
      padding: '30px',
      backgroundColor: '#f9f9f9',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif',
    },
    welcomeSection: {
      textAlign: 'center',
      padding: '20px',
      backgroundColor: '#4CAF50',
      color: '#fff',
      borderRadius: '8px',
      marginBottom: '30px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    welcomeText: {
      fontSize: '28px',
      fontWeight: 'bold',
      margin: 0,
    },
    flexContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '25px',
      justifyContent: 'center',
    },
    card: {
      backgroundColor: '#ffffff',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      width: '420px',
      textAlign: 'center',
      transition: 'transform 0.3s, box-shadow 0.3s',
      '&:hover': {
        transform: 'scale(1.02)',
        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)',
      },
    },
    sectionHeading: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '15px',
      borderBottom: '2px solid #4CAF50',
      paddingBottom: '5px',
    },
    list: {
      listStyleType: 'none',
      padding: 0,
      margin: 0,
    },
    listItem: {
      fontSize: '16px',
      marginBottom: '10px',
      padding: '10px',
      borderBottom: '1px solid #ddd',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    form: {
      marginTop: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
      alignItems: 'stretch',
    },
    input: {
      width: '100%',
      padding: '10px',
      borderRadius: '5px',
      border: '1px solid #ccc',
      fontSize: '14px',
      outline: 'none',
      transition: 'border 0.3s',
      '&:focus': {
        border: '1px solid #4CAF50',
      },
    },
    select: {
      width: '100%',
      padding: '10px',
      borderRadius: '5px',
      border: '1px solid #ccc',
      fontSize: '14px',
      backgroundColor: '#fff',
      outline: 'none',
      transition: 'border 0.3s',
      '&:focus': {
        border: '1px solid #4CAF50',
      },
    },
    buttonContainer: {
      display: 'flex',
      gap: '10px',
      justifyContent: 'center',
    },
    button: {
      padding: '10px 20px',
      fontSize: '16px',
      backgroundColor: '#4CAF50',
      color: '#fff',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      fontWeight: 'bold',
      transition: 'background-color 0.3s, transform 0.2s',
      '&:hover': {
        backgroundColor: '#45a049',
        transform: 'scale(1.05)',
      },
    },
    cancelButton: {
      padding: '10px 20px',
      fontSize: '16px',
      backgroundColor: '#e74c3c',
      color: '#fff',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      fontWeight: 'bold',
      transition: 'background-color 0.3s, transform 0.2s',
      '&:hover': {
        backgroundColor: '#c0392b',
        transform: 'scale(1.05)',
      },
    },
    editButton: {
      padding: '5px 10px',
      backgroundColor: '#007BFF',
      color: '#fff',
      border: 'none',
      borderRadius: '5px',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
      '&:hover': {
        backgroundColor: '#0056b3',
      },
    },
    saveButton: {
      padding: '10px 20px',
      fontSize: '16px',
      backgroundColor: '#4CAF50',
      color: '#fff',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      fontWeight: 'bold',
      transition: 'background-color 0.3s, transform 0.2s',
      '&:hover': {
        backgroundColor: '#45a049',
        transform: 'scale(1.05)',
      },
    },
  };
  


export default ManagerDashboard;

