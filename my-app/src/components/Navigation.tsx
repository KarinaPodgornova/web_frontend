import { Container, Nav, Navbar } from "react-bootstrap";
import {Link} from "react-router-dom";
import { ROUTES, ROUTE_LABELS } from "../Routes";

const Navition = () => {
    return(
        <Navbar bg="light" expand="lg" className="mb-4">
            <Container>
                <Nav className="w-100 d-flex justify-content-between">
                    <Navbar.Brand as={Link} to={ROUTES.HOME}>
                        iTUNES Browser
                    </Navbar.Brand>
                    <div>
                        <Nav.Link as={Link} to={ROUTES.HOME} className="d-inline-block">
                            {ROUTE_LABELS.HOME}
                        </Nav.Link>
                        <Nav.Link as={Link} to={ROUTES.ALBUMS} className="d-inline-block">
                            {ROUTE_LABELS.ALBUMS}
                        </Nav.Link>
                    </div>
                </Nav>
            </Container>
        </Navbar>
    );
};

export default Navition;