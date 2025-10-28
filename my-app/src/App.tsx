import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AlbumPage } from "./pages/AlbumPage";
import ITunesPage from "./pages/ITunesPage";
import { ROUTES } from "./Routes";
import { HomePage } from "./pages/HomePage";
import Navition from "./components/Navigation";

function App() {
  return (
    <BrowserRouter>
    <Navition/>
      <Routes>
        <Route path={ROUTES.HOME} index element={<HomePage />} />
        <Route path={ROUTES.ALBUMS} element={<ITunesPage />} />
        <Route path={`${ROUTES.ALBUMS}/:id`} element={<AlbumPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;