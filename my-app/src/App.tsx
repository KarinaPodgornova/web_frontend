// App.tsx
import { BrowserRouter, Route, Routes } from "react-router-dom";
import DevicesPage from "./pages/DevicesPage";
import { ROUTES } from "./Routes";
import { HomePage } from "./pages/HomePage";
import DevicePage from './pages/DevicePage';
import 'bootstrap/dist/css/bootstrap.min.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.DEVICES} element={<DevicesPage />} />
        <Route path={ROUTES.DEVICE} element={<DevicePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;