import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase';
import '../styles/Admin.css';

interface User {
  username: string;
  balance: number;
  contact: string;
  createdAt: string;
}

const ITEMS_PER_PAGE = 10;

const Admin = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    // Filter users based on search term
    const filtered = users.filter(user => 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.contact.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
    setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));
    setCurrentPage(1);
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      const usersQuery = query(collection(db, 'User'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(usersQuery);
      const usersData = querySnapshot.docs.map(doc => ({
        username: doc.id,
        ...doc.data()
      })) as User[];
      setUsers(usersData);
      setFilteredUsers(usersData);
      setTotalPages(Math.ceil(usersData.length / ITEMS_PER_PAGE));
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBalance = async () => {
    if (!selectedUser) return;
    
    const amountNum = parseInt(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Vui lòng nhập số xu hợp lệ');
      return;
    }

    try {
      const userRef = doc(db, 'User', selectedUser.username);
      const newBalance = selectedUser.balance + amountNum;
      await updateDoc(userRef, { balance: newBalance });
      
      // Update local state
      setUsers(users.map(user => 
        user.username === selectedUser.username 
          ? { ...user, balance: newBalance }
          : user
      ));
      
      setSuccess(`Đã thêm ${amountNum} xu cho ${selectedUser.username}`);
      setAmount('');
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating balance:', error);
      setError('Không thể cập nhật số xu');
    }
  };

  const handleDeductBalance = async () => {
    if (!selectedUser) return;
    
    const amountNum = parseInt(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Vui lòng nhập số xu hợp lệ');
      return;
    }

    if (selectedUser.balance < amountNum) {
      setError('Số xu không đủ để trừ');
      return;
    }

    try {
      const userRef = doc(db, 'User', selectedUser.username);
      const newBalance = selectedUser.balance - amountNum;
      await updateDoc(userRef, { balance: newBalance });
      
      // Update local state
      setUsers(users.map(user => 
        user.username === selectedUser.username 
          ? { ...user, balance: newBalance }
          : user
      ));
      
      setSuccess(`Đã trừ ${amountNum} xu của ${selectedUser.username}`);
      setAmount('');
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating balance:', error);
      setError('Không thể cập nhật số xu');
    }
  };

  const getCurrentPageUsers = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredUsers.slice(startIndex, endIndex);
  };

  return (
    <div className="admin-container">
      <h1>Quản lý người dùng</h1>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="search-container">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên đăng nhập hoặc liên hệ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="users-list">
        <table>
          <thead>
            <tr>
              <th>Tên đăng nhập</th>
              <th>Số xu</th>
              <th>Liên hệ</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {getCurrentPageUsers().map(user => (
              <tr key={user.username}>
                <td>{user.username}</td>
                <td>{user.balance.toLocaleString()} xu</td>
                <td>{user.contact}</td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <button 
                    className="action-btn"
                    onClick={() => setSelectedUser(user)}
                  >
                    Cập nhật xu
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Trước
          </button>
          <span className="page-info">
            Trang {currentPage} / {totalPages}
          </span>
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Sau
          </button>
        </div>
      </div>

      {selectedUser && (
        <div className="balance-modal">
          <div className="modal-content">
            <h2>Cập nhật số xu cho {selectedUser.username}</h2>
            <p>Số xu hiện tại: {selectedUser.balance.toLocaleString()} xu</p>
            
            <div className="input-group">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Nhập số xu"
                min="1"
              />
            </div>

            <div className="button-group">
              <button onClick={handleAddBalance} className="add-btn">
                Thêm xu
              </button>
              <button onClick={handleDeductBalance} className="deduct-btn">
                Trừ xu
              </button>
              <button onClick={() => setSelectedUser(null)} className="cancel-btn">
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin; 