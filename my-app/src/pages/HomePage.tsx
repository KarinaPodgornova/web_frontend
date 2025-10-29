// pages/HomePage/HomePage.tsx
import { type FC } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../Routes";
import Header from '../components/Header/Header';

import { Button } from "react-bootstrap";
import './HomePage.css'; 
//import backgroundImage from '../assets/background.png';

export const HomePage: FC = () => {
  return (
    <>
      <Header />
  
      <div className="home-banner">
        <div className="banner-content">
          <h1>Устройства для BMW</h1>
          <p>
            Добро пожаловать в каталог устройств для BMW! Здесь вы сможете определить необходимую силу тока для устройств автомобиля.
          </p>
          <Link to={ROUTES.DEVICES}>
            <Button variant="primary">Просмотреть устройства</Button>
          </Link>
        </div>
        <div className="banner-overlay"></div>
    {/* Убрали backgroundImage - используем CSS background */}
      </div>
    </>
  );
};