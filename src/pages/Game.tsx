import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import UserInfo from '../components/UserInfo';
import planeImage from '../assets/plane.svg';
import logoImage from '../assets/logo.svg';
import errorImage from '../assets/error.svg';
import errorExitImage from '../assets/error-exit.svg';
import '../styles/Game.css';

const Game = () => {
  const navigate = useNavigate();
  const { balance, deductBalance } = useUser();
  const [signal, setSignal] = useState<string>('');
  const [displaySignal, setDisplaySignal] = useState<string>('');
  const [timer, setTimer] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showError, setShowError] = useState<boolean>(false);
  const [isSignalActive, setIsSignalActive] = useState<boolean>(false);
  const [isErrorTimerActive, setIsErrorTimerActive] = useState<boolean>(false);

  const getRandomFloat = (min: number, max: number, decimals: number): number => {
    const str = (Math.random() * (max - min) + min).toFixed(decimals);
    return parseFloat(str);
  };

  const showErrorMessage = (message: string) => {
    setErrorMessage(message);
    setShowError(true);
    setIsErrorTimerActive(true);
    setTimeout(() => {
      setShowError(false);
      setIsErrorTimerActive(false);
    }, 5000);
  };

  const handleGetSignal = async () => {
  if (balance < 1) {
    showErrorMessage('Số xu không đủ. Vui lòng liên hệ admin cấp miễn phí!');
    return;
  }

  const success = await deductBalance(1);
  if (!success) {
    showErrorMessage('Không thể trừ xu. Vui lòng thử lại!');
    return;
  }

  // Tạo xác suất có trọng số
  const weightedRandom = () => {
    const rand = Math.random();
    if (rand < 0.2) {
      return getRandomFloat(1.0, 1.2, 2);
    } else if (rand < 0.6) {
      return getRandomFloat(1.2, 3.0, 2);
    }else if (rand < 0.95) {
      return getRandomFloat(3.0, 5.2, 2);
    } else {
      return getRandomFloat(5.2, 40.99, 2);
    }
  };

  let receivingSignal = weightedRandom();

  // Xử lý làm tròn đặc biệt nếu cần
  if (receivingSignal.toString().length === 3) {
    receivingSignal += 0.1;
  }
  if (receivingSignal.toString().length === 1) {
    receivingSignal += 0.01;
  }

  setSignal(`${receivingSignal}x`);
  setIsSignalActive(true);
  setTimer(60);
};


  const handleGetSignalTwo = () => {
    setIsErrorTimerActive(true);
    setShowError(true);
    setErrorMessage('Wait for the time to expire');
    setTimeout(() => {
      setShowError(false);
      setIsErrorTimerActive(false);
    }, 5000);
  };

  useEffect(() => {
    if (signal) {
      const finalValue = parseFloat(signal);
      let currentValue = 0.01;
      const duration = 2000; // 2 seconds
      const steps = 50; // 50 steps
      const increment = (finalValue - currentValue) / steps;
      const intervalTime = duration / steps;

      const interval = setInterval(() => {
        currentValue += increment;
        if (currentValue >= finalValue) {
          currentValue = finalValue;
          clearInterval(interval);
        }
        setDisplaySignal(`${currentValue.toFixed(2)}x`);
      }, intervalTime);

      return () => clearInterval(interval);
    }
  }, [signal]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && isSignalActive) {
      setIsSignalActive(false);
      setSignal('');
      setDisplaySignal('');
    }
    return () => clearInterval(interval);
  }, [timer, isSignalActive]);

  return (
    <div className="background">
      <div className="container">
        <UserInfo />
        <img className="pers-animate" src={planeImage} alt="plane" />

        <div className={`error-notification ${showError ? '' : 'deactivate'}`}>
          <div className="error-background"></div>
          <img className="icon-error" src={errorImage} alt="error" />
          <p className="text-error">{errorMessage}</p>
          <div className="error-exit" onClick={() => setShowError(false)}>
            <img src={errorExitImage} alt="exit" />
          </div>
          <div className={`error-progress ${isErrorTimerActive ? 'animate' : ''}`}></div>
        </div>

        <div className="top-content">
          <img draggable={false} src={logoImage} alt="logo" className="logo-game" />
          
          <a 
            target="_blank" 
            rel="noopener noreferrer"
            href="https://t.me/CachepvangSlot" 
            className="z-index-100"
          >
            <p className="name-bot">@cachepvangSlot</p>
          </a>
        </div>

        <div className="print-signal">
          {displaySignal || <span>Click on<br />"GET SIGNAL"</span>}
        </div>

        <div className={`stop-signal-time ${isSignalActive ? '' : 'deactivate'}`}>
          <p className="stop-timer">{timer}<span> seconds</span></p>
          <div className={`stop-progress ${isSignalActive ? 'animate' : ''}`}></div>
        </div>

        <div className="button-game">
          <button 
            className={`get-signal ${isSignalActive ? 'deactivate' : ''}`}
            onClick={handleGetSignal}
            disabled={isSignalActive}
          >
            GET SIGNAL
          </button>
          <a 
            target="_blank" 
            rel="noopener noreferrer"
            href="https://m.f16878.vip/home/register?id=616801259&currency=VND" 
            className="game-here"
          >
            GAME HERE
          </a>
        </div>
      </div>
    </div>
  );
};

export default Game; 
