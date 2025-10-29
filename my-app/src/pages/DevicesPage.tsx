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

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [useMock, setUseMock] = useState(false);

  useEffect(() => {
    if (useMock) {
      setDevices(DEVICES_MOCK);
    } else {
      listDevices()
        .then((data) => {
          if (data.length > 0) {
            setDevices(data);
          } else {
            setDevices(DEVICES_MOCK);
            setUseMock(true);
          }
        })
        .catch(() => {
          setDevices(DEVICES_MOCK);
          setUseMock(true);
        });
    }
  }, [useMock]);

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
            device.title.toLowerCase().includes(searchQuery.toLowerCase())
          );
          setDevices(filteredMock);
        } else {
          setDevices([]);
        }
      }
    } catch (error) {
      const filteredMock = DEVICES_MOCK.filter(device =>
        device.title.toLowerCase().includes(searchQuery.toLowerCase())
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
          <p style={{marginBottom: '-20px'}}>ВЫБЕРИТЕ УСТРОЙСТВО</p>
          <img src="http://localhost:9000/lab1/img/logo-big.jpg" alt="BMW Logo" />
          
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
          
          <div className="wrench-after-fourth">
            <a href="/current" className="cart-link">
              <button>
                <i className="fas fa-wrench fa-4x" style={{color: 'black'}}></i>
                <span className="cart-count">0</span>
              </button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}