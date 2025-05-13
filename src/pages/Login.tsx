import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, collection, Firestore, getDoc } from 'firebase/firestore';
import { Auth } from 'firebase/auth';
import { auth, db } from '../firebase';
import '../styles/Login.css';
import logoImage from '../assets/logo.svg';

interface FormData {
  username: string;
  password: string;
  confirmPassword: string;
  contact: string;
}

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
    confirmPassword: '',
    contact: ''
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth as Auth, (user: User | null) => {
      if (user) {
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Đăng nhập
        const email = `${formData.username}@aviator.com`;
        await signInWithEmailAndPassword(auth as Auth, email, formData.password);
        navigate('/');
      } else {
        // Đăng ký
        if (formData.password !== formData.confirmPassword) {
          setError('Mật khẩu xác nhận không khớp');
          setLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          setError('Mật khẩu phải có ít nhất 6 ký tự');
          setLoading(false);
          return;
        }

        // Kiểm tra username đã tồn tại chưa
        const usersRef = collection(db as Firestore, 'User');
        const q = await getDoc(doc(usersRef, formData.username));
        if (q.exists()) {
          setError('Tên đăng nhập đã tồn tại');
          setLoading(false);
          return;
        }

        // Tạo email giả từ username để sử dụng Firebase Auth
        const email = `${formData.username}@aviator.com`;
        const userCredential = await createUserWithEmailAndPassword(auth as Auth, email, formData.password);
        
        // Lưu thông tin người dùng vào collection User
        const userRef = doc(collection(db as Firestore, 'User'), formData.username);
        await setDoc(userRef, {
          username: formData.username.toLowerCase(),
          password: formData.password,
          contact: formData.contact,
          balance: 0,
          createdAt: new Date().toISOString(),
          uid: userCredential.user.uid,
          isAdmin: formData.username.toLowerCase() === 'admin'
        });

        navigate('/');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Tên đăng nhập đã tồn tại');
      } else if (err.code === 'auth/invalid-email') {
        setError('Tên đăng nhập không hợp lệ');
      } else if (err.code === 'auth/weak-password') {
        setError('Mật khẩu quá yếu');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Tên đăng nhập hoặc mật khẩu không đúng');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Tính năng đăng ký chưa được bật. Vui lòng liên hệ admin.');
      } else {
        setError('Tên tài khoản hoặc mật khẩu sai');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="background">
      <div className="container">
        <img draggable={false} src={logoImage} alt="logo" className="logo-game" />
        
        <div className="auth-container">
          <div className="auth-tabs">
            <button 
              className={`auth-tab ${isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(true)}
            >
              Đăng nhập
            </button>
            <button 
              className={`auth-tab ${!isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(false)}
            >
              Đăng ký
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <input
                type="text"
                name="username"
                placeholder="Tên đăng nhập"
                value={formData.username}
                onChange={handleChange}
                required
                autoComplete="username"
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="Mật khẩu"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete={isLogin ? "current-password" : "new-password"}
              />
            </div>
            {!isLogin && (
              <>
                <div className="form-group">
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Xác nhận mật khẩu"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    name="contact"
                    placeholder="Số điện thoại/Zalo/Telegram"
                    value={formData.contact}
                    onChange={handleChange}
                    required
                    autoComplete="tel"
                  />
                </div>
              </>
            )}
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Đang xử lý...' : (isLogin ? 'Đăng nhập' : 'Đăng ký')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login; 
