import react from 'react'
import {useState,useEffect} from 'react'
import axios from 'axios';
import reactLogo from './assets/react.svg';

function Home(){
  const [email, setEmail] = useState('');
  const [name,setName] = useState();
  const [addr,setAddr] = useState([]);
  const [show, setShow] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    name: '',
    addressline1: '',
    addressline2: '',
    postCode: '',
    city: '',
    country: ''
  });
  const [activeTab, setActiveTab] = useState('General');
  
  // Debug: Log when activeTab changes
  useEffect(() => {
    console.log('Active tab changed to:', activeTab);
  }, [activeTab]);
  
  // Transactions state (no dummy data, ready for backend integration)
  const [transactions, setTransactions] = useState([]);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [lineDetails, setLineDetails] = useState([]);

  useEffect(() => {
    const Email = localStorage.getItem("email");
    if (Email) setEmail(Email);
  }, []);

  useEffect(() => {
    if (!email) return;
    axios.post('http://127.0.0.1:3001/getInfo', { email }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then(result => {
        setName(result.data.name);
        setAddr(result.data.address || []);
      })
      .catch(err => console.log(err));
  }, [email]);

  useEffect(() => {
    if (!email) return;
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://127.0.0.1:3001/transactions', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setTransactions(response.data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };
    fetchTransactions();
  }, [email]);


  // Handle form input changes
  const handleFormChange = (e) => {
    setAddressForm({ ...addressForm, [e.target.name]: e.target.value });
  };

  // Handle add address
  const handleAddAddress = (e) => {
    e.preventDefault();
    axios.post('http://127.0.0.1:3001/addAddress',
      {
        email: email,
        address: addressForm
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    )
      .then(result => {
        setAddr(result.data.addresses);
        setAddressForm({ name: '', addressline1: '', addressline2: '', postCode: '', city: '', country: '' });
      })
      .catch(err => {
        alert('Error adding address. Please try again.');
      });
  };

  // Handle start editing
  const handleEditClick = (address) => {
    setEditingAddressId(address._id);
    setAddressForm({
      name: address.name,
      addressline1: address.addressline1,
      addressline2: address.addressline2 || '',
      postCode: address.postCode,
      city: address.city,
      country: address.country
    });
  };

  // Handle update address
  const handleUpdateAddress = (e) => {
    e.preventDefault();
    axios.put('http://127.0.0.1:3001/updateAddress',
      {
        email: email,
        addressId: editingAddressId,
        updatedAddress: addressForm
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    )
      .then(result => {
        setAddr(result.data.addresses);
        setEditingAddressId(null);
        setAddressForm({ name: '', addressline1: '', addressline2: '', postCode: '', city: '', country: '' });
        alert('Address updated successfully!');
      })
      .catch(err => {
        alert('Error updating address. Please try again.');
      });
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingAddressId(null);
    setAddressForm({ name: '', addressline1: '', addressline2: '', postCode: '', city: '', country: '' });
  };

  // Transaction related functions
  const handleTransactionSelect = (transactionId) => {
    setSelectedTransactions(prev => 
      prev.includes(transactionId) 
        ? prev.filter(id => id !== transactionId)
        : [...prev, transactionId]
    );
  };

  const handleSelectAllTransactions = () => {
    if (selectedTransactions.length === transactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(transactions.map(t => t._id));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return '#4CAF50';
      case 'Pending': return '#FF9800';
      case 'Completed': return '#2196F3';
      case 'Cancelled': return '#F44336';
      default: return '#757575';
    }
  };

  const handleOrderClick = async (orderId, transactionId) => {
    if (selectedOrder === orderId) {
      setSelectedOrder(null);
      setLineDetails([]);
      return;
    }
    setSelectedOrder(orderId);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://127.0.0.1:3001/line-details/${transactionId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setLineDetails(response.data);
    } catch (error) {
      setLineDetails([]);
      console.error('Error fetching line details:', error);
    }
  };


  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <button className="hamburger-menu">&#9776;</button>
        </div>
        <nav className="sidebar-nav">
          <div className={`sidebar-item ${activeTab === 'General' ? 'active' : ''}`} onClick={() => setActiveTab('General')}>
            <img src={reactLogo} alt="General" className="sidebar-icon" />
            <span>General</span>
          </div>
          <div className={`sidebar-item ${activeTab === 'Addresses' ? 'active' : ''}`} onClick={() => setActiveTab('Addresses')}>
            <span className="sidebar-icon">👤</span>
            <span>Addresses</span>
          </div>
          <div className={`sidebar-item ${activeTab === 'Transactions' ? 'active' : ''}`} onClick={() => setActiveTab('Transactions')}>
            <span className="sidebar-icon">📦</span>
            <span>Transactions</span>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="card">
          {activeTab === 'General' && (
            <form className="general-form">
              <h2 className="form-section-title">General</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>Title</label>
                  <select className="form-input"><option>Mr</option></select>
                </div>
                <div className="form-group">
                  <label>First Name</label>
                  <input className="form-input" value={name ? name.split(' ')[0] : ''} readOnly />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input className="form-input" value={name ? name.split(' ')[1] : ''} readOnly />
                </div>
                <div className="form-group">
                  <label>Company Name</label>
                  <input className="form-input" placeholder="Company Name" readOnly />
                </div>
                <div className="form-group">
                  <label>Customer Type</label>
                  <select className="form-input"><option>Retail</option></select>
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input className="form-input" placeholder="day/month/year" type="date" />
                </div>
                <div className="form-group">
                  <label>Customer Since</label>
                  <input className="form-input" value={new Date().toLocaleDateString('en-GB')} readOnly />
                </div>
              </div>
              <h3 className="form-section-title">Contacts</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>E-mail</label>
                  <input className="form-input" value={email} readOnly />
                </div>
                <div className="form-group checkbox-group">
                  <input type="checkbox" id="emailNotProvided" disabled />
                  <label htmlFor="emailNotProvided">E-mail not provided</label>
                </div>
                <div className="form-group">
                  <label>Mobile Number</label>
                  <input className="form-input" value="12345444444" readOnly />
                </div>
              </div>
            </form>
          )}

          {activeTab === 'Addresses' && (
            <div className="addresses-section">
              <h2 className="form-section-title">Addresses</h2>
              <table className="address-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Address Line 1</th>
                    <th>Address Line 2</th>
                    <th>Post Code</th>
                    <th>City</th>
                    <th>Country</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {addr && addr.length > 0 ? addr.map((address, idx) => (
                    <tr key={address._id || idx}>
                      <td>{address.name}</td>
                      <td>{address.addressline1}</td>
                      <td>{address.addressline2}</td>
                      <td>{address.postCode}</td>
                      <td>{address.city}</td>
                      <td>{address.country}</td>
                      <td>
                        <button className="secondary-btn" style={{padding: '4px 8px', fontSize: '0.9rem'}} onClick={() => handleEditClick(address)}>Edit</button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="7">No addresses found</td></tr>
                  )}
                </tbody>
              </table>

              {/* Add or Update Address Form */}
              <form className="add-address-form" onSubmit={editingAddressId ? handleUpdateAddress : handleAddAddress}>
                <input type="text" name="name" className="form-input" placeholder="Name" value={addressForm.name} onChange={handleFormChange} required />
                <input type="text" name="addressline1" className="form-input" placeholder="Address Line 1" value={addressForm.addressline1} onChange={handleFormChange} required />
                <input type="text" name="addressline2" className="form-input" placeholder="Address Line 2" value={addressForm.addressline2} onChange={handleFormChange} />
                <input type="text" name="postCode" className="form-input" placeholder="Post Code" value={addressForm.postCode} onChange={handleFormChange} required />
                <input type="text" name="city" className="form-input" placeholder="City" value={addressForm.city} onChange={handleFormChange} required />
                <input type="text" name="country" className="form-input" placeholder="Country" value={addressForm.country} onChange={handleFormChange} required />
                <button type="submit" className="primary-btn">{editingAddressId ? 'Update Address' : 'Add Address'}</button>
                {editingAddressId && (
                  <button type="button" className="secondary-btn" onClick={handleCancelEdit}>Cancel</button>
                )}
              </form>
            </div>
          )}

          {activeTab === 'Transactions' && (
            <div className="transactions-section">
              <div className="transactions-header">
                <h2>Transactions</h2>
              </div>
              <div className="transactions-table-container">
                <table className="transactions-table">
                    <thead>
                      <tr>
                        <th>
                          <input 
                            type="checkbox" 
                            checked={selectedTransactions.length === transactions.length && transactions.length > 0}
                            onChange={handleSelectAllTransactions}
                          />
                        </th>
                        <th>
                          Order
                          <span className="sort-icon">⋮⋮</span>
                        </th>
                        <th>
                          Status
                          <span className="sort-icon">⋮⋮</span>
                        </th>
                        <th>
                          No of Items
                          <span className="sort-icon">⋮⋮</span>
                        </th>
                        <th>
                          Total
                          <span className="sort-icon">⋮⋮</span>
                        </th>
                        <th>
                          Created On
                          <span className="sort-icon">⋮⋮</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.length > 0 ? (
                        transactions.map((transaction) => (
                          <tr 
                            key={transaction._id}
                            className={selectedOrder === transaction.order ? 'selected-row' : ''}
                          >
                            <td>
                              <input 
                                type="checkbox" 
                                checked={selectedTransactions.includes(transaction._id)}
                                onChange={() => handleTransactionSelect(transaction._id)}
                              />
                            </td>
                            <td>
                              <a 
                                href="#" 
                                className="order-link" 
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleOrderClick(transaction.order, transaction._id);
                                }}
                                style={{ cursor: 'pointer' }}
                              >
                                {transaction.order}
                              </a>
                            </td>
                            <td>
                              <span 
                                className="status-badge"
                                style={{ backgroundColor: getStatusColor(transaction.status) }}
                              >
                                {transaction.status}
                              </span>
                            </td>
                            <td>{transaction.noOfItems}</td>
                            <td>£{transaction.total.toFixed(2)}</td>
                            <td>{new Date(transaction.createdOn).toLocaleString('en-GB')}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" style={{textAlign: 'center', padding: '20px'}}>
                            No transactions found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
              </div>

              {/* Line Details Section */}
              {selectedOrder && (
                <div className="line-details-section">
                  <div className="line-details-header">
                    <h2>Line Details</h2>
                  </div>
                  <div className="line-details-table-container">
                    <table className="line-details-table">
                      <thead>
                        <tr>
                          <th>Code<span className="sort-icon">⋮⋮</span></th>
                          <th>Description<span className="sort-icon">⋮⋮</span></th>
                          <th>Sold Price<span className="sort-icon">⋮⋮</span></th>
                          <th>Quantity<span className="sort-icon">⋮⋮</span></th>
                          <th>Unit Price<span className="sort-icon">⋮⋮</span></th>
                          <th>Discount Value<span className="sort-icon">⋮⋮</span></th>
                        </tr>
                      </thead>
                      <tbody>
                        {lineDetails.length > 0 ? (
                          lineDetails.map((item, index) => (
                            <tr key={item._id || index}>
                              <td>{item.code}</td>
                              <td>{item.description}</td>
                              <td>£{item.soldPrice.toFixed(2)}</td>
                              <td>{item.quantity}</td>
                              <td>£{item.unitPrice.toFixed(2)}</td>
                              <td>£{item.discountValue.toFixed(2)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan="6" style={{textAlign: 'center', padding: '20px'}}>No line details found</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Home;
