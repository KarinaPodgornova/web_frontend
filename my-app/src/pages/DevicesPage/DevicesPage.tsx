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

  // Загрузка данных (API или Mock)
  const loadData = async (searchQuery?: string) => {
    dispatch(setLoading(true));

    try {
      const apiData = await listDevices({ device_query: searchTitle });

      if (apiData.length > 0) {
        dispatch(setDevices(apiData));
      } else {
        let filteredMock = DEVICES_MOCK;
        if (searchQuery) {
          filteredMock = DEVICES_MOCK.filter(device =>
            device.name.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        dispatch(setDevices(filteredMock));
      }
    } catch (error) {
      let filteredMock = DEVICES_MOCK;
      if (searchQuery) {
        filteredMock = DEVICES_MOCK.filter(device =>
          device.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      dispatch(setDevices(filteredMock));
    } finally {
      dispatch(setLoading(false));
    }
  };

  // При первом рендере подгружаем данные
  useEffect(() => {
    loadData(searchTitle);
  }, []);

  // Поиск
  const handleSearch = async () => {
    if (searchTitle) dispatch(addToHistory(searchTitle));
    await loadData(searchTitle);
  };

  // Кнопка корзины
  const handleCartClick = async () => {
    try {
      const response = await fetch('/api/v1/current-calculations/current-cart', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Network response was not ok');

      console.log('Cart request successful');
    } catch (error) {
      console.error('Error making cart request:', error);
    }
  };

  return (
    <div className="devices-page">
      <Header />

      <BreadCrumbs crumbs={[{ label: ROUTE_LABELS.DEVICES }]} />

      <main>
        <div className="info-banner">
          <p>ВЫБЕРИТЕ УСТРОЙСТВО</p>
          <img src="/web_frontend/logo-big.png" alt="Logo" />
          <div className="search-container-banner">
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