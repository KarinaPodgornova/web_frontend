import { useEffect } from 'react';
import Header from '../../components/Header/Header';
import Search from '../../components/Search/Search';
import DevicesList from '../../components/DevicesList/DevicesList';
import { BreadCrumbs } from '../../components/BreadCrumbs/BreadCrumbs';
import CartButton from '../../components/CartButton/CartButton';
import { ROUTE_LABELS } from '../../Routes';

import { listDevices } from '../../modules/DevicesApi';
import { DEVICES_MOCK } from '../../modules/mock';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setDevices, setLoading } from '../../store/slices/deviceSlice';
import { setSearchName, addToHistory } from '../../store/slices/searchSlice';

import './DevicesPage.css';

export default function DevicesPage() {
  const dispatch = useAppDispatch();

  const { devices, loading } = useAppSelector(state => state.devices);
  const { searchTitle } = useAppSelector(state => state.search);

  // --- загрузка устройств (API → fallback на mock)
  const loadDevices = async (searchQuery?: string) => {
    dispatch(setLoading(true));

    try {
      const apiData = await listDevices({ device_query: searchQuery });

      if (apiData.length > 0) {
        dispatch(setDevices(apiData));
      } else {
        // mock-фильтрация
        let filtered = DEVICES_MOCK;
        if (searchQuery) {
          filtered = DEVICES_MOCK.filter(item =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        dispatch(setDevices(filtered));
      }
    } catch {
      // fallback при ошибке
      let filtered = DEVICES_MOCK;
      if (searchQuery) {
        filtered = DEVICES_MOCK.filter(item =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      dispatch(setDevices(filtered));
    } finally {
      dispatch(setLoading(false));
    }
  };

  // --- первый рендер: загрузка списка
  useEffect(() => {
    loadDevices(searchTitle);
  }, []);

  // --- поиск
  const handleSearch = async () => {
    if (searchTitle) {
      dispatch(addToHistory(searchTitle));
    }
    await loadDevices(searchTitle);
  };

  // --- кнопка корзины (оставил твою логику)
  const handleCartClick = async () => {
    try {
      const response = await fetch('/api/v1/current-calculations/current-cart');
      if (!response.ok) throw new Error('Cart request failed');

      console.log('Cart request OK');
    } catch (err) {
      console.error('Cart error:', err);
    }
  };

  return (
    <div className="devices-page">
      <Header />

      <BreadCrumbs crumbs={[{ label: ROUTE_LABELS.DEVICES }]} />

      <main>
        <div className="info-banner">
          <p style={{ marginBottom: '-20px' }}>ВЫБЕРИТЕ УСТРОЙСТВО</p>
          <img src="/web_frontend/logo-big.png" alt="Logo" />

          <div
            className="search-container"
            style={{
              position: 'absolute',
              bottom: '30px',
              left: '20px',
              marginLeft: '400px',
              width: '600px'
            }}
          >
            <Search
              query={searchTitle}
              onQueryChange={(value) => dispatch(setSearchName(value))}
              onSearch={handleSearch}
            />
          </div>
        </div>

        <div className="products-wrapper">
          {loading ? (
            <div>Загрузка...</div>
          ) : (
            <div className="products">
              {devices.length > 0 ? (
                <DevicesList devices={devices} />
              ) : (
                <div className="no-devices">
                  {searchTitle
                    ? `По запросу "${searchTitle}" устройства не найдены`
                    : 'Устройства не найдены'}
                </div>
              )}
            </div>
          )}

          <div className="wrench-after-fourth">
            <CartButton onClick={handleCartClick} />
          </div>
        </div>
      </main>
    </div>
  );
}
