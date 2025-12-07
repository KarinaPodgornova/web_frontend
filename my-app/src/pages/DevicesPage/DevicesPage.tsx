import { useEffect, useState } from 'react'; // Добавить useState
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Search from '../../components/Search/Search';
import DevicesList from '../../components/DevicesList/DevicesList';
import { BreadCrumbs } from '../../components/BreadCrumbs/BreadCrumbs';
import CartButton from '../../components/CartButton/CartButton';
import { ROUTE_LABELS } from '../../Routes';

import { listDevices } from '../../modules/DevicesApi';
import { getCurrentCart } from '../../modules/CurrentApi'; // Импорт из модуля, НЕ из слайса!
import { DEVICES_MOCK } from '../../modules/mock';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setDevices, setLoading } from '../../store/slices/deviceSlice';
import { setSearchName, addToHistory } from '../../store/slices/searchSlice';
import { setCurrentCart } from '../../store/slices/currentCalculationSlice'; // ТОЛЬКО синхронный экшен

import './DevicesPage.css';

export default function DevicesPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [loadingCart, setLoadingCart] = useState(false); // Локальное состояние для загрузки корзины

  const { devices, loading } = useAppSelector(state => state.devices);
  const { searchTitle } = useAppSelector(state => state.search);
  const { isAuthenticated } = useAppSelector(state => state.user);
  const { currentCart, devices_count } = useAppSelector(state => state.currentCalculation);

  // --- загрузка устройств
// В DevicesPage.tsx - функция loadDevices:
const loadDevices = async (searchQuery?: string) => {
  dispatch(setLoading(true));
  try {
    // Прямой вызов функции из модуля
    const apiData = await listDevices({ device_query: searchQuery });
    
    dispatch(setDevices(
      apiData.length > 0 ? apiData : DEVICES_MOCK.filter(item =>
        searchQuery ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
      )
    ));
    
  } catch {
    dispatch(setDevices(
      DEVICES_MOCK.filter(item =>
        searchQuery ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
      )
    ));
  } finally {
    dispatch(setLoading(false));
  }
};

  // --- загрузка корзины БЕЗ thunk
  const loadCurrentCart = async () => {
    if (!isAuthenticated) return;
    
    setLoadingCart(true);
    try {
      const cartData = await getCurrentCart(); // Прямой вызов API функции
      if (cartData) {
        dispatch(setCurrentCart(cartData)); // Синхронный экшен в Redux
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setLoadingCart(false);
    }
  };

  useEffect(() => {
    loadDevices(searchTitle);
    loadCurrentCart(); // Вызываем нашу функцию
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
    
    // Проверяем через localStorage или состояние
    const cartId = currentCart?.id || currentCart?.current_id;
    
    if (!cartId) {
      alert('Корзина пуста! Добавьте устройства в расчет.');
      return;
    }
    
    navigate(`/current/${cartId}`);
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
            <div>Загрузка устройств...</div>
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
            <CartButton 
              onClick={handleCartClick} 
              count={devices_count} 
              loading={loadingCart}
            />
          </div>
        </div>
      </main>
    </div>
  );
}