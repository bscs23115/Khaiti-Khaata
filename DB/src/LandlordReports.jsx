import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const LandlordReports = () => {
  const location = useLocation();
  const landlordId = location.state?.landlordId || localStorage.getItem('landlordId');
  

  const [reportType, setReportType] = useState('Expenses'); 
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [expenseType, setExpenseType] = useState('');
  const [selectedField, setSelectedField] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');
  const [fields, setFields] = useState([]);
  const [crops, setCrops] = useState([]);
  const [data, setData] = useState([]);
  const [resourceName, setResourceName] = useState(''); 
  const [resourceStatus, setResourceStatus] = useState(''); 
  const [machineryName, setMachineryName] = useState(''); 
  const [machineryStatus, setMachineryStatus] = useState(''); 
  const [workerName, setWorkerName] = useState('');
const [workerContact, setWorkerContact] = useState(''); 
const [workerRole, setWorkerRole] = useState('');

  const [roles, setRoles] = useState([]); 

  const fetchMetadata = async () => {
    try {
      const token = localStorage.getItem('token');
      const [fieldsResponse, cropsResponse,rolesResponse] = await Promise.all([
        axios.get(`http://localhost:3001/fields/${landlordId}`, {
          headers: { Authorization: token },
        }),
        axios.get(`http://localhost:3001/crops/${landlordId}`, {
          headers: { Authorization: token },
        }),
        axios.get(`http://localhost:3001/roles/${landlordId}`, {
            headers: { Authorization: token },
          }),
      ]);
      setFields(fieldsResponse.data);
      setCrops(cropsResponse.data);
      setRoles(rolesResponse.data);
      console.log(rolesResponse.data);
    } catch (error) {
      console.error('Error fetching metadata:', error);
    }
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const filters = {
        startDate: reportType === 'Expenses' ? startDate || null : null,
        endDate: reportType === 'Expenses' ? endDate || null : null,
        expenseType: reportType === 'Expenses' ? expenseType || null : null,
        selectedField: reportType === 'CropPerformance' || reportType === 'WorkerActivity' ? selectedField || null : null,
        selectedCrop: reportType === 'CropPerformance' ? selectedCrop || null : null,
        startYear: reportType === 'CropPerformance' ? startYear || null : null,
        endYear: reportType === 'CropPerformance' ? endYear || null : null,
        resourceName: reportType === 'ResourceUtilization' ? resourceName || null : null,
        resourceStatus: reportType === 'ResourceUtilization' ? resourceStatus || null : null,
        machineryName: reportType === 'MachineryUsage' ? machineryName || null : null,
        machineryStatus: reportType === 'MachineryUsage' ? machineryStatus || null : null,
        workerName: reportType === 'WorkerActivity' ? workerName || null : null,
        workerRole: reportType === 'WorkerActivity' ? workerRole || null : null,
        workerContact: reportType === 'WorkerActivity' ? workerContact || null : null,
        landlordId,
      };
      


      const response = await axios.get(
        `http://localhost:3001/reports/${reportType.toLowerCase()}`,
        {
          headers: { Authorization: token },
          params: filters,
        }
      );

      setData(response.data);
    } catch (error) {
      console.error(`Error fetching ${reportType} data:`, error);
    }
  };

  useEffect(() => {
    if (landlordId) {
      fetchMetadata();
      fetchData();
    }
  }, [reportType, startDate, endDate, expenseType, selectedField,
     selectedCrop, startYear, endYear, landlordId,resourceName,resourceStatus
    ,machineryName,machineryStatus,workerRole,workerName,workerContact]);

  const renderTableRows = () => {
    if (reportType === 'Expenses') {
      return data.map((expense) => (
        <tr key={expense.Expense_ID}>
          <td style={styles.tableCell}>{expense.Expense_ID}</td>
          <td style={styles.tableCell}>${expense.Amount}</td>
          <td style={styles.tableCell}>{expense.Description}</td>
          <td style={styles.tableCell}>{expense.Expense_Type}</td>
          <td style={styles.tableCell}>{expense.Date.split('T')[0]}</td>
        </tr>
      ));
    } else if (reportType === 'CropPerformance') {
      return data.map((crop) => (
        <tr key={crop.Yield_ID}>
          <td style={styles.tableCell}>{crop.Yield_ID}</td>
          <td style={styles.tableCell}>{crop.Field}</td>
          <td style={styles.tableCell}>{crop.Crop_Name}</td>
          <td style={styles.tableCell}>{crop.Predicted_Yield} tons</td>
          <td style={styles.tableCell}>{crop.Actual_Yield || 'N/A'} tons</td>
          <td style={styles.tableCell}>{crop.Year}</td>
        </tr>
      ));
    }
    else if (reportType === 'ResourceUtilization') {
        return data.map((resource) => (
          <tr key={resource.Resource_ID}>
            <td style={styles.tableCell}>{resource.Resource_ID}</td>
            <td style={styles.tableCell}>{resource.Name}</td>
            <td style={styles.tableCell}>{resource.Quantity}</td>
            <td style={styles.tableCell}>{resource.Unit}</td>
            <td style={styles.tableCell}>{resource.Status}</td>
            <td style={styles.tableCell}>{resource.Field_Location || 'General'}</td>
          </tr>
        ));
      }
      else if (reportType === 'MachineryUsage') {
        return data.map((machinery) => (
          <tr key={machinery.Machinery_ID}>
            <td style={styles.tableCell}>{machinery.Machinery_ID}</td>
            <td style={styles.tableCell}>{machinery.Name}</td>
            <td style={styles.tableCell}>{machinery.Status}</td>
          </tr>
        ));
      }
      else if (reportType === 'WorkerActivity') {
        return data.map((worker) => (
          <tr key={worker.Worker_ID}>
            <td style={styles.tableCell}>{worker.Worker_ID}</td>
            <td style={styles.tableCell}>{worker.Name}</td>
            <td style={styles.tableCell}>{worker.Contact}</td>
            <td style={styles.tableCell}>{worker.Role}</td>
            <td style={styles.tableCell}>{worker.Field_Location || 'Unassigned'}</td>
          </tr>
        ));
      }
      
    return (
      <tr>
        <td style={styles.tableCell} colSpan="5">
          Data for {reportType} will appear here.
        </td>
      </tr>
    );
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Landlord Reports</h1>

      {/* Report Selection */}
      <div style={styles.filters}>
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          style={styles.input}
        >
          <option value="Expenses">Expense Report</option>
          <option value="CropPerformance">Crop Performance Report</option>
          <option value="ResourceUtilization">Resource Utilization Report</option>
          <option value="WorkerActivity">Worker Activity Report</option>
          <option value="MachineryUsage">Machinery Usage Report</option>
        </select>

        {/* Filters for Expense Report */}
        {reportType === 'Expenses' && (
          <>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={styles.input}
              placeholder="Start Date"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={styles.input}
              placeholder="End Date"
            />
            <select
              value={expenseType}
              onChange={(e) => setExpenseType(e.target.value)}
              style={styles.input}
            >
              <option value="">All Types</option>
              <option value="Labor">Labor</option>
              <option value="Fuel">Fuel</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Other">Other</option>
            </select>
          </>
        )}

        {/* Filters for Crop Performance */}
        {reportType === 'CropPerformance' && (
          <>
            <select
              value={selectedField}
              onChange={(e) => setSelectedField(e.target.value)}
              style={styles.input}
            >
              <option value="">All Fields</option>
              {fields.map((field) => (
                <option key={field.Field_ID} value={field.Field_ID}>
                  {field.Location}
                </option>
              ))}
            </select>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              style={styles.input}
            >
              <option value="">All Crops</option>
              {crops.map((crop) => (
                <option key={crop.Crop_ID} value={crop.Crop_ID}>
                  {crop.Crop_Name}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Start Year"
              value={startYear}
              onChange={(e) => setStartYear(e.target.value)}
              style={styles.input}
            />
            <input
              type="number"
              placeholder="End Year"
              value={endYear}
              onChange={(e) => setEndYear(e.target.value)}
              style={styles.input}
            />
          </>
        )}
         {/* Filters for Resource Utilization Report */}
         {reportType === 'ResourceUtilization' && (
          <>
            <input
              type="text"
              placeholder="Resource Name"
              value={resourceName}
              onChange={(e) => setResourceName(e.target.value)}
              style={styles.input}
            />
            <select
              value={resourceStatus}
              onChange={(e) => setResourceStatus(e.target.value)}
              style={styles.input}
            >
              <option value="">All Statuses</option>
              <option value="Available">Available</option>
              <option value="In Use">In Use</option>
              <option value="Depleted">Depleted</option>
            </select>
            </>
        )}
        {reportType === 'MachineryUsage' && (
  <>
    <input
      type="text"
      placeholder="Machinery Name"
      value={machineryName}
      onChange={(e) => setMachineryName(e.target.value)}
      style={styles.input}
    />
    <select
      value={machineryStatus}
      onChange={(e) => setMachineryStatus(e.target.value)}
      style={styles.input}
    >
      <option value="">All Statuses</option>
      <option value="In Use">In Use</option>
      <option value="Idle">Idle</option>
      <option value="Under Maintenance">Under Maintenance</option>
    </select>
     </>
        )}
        
        
        {reportType === 'WorkerActivity' && (
  <>
    <input
      type="text"
      placeholder="Worker Name"
      value={workerName}
      onChange={(e) => setWorkerName(e.target.value)}
      style={styles.input}
    />
    <input
      type="text"
      placeholder="Worker Contact"
      value={workerContact}
      onChange={(e) => setWorkerContact(e.target.value)}
      style={styles.input}
    />
    <select
      value={workerRole}
      onChange={(e) => setWorkerRole(e.target.value)}
      style={styles.input}
    >
      <option value="">All Roles</option>
      {roles.map((role) => (
        <option key={role} value={role}>
          {role}
        </option>
      ))}
    </select>
    <select
      value={selectedField}
      onChange={(e) => setSelectedField(e.target.value)}
      style={styles.input}
    >
      <option value="">All Fields</option>
      {fields.map((field) => (
        <option key={field.Field_ID} value={field.Field_ID}>
          {field.Location}
        </option>
      ))}
    </select>
  </>
        )}

      </div>

      {/* Report Table */}
      <div style={styles.card}>
        <h2 style={styles.sectionHeading}>{reportType} Data</h2>
        <table style={styles.table}>
          <thead>
            <tr>
              {reportType === 'Expenses' && (
                <>
                  <th style={styles.tableHeader}>ID</th>
                  <th style={styles.tableHeader}>Amount</th>
                  <th style={styles.tableHeader}>Description</th>
                  <th style={styles.tableHeader}>Type</th>
                  <th style={styles.tableHeader}>Date</th>
                </>
              )}
              {reportType === 'CropPerformance' && (
                <>
                  <th style={styles.tableHeader}>Yield ID</th>
                  <th style={styles.tableHeader}>Field</th>
                  <th style={styles.tableHeader}>Crop</th>
                  <th style={styles.tableHeader}>Predicted Yield</th>
                  <th style={styles.tableHeader}>Actual Yield</th>
                  <th style={styles.tableHeader}>Year</th>
                </>
              )}
                {reportType === 'ResourceUtilization' && (
                <>
                  <th style={styles.tableHeader}>ID</th>
                  <th style={styles.tableHeader}>Name</th>
                  <th style={styles.tableHeader}>Quantity</th>
                  <th style={styles.tableHeader}>Unit</th>
                  <th style={styles.tableHeader}>Status</th>
                  <th style={styles.tableHeader}>Field</th>
                </>
              )}
             {reportType === 'MachineryUsage' && (
  <>
    <th style={styles.tableHeader}>ID</th>
    <th style={styles.tableHeader}>Name</th>
    <th style={styles.tableHeader}>Status</th>
  </>
                )}
                {reportType === 'WorkerActivity' && (
  <>
    <th style={styles.tableHeader}>Worker ID</th>
    <th style={styles.tableHeader}>Name</th>
    <th style={styles.tableHeader}>Contact</th>
    <th style={styles.tableHeader}>Role</th>
    <th style={styles.tableHeader}>Field</th>
  </>
                )}

            </tr>
          </thead>
          <tbody>{renderTableRows()}</tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f9f9f9',
    minHeight: '100vh',
  },
  heading: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '20px',
  },
  filters: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  input: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px',
    minWidth: '150px',
  },
  button: {
    padding: '10px 15px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    padding: '20px',
    marginBottom: '20px',
  },
  sectionHeading: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '10px',
    borderBottom: '2px solid #4CAF50',
    paddingBottom: '5px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '10px',
  },
  tableHeader: {
    backgroundColor: '#4CAF50',
    color: '#fff',
    padding: '10px',
    textAlign: 'left',
  },
  tableCell: {
    padding: '10px',
    borderBottom: '1px solid #ddd',
  },
};

export default LandlordReports;


