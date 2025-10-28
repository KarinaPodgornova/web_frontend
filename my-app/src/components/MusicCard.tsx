import { type FC } from "react";
import { Button, Card } from "react-bootstrap";
import "./MusicCard.css";
import defaultImage from "../assets/DefaultImage.jpg";

interface ICardProps {
  artworkUrl100: string;
  artistName: string;
  collectionCensoredName: string;
  trackViewUrl: string;
  imageClickHandler: () => void;
}

export const MusicCard: FC<ICardProps> = ({
  artworkUrl100,
  artistName,
  collectionCensoredName,
  trackViewUrl,
  imageClickHandler,
}) => {

  return (
    <Card className="card">
      <Card.Img
        className="cardImage"
        variant="top"
        src={artworkUrl100 || defaultImage}
        height={100}
        width={100}
        onClick={imageClickHandler}
      />
      <Card.Body>
        <div className="textStyle">
          <Card.Title>{collectionCensoredName}</Card.Title>
        </div>
        <div className="textStyle">
          <Card.Text>{artistName}</Card.Text>
        </div>
        <Button
          className="cardButton"
          href={trackViewUrl}
          target="_blank"
          variant="primary"
        >
          Открыть в ITunes
        </Button>
      </Card.Body>
    </Card>
  );
};