import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useUser } from '../contexts/UserContext';
import '../styles/UserInfo.css';

const UserInfo = () => {
  const navigate = useNavigate();
  const { balance } = useUser();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="user-info-container">
      <div className="user-info">
        <span className="username">Hi, {auth.currentUser?.email?.split('@')[0]}</span>
        <span className="balance">{balance.toLocaleString()} xu</span>
      </div>
      <button className="logout-btn" onClick={handleLogout}>
        Đăng xuất
      </button>
    </div>
  );
};

export default UserInfo; 
