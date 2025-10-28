import "./ITunesPage.css";
import { type FC, useState } from "react";
import { Col, Row, Spinner } from "react-bootstrap";
import { type ITunesMusic, getMusicByName } from "../modules/itunesApi";
import InputField  from "../components/InputField";
import { BreadCrumbs } from "../components/BreadCrumbs";
import { ROUTES, ROUTE_LABELS } from "../Routes";
import { MusicCard } from "../components/MusicCard";
import { useNavigate } from "react-router-dom";
import { SONGS_MOCK } from "../modules/mock";

const ITunesPage: FC = () => {
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [music, setMusic] = useState<ITunesMusic[]>([]);

  const navigate = useNavigate();

  const handleSearch = () => {
    setLoading(true);
    getMusicByName(searchValue)
      .then((response) => {
        setMusic(
          response.results.filter((item) => item.wrapperType === "track")
        );
        setLoading(false);
      })
      .catch(() => { // В случае ошибки используем mock данные, фильтруем по имени
        setMusic(
          SONGS_MOCK.results.filter((item) =>
            item.collectionCensoredName
              .toLocaleLowerCase()
              .startsWith(searchValue.toLocaleLowerCase())
          )
        );
        setLoading(false);
      });
  };



  const handleCardClick = (id: number) => {
    // клик на карточку, переход на страницу альбома
    navigate(`${ROUTES.ALBUMS}/${id}`);
  };

  return (
    <div className="container">
      <BreadCrumbs crumbs={[{ label: ROUTE_LABELS.ALBUMS }]} />
      
      <InputField
        value={searchValue}
        setValue={(value) => setSearchValue(value)}
        loading={loading}
        onSubmit={handleSearch}
      />

      {loading && ( // здесь можно было использовать тернарный оператор, но это усложняет читаемость
        <div className="loadingBg">
          <Spinner animation="border" />
        </div>
      )}
      {!loading &&
        (!music.length /* Проверка на существование данных */ ? (
          <div>
            <h1>К сожалению, пока ничего не найдено :(</h1>
          </div>
        ) : (
          <Row xs={4} md={4} className="g-4">
            {music.map((item, index) => (
              <Col key={index}>
                <MusicCard
                  imageClickHandler={() => handleCardClick(item.collectionId)}
                  {...item}
                />
              </Col>
            ))}
          </Row>
        ))}
    </div>
  );
};

export default ITunesPage;