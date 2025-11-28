import { BrowserRouter, Route, Routes } from "react-router-dom";
import DevicesPage from "./pages/DevicesPage/DevicesPage";
import { ROUTES } from "./Routes";
import { HomePage } from "./pages/HomePage";
import DevicePage from './pages/DevicePage';
import SignInPage from './pages/SignInPage/SignInPage.tsx';
import SignUpPage from './pages/SignUpPage/SignUpPage';

import 'bootstrap/dist/css/bootstrap.min.css'

import AccountPage from "./pages/AccountPage/AccountPage";

import CurrentCalculationPage from './pages/CurrentCalculationPage/CurrentCalculationPage';
import CurrentCalculationsPage from './pages/CurrentCalculationsPage/CurrentCalculationsPage';





function App() {
  return (
    <BrowserRouter basename="/web_frontend">
      <Routes>
      <Route path={ROUTES.Home} element={<HomePage />} />
        <Route path={ROUTES.DEVICES} element={<DevicesPage />} />
        <Route path={ROUTES.DEVICE} element={<DevicePage />} />
        <Route path={ROUTES.CURRENTS} element={<CurrentCalculationsPage />} />
        <Route path={ROUTES.CURRENT} element={<CurrentCalculationPage />} />
        
        <Route path={ROUTES.SignIn} element={<SignInPage />} /> 
        <Route path={ROUTES.SignUp} element={<SignUpPage />} />
        <Route path={ROUTES.Profile} element={<AccountPage />} />

   
      </Routes>
    </BrowserRouter>
  );
}

export default App;