
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const LandlordDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();



  const [landlordName, setLandlordName] = useState('');
  const [managers, setManagers] = useState([]);
  const [fields, setFields] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(false);

  const [managerName, setManagerName] = useState('');
  const [managerContact, setManagerContact] = useState('');
  const [managerUsername, setManagerUsername] = useState('');
  const [managerPassword, setManagerPassword] = useState('');

  const [fieldSize, setFieldSize] = useState('');
  const [fieldLocation, setFieldLocation] = useState('');
  const [selectedManagerId, setSelectedManagerId] = useState('');

  const [cropName, setCropName] = useState('');
  const [plantingDate, setPlantingDate] = useState('');
  const [growthStage, setGrowthStage] = useState('');
  const [selectedFieldId, setSelectedFieldId] = useState('');

  const [machineryName, setMachineryName] = useState('');
  const [machineryType, setMachineryType] = useState('');
  const [machineryStatus, setMachineryStatus] = useState('');
  const [machinery, setMachinery] = useState([]);

  const [resources, setResources] = useState([]);
  const [resourceName, setResourceName] = useState('');
  const [resourceQuantity, setResourceQuantity] = useState('');
  const [resourceUnit, setResourceUnit] = useState('');
  const [resourceStatus, setResourceStatus] = useState('');




  const [workerName, setWorkerName] = useState('');
  const [workerContact, setWorkerContact] = useState('');
  const [workerRole, setWorkerRole] = useState('');
  const [assignedFieldId, setAssignedFieldId] = useState('');
  const [workers, setWorkers] = useState([]);



  const [expenses, setExpenses] = useState([]);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseType, setExpenseType] = useState('');
  const [expenseDate, setExpenseDate] = useState('');
  const [selectedFId, setSelectedFId] = useState(''); 

  const [predictedYield, setPredictedYield] = useState('');
  const [actualYield, setActualYield] = useState('');
  const [year, setYear] = useState('');
  const [SFID, setSFID] = useState('');
  const [selectedCropId, setSelectedCropId] = useState('');
  const [yields, setYields] = useState([])

  const landlordId = location.state?.landlordId || localStorage.getItem('landlordId');

  useEffect(() => {
    if (!landlordId) {
      navigate('/login');
    } else {
      fetchData();
    }
  }, []);





  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchLandlordInfo(), fetchManagers(), 
        fetchFields(), fetchCrops(),fetchMachinery(),fetchResources()
      ,fetchWorkers(),fetchExpenses(),fetchYields()]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchYields = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3001/yields/${landlordId}`, {
        headers: { Authorization: token },
      });
      setYields(response.data);
    } catch (error) {
      console.error('Error fetching yields:', error);
    }
  };
  

  const handleAddYield = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:3001/add-yield',
        {
          SFID,
          cropId: selectedCropId,
          predictedYield,
          actualYield: actualYield || null,
          year,
        },
        {
          headers: { Authorization: token },
        }
      );
      setYields([...yields, response.data]);
      setSFID('');
      setSelectedCropId('');
      setPredictedYield('');
      setActualYield('');
      setYear('');
      fetchData();
    } catch (error) {
      console.error('Error adding yield:', error);
    }
  };
  const handleRemoveYield = async (yieldId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3001/remove-yield/${yieldId}`, {
        headers: { Authorization: token },
      });
      setYields(yields.filter((yieldEntry) => yieldEntry.Yield_ID !== yieldId));
      fetchData();
    } catch (error) {
      console.error('Error removing yield:', error);
    }
  };
  



  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:3001/expenses/${landlordId}`,
        {
          headers: { Authorization: token },
          params: { fId: selectedFId || undefined }, // Optional field filter
        }
      );
      setExpenses(response.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };
  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:3001/add-expense',
        {
          landlordId,
          fId: selectedFId || null, // Updated field selection
          amount: expenseAmount,
          description: expenseDescription,
          expenseType,
          date: expenseDate,
        },
        { headers: { Authorization: token } }
      );
      setExpenses([...expenses, response.data]);
      // Reset form fields
      setExpenseAmount('');
      setExpenseDescription('');
      setExpenseType('');
      setExpenseDate('');
      setSelectedFId(''); // Reset selected FId
      fetchData();

    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };
  const handleRemoveExpense = async (expenseId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3001/remove-expense/${expenseId}`, {
        headers: { Authorization: token },
      });
      setExpenses(expenses.filter((expense) => expense.Expense_ID !== expenseId));
      fetchData();
    } catch (error) {
      console.error('Error removing expense:', error);
    }
  };

  


  const handleAddWorker = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:3001/add-worker',
        {
          name: workerName,
          contact: workerContact,
          role: workerRole,
          assignedFieldId,
          landlordId,
        },
        {
          headers: { Authorization: token },
        }
      );
      setWorkers([...workers, response.data]);
      setWorkerName('');
      setWorkerContact('');
      setWorkerRole('');
      setAssignedFieldId('');
      fetchData();
    } catch (error) {
      console.error("Error adding worker:", error);
    }
  };
  const handleRemoveWorker = async (workerId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3001/remove-worker/${workerId}`, {
        headers: { Authorization: token },
      });
      setWorkers(workers.filter((worker) => worker.Worker_ID !== workerId));
      fetchData();

    } catch (error) {
      console.error("Error removing worker:", error);
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
      console.error("Error fetching workers:", error);
    }
  };
  
  const fetchResources = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`http://localhost:3001/resources/${landlordId}`, {
      headers: { Authorization: token },
    });
    setResources(response.data);
  };
  

  const handleAddResource = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:3001/add-resource',
        {
          landlordId,
          name: resourceName,
          quantity: parseFloat(resourceQuantity),
          unit: resourceUnit,
          status: resourceStatus,
        },
        { headers: { Authorization: token } }
      );
      setResources([...resources, response.data]); 
      setResourceName(''); 
      setResourceQuantity('');
      setResourceUnit('');
      setResourceStatus('');
      fetchData();

    } catch (error) {
      console.error('Error adding resource:', error);
    }
  };
  
  

  const handleRemoveResource = async (resourceId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3001/remove-resource/${resourceId}`, {
        headers: { Authorization: token },
      });
      setResources(resources.filter((resource) => resource.Resource_ID !== resourceId)); // Remove from state
      fetchData();
    } catch (error) {
      console.error('Error removing resource:', error);
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
      console.error("Error fetching machinery:", error);
    }
  };
  
  
  const handleAddMachinery = async (e) => {
    e.preventDefault();
    if (!machineryName || !machineryType || !machineryStatus) {
      alert("All fields are required for adding machinery.");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:3001/add-machinery',
        { name: machineryName, type: machineryType, status: machineryStatus, landlordId },
        { headers: { Authorization: token } }
      );
      setMachinery([...machinery, response.data]);
      setMachineryName('');
      setMachineryType('');
      setMachineryStatus('');
      fetchData();

    } catch (error) {
      console.error("Error adding machinery:", error);
      alert("Failed to add machinery.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleRemoveMachinery = async (machineryId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3001/remove-machinery/${machineryId}`, {
        headers: { Authorization: token },
      });
      setMachinery(machinery.filter((item) => item.Machinery_ID !== machineryId));
      fetchData();

    } catch (error) {
      console.error("Error removing machinery:", error);
      alert("Failed to remove machinery. Please try again.");
    }
  };
  const fetchLandlordInfo = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`http://localhost:3001/landlord-info/${landlordId}`, {
      headers: { Authorization: token },
    });
    setLandlordName(response.data.Name);
  };

  const fetchManagers = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`http://localhost:3001/managers/${landlordId}`, {
      headers: { Authorization: token },
    });
    setManagers(response.data);
  };

  const fetchFields = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`http://localhost:3001/fields/${landlordId}`, {
      headers: { Authorization: token },
    });
    setFields(response.data);
  };

  const fetchCrops = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`http://localhost:3001/crops/${landlordId}`, {
      headers: { Authorization: token },
    });
    setCrops(response.data);
  };


  const handleAddManager = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:3001/add-manager',
        { name: managerName, contact: managerContact, username: managerUsername, password: managerPassword, landlordId },
        { headers: { Authorization: token } }
      );
      setManagers([...managers, response.data]);
      setManagerName('');
      setManagerContact('');
      setManagerUsername('');
      setManagerPassword('');
      fetchData();
    } catch (error) {
      console.error("Error adding manager:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddField = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:3001/add-field',
        { size: fieldSize, location: fieldLocation, landlordId, selectedManagerId },
        { headers: { Authorization: token } }
      );
      setFields([...fields, response.data]);
      setFieldSize('');
      setFieldLocation('');
      setSelectedManagerId('');
      fetchData();

    } catch (error) {
      console.error("Error adding field:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCrop = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:3001/add-crop',
        { cropName, plantingDate, growthStage, fieldId: selectedFieldId },
        { headers: { Authorization: token } }
      );
      setCrops([...crops, response.data]);
      setCropName('');
      setPlantingDate('');
      setGrowthStage('');
      setSelectedFieldId('');
      fetchData();

    } catch (error) {
      console.error("Error adding crop:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveManager = async (managerId) => {
    const token = localStorage.getItem('token');
    await axios.delete(`http://localhost:3001/remove-manager/${managerId}`, {
      headers: { Authorization: token },
    });
    setManagers(managers.filter((manager) => manager.Landlord_Manager_ID !== managerId));
    fetchData();

  };

  const handleRemoveField = async (fieldId) => {
    const token = localStorage.getItem('token');
    await axios.delete(`http://localhost:3001/remove-field/${fieldId}`, {
      headers: { Authorization: token },
    });
    setFields(fields.filter((field) => field.Field_ID !== fieldId));
    fetchData();

  };

  const handleRemoveCrop = async (cropId) => {
    const token = localStorage.getItem('token');
    await axios.delete(`http://localhost:3001/remove-crop/${cropId}`, {
      headers: { Authorization: token },
    });
    setCrops(crops.filter((crop) => crop.Crop_ID !== cropId));
    fetchData();

  };

  const goToReports = () => {
    navigate('/landlord-reports', { state: { landlordId } });
  };



  
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={styles.dashboardContainer}>
      <div style={styles.welcomeSection}>
        <h1 style={styles.welcomeText}>Welcome, {landlordName}!</h1>
      </div>

      <div style={styles.flexContainer}>
        {/* Add Manager */}

        <div style={styles.card}>
          <h2 style={styles.sectionHeading}>Add New Manager</h2>
          <form onSubmit={handleAddManager} style={styles.form}>
            <input type="text" placeholder="Manager Name" value={managerName} onChange={(e) => setManagerName(e.target.value)} required style={styles.input} />
            <input type="text" placeholder="Contact Info" value={managerContact} onChange={(e) => setManagerContact(e.target.value)} required style={styles.input} />
            <input type="text" placeholder="Username" value={managerUsername} onChange={(e) => setManagerUsername(e.target.value)} required style={styles.input} />
            <input type="password" placeholder="Password" value={managerPassword} onChange={(e) => setManagerPassword(e.target.value)} required style={styles.input} />
            <button type="submit" style={styles.button}>Add Manager</button>
          </form>
        </div>

        {/* Add Field */}
        <div style={styles.card}>
          <h2 style={styles.sectionHeading}>Add New Field</h2>
          <form onSubmit={handleAddField} style={styles.form}>
            <input type="number" placeholder="Field Size (Acres)" value={fieldSize} onChange={(e) => setFieldSize(e.target.value)} required style={styles.input} />
            <input type="text" placeholder="Field Location" value={fieldLocation} onChange={(e) => setFieldLocation(e.target.value)} required style={styles.input} />
            <select value={selectedManagerId} onChange={(e) => setSelectedManagerId(e.target.value)} required style={styles.input}>
              <option value="">Select Manager</option>
              {managers.map((manager) => (
                <option key={manager.Landlord_Manager_ID} value={manager.Landlord_Manager_ID}>
                  {manager.Name}
                </option>
              ))}
            </select>
            <button type="submit" style={styles.button}>Add Field</button>
          </form>
        </div>

       
        {/* Add Crop */}

        <div style={styles.card}>
          <h2 style={styles.sectionHeading}>Add New Crop</h2>
          <form onSubmit={handleAddCrop} style={styles.form}>
            <input type="text" placeholder="Crop Name" value={cropName} onChange={(e) => setCropName(e.target.value)} required style={styles.input} />
            <input type="date" placeholder="Planting Date" value={plantingDate} onChange={(e) => setPlantingDate(e.target.value)} required style={styles.input} />
            <input type="text" placeholder="Growth Stage" value={growthStage} onChange={(e) => setGrowthStage(e.target.value)} required style={styles.input} />
            <select value={selectedFieldId} onChange={(e) => setSelectedFieldId(e.target.value)} required style={styles.input}>
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

       {/* Add Machinery */}
        <div style={styles.card}>
  <h2 style={styles.sectionHeading}>Add New Machinery</h2>
  <form onSubmit={handleAddMachinery} style={styles.form}>
    <input
      type="text"
      placeholder="Machinery Name"
      value={machineryName}
      onChange={(e) => setMachineryName(e.target.value)}
      required
      style={styles.input}
    />
    <input
      type="text"
      placeholder="Machinery Type"
      value={machineryType}
      onChange={(e) => setMachineryType(e.target.value)}
      required
      style={styles.input}
    />
    <input
      type="text"
      placeholder="Status"
      value={machineryStatus}
      onChange={(e) => setMachineryStatus(e.target.value)}
      required
      style={styles.input}
    />
    <button type="submit" style={styles.button}>Add Machinery</button>
  </form>
        </div>
        {/* Add Resource */}
        <div style={styles.card}>
  <h2 style={styles.sectionHeading}>Add New Resource</h2>
  <form onSubmit={handleAddResource} style={styles.form}>
    <input
      type="text"
      placeholder="Resource Name"
      value={resourceName}
      onChange={(e) => setResourceName(e.target.value)}
      required
      style={styles.input}
    />
    <input
      type="number"
      placeholder="Quantity"
      value={resourceQuantity}
      onChange={(e) => setResourceQuantity(e.target.value)}
      required
      style={styles.input}
    />
    <input
      type="text"
      placeholder="Unit"
      value={resourceUnit}
      onChange={(e) => setResourceUnit(e.target.value)}
      required
      style={styles.input}
    />
    <input
      type="text"
      placeholder="Status"
      value={resourceStatus}
      onChange={(e) => setResourceStatus(e.target.value)}
      required
      style={styles.input}
    />
    <button type="submit" style={styles.button}>Add Resource</button>
  </form>
        </div>
        {/* Add Worker */}
        <div style={styles.card}>
  <h2 style={styles.sectionHeading}>Add New Worker</h2>
  <form onSubmit={handleAddWorker} style={styles.form}>
    <input
      type="text"
      placeholder="Worker Name"
      value={workerName}
      onChange={(e) => setWorkerName(e.target.value)}
      required
      style={styles.input}
    />
    <input
      type="text"
      placeholder="Contact Information"
      value={workerContact}
      onChange={(e) => setWorkerContact(e.target.value)}
      required
      style={styles.input}
    />
    <input
      type="text"
      placeholder="Role (e.g., Harvester)"
      value={workerRole}
      onChange={(e) => setWorkerRole(e.target.value)}
      required
      style={styles.input}
    />
    <select
      value={assignedFieldId}
      onChange={(e) => setAssignedFieldId(e.target.value)}
      style={styles.input}
    >
      <option value="">Assign to Field (Optional)</option>
      {fields.map((field) => (
        <option key={field.Field_ID} value={field.Field_ID}>
          {field.Location}
        </option>
      ))}
    </select>
    <button type="submit" style={styles.button}>Add Worker</button>
  </form>
        </div>

      {/* Add Expense */}
        <div style={styles.card}>
  <h2 style={styles.sectionHeading}>Add New Expense</h2>
  <form onSubmit={handleAddExpense} style={styles.form}>
    <input
      type="number"
      placeholder="Amount"
      value={expenseAmount}
      onChange={(e) => setExpenseAmount(e.target.value)}
      required
      style={styles.input}
    />
    <input
      type="text"
      placeholder="Description"
      value={expenseDescription}
      onChange={(e) => setExpenseDescription(e.target.value)}
      required
      style={styles.input}
    />
    <select
      value={expenseType}
      onChange={(e) => setExpenseType(e.target.value)}
      required
      style={styles.input}
    >
      <option value="">Select Expense Type</option>
      <option value="Labor">Labor</option>
      <option value="Fuel">Fuel</option>
      <option value="Maintenance">Maintenance</option>
      <option value="Other">Other</option>
    </select>
    <input
      type="date"
      placeholder="Date"
      value={expenseDate}
      onChange={(e) => setExpenseDate(e.target.value)}
      required
      style={styles.input}
    />
    <select
      value={selectedFId}
      onChange={(e) => setSelectedFId(e.target.value)} // Updated field selection
      style={styles.input}
    >
      <option value="">Select Field (Optional)</option>
      {fields.map((field) => (
        <option key={field.FId} value={field.Field_ID}>
          {field.Location}
        </option>
      ))}
    </select>
    <button type="submit" style={styles.button}>
      Add Expense
    </button>
  </form>
        </div>


      {/* Add Yield */}
        <div style={styles.card}>
  <h2 style={styles.sectionHeading}>Add New Yield</h2>
  <form onSubmit={handleAddYield} style={styles.form}>
    <select
      value={SFID}
      onChange={(e) => setSFID(e.target.value)}
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
    <select
      value={selectedCropId}
      onChange={(e) => setSelectedCropId(e.target.value)}
      required
      style={styles.input}
    >
      <option value="">Select Crop</option>
      {crops.map((crop) => (
        <option key={crop.Crop_ID} value={crop.Crop_ID}>
          {crop.Crop_Name}
        </option>
      ))}
    </select>
    <input
      type="number"
      placeholder="Predicted Yield (e.g., in tons)"
      value={predictedYield}
      onChange={(e) => setPredictedYield(e.target.value)}
      required
      style={styles.input}
    />
    <input
      type="number"
      placeholder="Actual Yield (optional)"
      value={actualYield}
      onChange={(e) => setActualYield(e.target.value)}
      style={styles.input}
    />
    <input
      type="number"
      placeholder="Year (e.g., 2024)"
      value={year}
      onChange={(e) => setYear(e.target.value)}
      required
      style={styles.input}
    />
    <button type="submit" style={styles.button}>Add Yield</button>
  </form>
      </div>


      </div>

      {/* Existing Lists */}
      <div style={styles.flexContainer}>
       
      {/* Managers List */}
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
                  <tr key={manager.Landlord_Manager_ID}>
                    <td>{manager.Landlord_Manager_ID}</td>
                    <td>{manager.Name}</td>
                    <td>{manager.Contact_Information}</td>
                    <td>
                      <button onClick={() => handleRemoveManager(manager.Landlord_Manager_ID)} style={styles.removeButton}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No managers found.</p>
          )}
        </div>

        {/* Fields List */}
        <div style={styles.card}>
          <h2 style={styles.sectionHeading}>Existing Fields</h2>
          {fields.length > 0 ? (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>ID</th>
                  <th style={styles.tableHeader}>Size</th>
                  <th style={styles.tableHeader}>Location</th>
                  <th style={styles.tableHeader}>Manager</th>
                  <th style={styles.tableHeader}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field) => (
                  <tr key={field.Field_ID}>
                    <td>{field.Field_ID}</td>
                    <td>{field.Size}</td>
                    <td>{field.Location}</td>
                    <td>{managers.find((m) => m.Landlord_Manager_ID === field.Landlord_Manager_ID)?.Name || 'N/A'}</td>
                    <td>
                      <button onClick={() => handleRemoveField(field.Field_ID)} style={styles.removeButton}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No fields found.</p>
          )}
        </div>

        {/* Crops List */}
        
        <div style={styles.card}>
          <h2 style={styles.sectionHeading}>Existing Crops</h2>
          {crops.length > 0 ? (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>ID</th>
                  <th style={styles.tableHeader}>Field</th>
                  <th style={styles.tableHeader}>Name</th>
                  <th style={styles.tableHeader}>Planting Date</th>
                  <th style={styles.tableHeader}>Growth Stage</th>
                  <th style={styles.tableHeader}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {crops.map((crop) => (
                  <tr key={crop.Crop_ID}>
                    <td>{crop.Crop_ID}</td>
                    <td>{fields.find((field) => field.Field_ID === crop.Field_ID)?.Location || 'N/A'}</td>
                    <td>{crop.Crop_Name}</td>
                    <td>{crop.Planting_Date.split('T')[0]}</td>
                    <td>{crop.Growth_Stage}</td>
                    <td>
                      <button onClick={() => handleRemoveCrop(crop.Crop_ID)} style={styles.removeButton}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No crops found.</p>
          )}
        </div>
      {/* Machinery List */}
      <div style={styles.card}>
        <h2 style={styles.sectionHeading}>Existing Machinery</h2>
        {machinery.length > 0 ? (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>ID</th>
                <th style={styles.tableHeader}>Name</th>
                <th style={styles.tableHeader}>Type</th>
                <th style={styles.tableHeader}>Status</th>
                <th style={styles.tableHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {machinery.map((item) => (
                <tr key={item.Machinery_ID}>
                  <td>{item.Machinery_ID}</td>
                  <td>{item.Name}</td>
                  <td>{item.Type}</td>
                  <td>{item.Status}</td>
                  <td>
                    <button
                      onClick={() => handleRemoveMachinery(item.Machinery_ID)}
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
          <p>No machinery found.</p>
        )}
      </div>

      {/* Existing Resources */}
      <div style={styles.card}>
        <h2 style={styles.sectionHeading}>Existing Resources</h2>
        {resources.length > 0 ? (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>ID</th>
                <th style={styles.tableHeader}>Name</th>
                <th style={styles.tableHeader}>Quantity</th>
                <th style={styles.tableHeader}>Unit</th>
                <th style={styles.tableHeader}>Status</th>
                <th style={styles.tableHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((resource) => (
                <tr key={resource.Resource_ID}>
                  <td>{resource.Resource_ID}</td>
                  <td>{resource.Name}</td>
                  <td>{resource.Quantity}</td>
                  <td>{resource.Unit}</td>
                  <td>{resource.Status}</td>
                  <td>
                    <button onClick={() => handleRemoveResource(resource.Resource_ID)} style={styles.removeButton}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No resources found.</p>
        )}
      </div>
      {/* Existing Workers */}
      <div style={styles.card}>
  <h2 style={styles.sectionHeading}>Existing Workers</h2>
  {workers.length > 0 ? (
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.tableHeader}>ID</th>
          <th style={styles.tableHeader}>Name</th>
          <th style={styles.tableHeader}>Contact</th>
          <th style={styles.tableHeader}>Role</th>
          <th style={styles.tableHeader}>Assigned Field</th>
          <th style={styles.tableHeader}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {workers.map((worker) => (
          <tr key={worker.Worker_ID}>
            <td>{worker.Worker_ID}</td>
            <td>{worker.Name}</td>
            <td>{worker.Contact}</td>
            <td>{worker.Role}</td>
            <td>{fields.find((field) => field.Field_ID === worker.Assigned_Field_ID)?.Location || 'Unassigned'}</td>
            <td>
              <button
                onClick={() => handleRemoveWorker(worker.Worker_ID)}
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
    <p>No workers found.</p>
  )}
      </div>
      {/* Existing Expenses */}

      <div style={styles.card}>
  <h2 style={styles.sectionHeading}>Existing Expenses</h2>
  {expenses.length > 0 ? (
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.tableHeader}>ID</th>
          <th style={styles.tableHeader}>Amount</th>
          <th style={styles.tableHeader}>Description</th>
          <th style={styles.tableHeader}>Type</th>
          <th style={styles.tableHeader}>Date</th>
          <th style={styles.tableHeader}>Field</th>
          <th style={styles.tableHeader}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {expenses.map((expense) => (
          <tr key={expense.Expense_ID}>
            <td>{expense.Expense_ID}</td>
            <td>{expense.Amount}</td>
            <td>{expense.Description}</td>
            <td>{expense.Expense_Type}</td>
            <td>{expense.Date.split('T')[0]}</td>
            <td>{expense.Field_Location || 'General'}</td>
            <td>
              <button
                onClick={() => handleRemoveExpense(expense.Expense_ID)}
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
    <p>No expenses found.</p>
  )}
      </div>
      {/* Existing Yields */}
      <div style={styles.card}>
  <h2 style={styles.sectionHeading}>Existing Yields</h2>
  {yields.length > 0 ? (
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.tableHeader}>Yield ID</th>
          <th style={styles.tableHeader}>Field</th>
          <th style={styles.tableHeader}>Crop</th>
          <th style={styles.tableHeader}>Predicted Yield</th>
          <th style={styles.tableHeader}>Actual Yield</th>
          <th style={styles.tableHeader}>Year</th>
          <th style={styles.tableHeader}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {yields.map((yieldEntry) => (
          <tr key={yieldEntry.Yield_ID}>
            <td>{yieldEntry.Yield_ID}</td>
            <td>
              {fields.find((field) => field.Field_ID === yieldEntry.Field_ID)?.Location || 'N/A'}
            </td>
            <td>
              {crops.find((crop) => crop.Crop_ID === yieldEntry.Crop_ID)?.Crop_Name || 'N/A'}
            </td>
            <td>{yieldEntry.Predicted_Yield}</td>
            <td>{yieldEntry.Actual_Yield || 'N/A'}</td>
            <td>{yieldEntry.Year}</td>
            <td>
              <button
                onClick={() => handleRemoveYield(yieldEntry.Yield_ID)}
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
    <p>No yields found.</p>
  )}
      </div>

      {/* Reports Button */}
     <div style={styles.card}>
      <h2 style={styles.sectionHeading}>Reports</h2>
     <p>View detailed reports on expenses, crop performance, and more.</p>
      <button onClick={goToReports} style={styles.button}>
       Go to Reports
     </button>
      </div>


    </div>
    </div>



  );
};


const styles = {
  flexContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: '20px',
    margin: '20px 0',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  tableHeader: {
    backgroundColor: '#4CAF50',
    color: '#fff',
    padding: '12px',
    textAlign: 'left',
    fontWeight: 'bold',
    borderBottom: '2px solid #3e8e41',
  },
  tableRow: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#f1f1f1',
    },
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    padding: '20px',
    marginBottom: '20px',
    width: '100%',
    maxWidth: '520px',
    transition: 'transform 0.3s, box-shadow 0.3s',
    '&:hover': {
      transform: 'scale(1.02)',
      boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)',
    },
  },
  sectionHeading: {
    fontSize: '20px',
    marginBottom: '15px',
    color: '#4CAF50',
    fontWeight: 'bold',
    borderBottom: '2px solid #4CAF50',
    paddingBottom: '8px',
  },
  formContainer: {
    width: '100%',
    maxWidth: '400px',
    margin: '0 auto',
    backgroundColor: '#f9f9f9',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  formHeading: {
    textAlign: 'center',
    marginBottom: '20px',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#555',
  },
  input: {
    width: '100%',
    padding: '10px',
    marginBottom: '15px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px',
    transition: 'border 0.3s',
  },
  select: {
    width: '100%',
    padding: '10px',
    marginBottom: '15px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px',
  },
  buttonContainer: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
    marginTop: '10px',
  },
  button: {
    padding: '10px 15px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  cancelButton: {
    padding: '10px 15px',
    backgroundColor: '#e74c3c',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  removeButton: {
    backgroundColor: '#e74c3c',
    color: '#fff',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.3s',
  },
  editButton: {
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    marginLeft: '5px',
    transition: 'background-color 0.3s',
  },
  dashboardContainer: {
    padding: '30px',
    backgroundColor: '#ecf0f1',
    borderRadius: '12px',
    boxShadow: '0 3px 6px rgba(0, 0, 0, 0.15)',
  },
  welcomeSection: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    color: '#fff',
    borderRadius: '12px',
    padding: '25px',
    marginBottom: '20px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  welcomeText: {
    fontSize: '26px',
    fontWeight: 'bold',
    margin: 0,
  },
};

export default LandlordDashboard;
