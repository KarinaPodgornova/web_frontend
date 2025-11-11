// pages/DevicesPage/DevicesPage.tsx
import { useEffect, useState } from 'react';
import Header from '../components/Header/Header';
import Search from '../components/Search/Search';
import DevicesList from '../components/DevicesList/DevicesList';
import { BreadCrumbs } from '../components/BreadCrumbs/BreadCrumbs';
import { listDevices } from '../modules/DevicesApi';
import { DEVICES_MOCK } from '../modules/mock'; 
import type { Device } from '../modules/DevicesTypes';
import './DevicesPage.css';
import logo from '../assets/logo-big.jpg';
import { Link } from 'react-router-dom';

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0); // Добавляем состояние для счетчика
  const [loading, setLoading] = useState(false);
  const [useMock, setUseMock] = useState(false);

  useEffect(() => {
    loadDevices();
    // Здесь можно добавить загрузку количества устройств в корзине из API
    // setCartCount(await getCartCount());
  }, []);

  const loadDevices = async () => {
    setLoading(true);
    try {
      const data = await listDevices();
      if (data && data.length > 0) {
        setDevices(data);
        setUseMock(false);
      } else {
        setDevices(DEVICES_MOCK);
        setUseMock(true);
      }
    } catch (error) {
      console.log('Using mock data due to API error');
      setDevices(DEVICES_MOCK);
      setUseMock(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const filtered = await listDevices({ device_query: searchQuery });
      
      if (filtered.length > 0) {
        setDevices(filtered);
        setUseMock(false);
      } else {
        if (useMock) {
          const filteredMock = DEVICES_MOCK.filter(device =>
            device.name.toLowerCase().includes(searchQuery.toLowerCase())
          );
          setDevices(filteredMock);
        } else {
          setDevices([]);
        }
      }
    } catch (error) {
      const filteredMock = DEVICES_MOCK.filter(device =>
        device.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setDevices(filteredMock);
      setUseMock(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="devices-page">
      <Header />
      
      <BreadCrumbs
        crumbs={[
          { label: "Устройства" },
        ]}
      />

      <div className="container">
        <p className="page-title" style={{marginTop: '5px'}}>МУЗЫКА И ЭЛЕКТРОНИКА</p>
        
        <div className="info-banner">
          <p style={{position: 'absolute'}}>ВЫБЕРИТЕ УСТРОЙСТВО</p>
          <img src={logo} alt="BMW Logo" />
          
          <div className="search-container" style={{position: 'absolute', bottom: '30px', left: '20px', marginLeft: '400px', width: '600px'}}>
            <Search 
              query={searchQuery}
              onQueryChange={setSearchQuery}
              onSearch={handleSearch}
            />
          </div>
        </div>

        <div className="products-wrapper">
          <div className="products">
            {loading ? (
              <div>Загрузка...</div>
            ) : devices.length > 0 ? (
              <DevicesList devices={devices} />
            ) : (
              <div className="no-devices">
                {searchQuery 
                  ? `По запросу "${searchQuery}" устройства не найдены` 
                  : 'Устройства не найдены'
                }
              </div>
            )}
          </div>
          
          {/* Иконка гаечного ключа */}
          <div className="wrench-after-fourth">
            <Link to="/current" className="cart-link">
              <button>
                <i className="fas fa-wrench fa-4x" style={{ color: 'black' }}></i>
                <span className="cart-count">{cartCount}</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}