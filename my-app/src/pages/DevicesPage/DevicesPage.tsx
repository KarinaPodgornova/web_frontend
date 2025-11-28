import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { getCurrentCart } from '../../store/slices/currentCalculationSlice';

import './DevicesPage.css';

export default function DevicesPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { devices, loading } = useAppSelector(state => state.devices);
  const { searchTitle } = useAppSelector(state => state.search);
  const { isAuthenticated } = useAppSelector(state => state.user);
  const { currentCart, devices_count } = useAppSelector(state => state.currentCalculation);


  // --- загрузка устройств
  const loadDevices = async (searchQuery?: string) => {
    dispatch(setLoading(true));
    try {
      const apiData = await listDevices({ device_query: searchQuery });
      dispatch(setDevices(apiData.length > 0 ? apiData : DEVICES_MOCK.filter(item =>
        searchQuery ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
      )));
    } catch {
      dispatch(setDevices(DEVICES_MOCK.filter(item =>
        searchQuery ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
      )));
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    loadDevices(searchTitle);
    if (isAuthenticated) {
      dispatch(getCurrentCart());
    }
  }, [isAuthenticated]);

  const handleSearch = async () => {
    if (searchTitle) dispatch(addToHistory(searchTitle));
    await loadDevices(searchTitle);
  };

  const handleCartClick = () => {
    if (!isAuthenticated) {
      alert('Войдите в систему, чтобы открыть корзину');
      return;
    }
    if (!currentCart?.id) {
      alert('Корзина пуста!');
      return;
    }
    navigate(`/current/${currentCart.id}`);
  };

  return (
    <div className="devices-page">
      <Header />
      <BreadCrumbs crumbs={[{ label: ROUTE_LABELS.DEVICES }]} />

      <main>
        <div className="info-banner">
          <p style={{ marginBottom: '-20px' }}>ВЫБЕРИТЕ УСТРОЙСТВО</p>
          <img src="/web_frontend/logo-big.png" alt="Logo" />
          <div className="search-container" style={{ position: 'absolute', bottom: '30px', left: '20px', marginLeft: '400px', width: '600px' }}>
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
              {devices.length > 0 ? <DevicesList devices={devices} /> : (
                <div className="no-devices">
                  {searchTitle ? `По запросу "${searchTitle}" устройства не найдены` : 'Устройства не найдены'}
                </div>
              )}
            </div>
          )}

          <div className="wrench-after-fourth">
            <CartButton onClick={handleCartClick} count={devices_count} />
          </div>
        </div>
      </main>
    </div>
  );
}
