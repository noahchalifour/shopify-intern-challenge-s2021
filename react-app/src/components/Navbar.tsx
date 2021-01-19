import React, {
    useState
} from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import { 
    IndexLinkContainer,
    LinkContainer 
} from 'react-router-bootstrap';
import { connect } from "react-redux";

import { getTokens } from '../redux/selectors';
import UploadImagesModal from './UploadImagesModal';
import { setTokens } from '../redux/actions';

interface MyNavbarProps {
    tokens?: {
        accessToken: string,
        refreshToken: string
    },
    setTokens?: (accessToken: string, refreshToken: string) => void
}

function MyNavbar(props: MyNavbarProps) {
    const loggedIn = props.tokens?.accessToken !== '' && props.tokens?.refreshToken !== '';

    const [uploadModalShow, setUploadModalShow] = useState(false);

    const onLogout = () => {
        props.setTokens!('', '');
        window.location.reload();
    }

    return (
        <>
            <UploadImagesModal
                show={uploadModalShow}
                handleClose={() => setUploadModalShow(false)}
                onUpload={() => window.location.reload()}
            />
            <Navbar bg="dark" variant="dark" fixed="top">
                <Navbar.Brand
                    as={IndexLinkContainer}
                    to="/"
                >
                    <a href="/">Image Repository</a>
                </Navbar.Brand>
                <Nav className="mr-auto">
                    {/* <IndexLinkContainer to="/">
                        <Nav.Link>Home</Nav.Link>
                    </IndexLinkContainer> */}
                    {loggedIn && (
                        <Button 
                            size="sm"
                            onClick={() => setUploadModalShow(true)}
                        >
                            Upload
                        </Button>
                    )}
                </Nav>
                {loggedIn ? (
                    <Nav>
                        <LinkContainer to="/profile">
                            <Nav.Link>My Profile</Nav.Link>
                        </LinkContainer>
                    </Nav>
                ) : (
                    <Nav>
                        <LinkContainer to="/register">
                            <Nav.Link>Register</Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/login">
                            <Nav.Link>Login</Nav.Link>
                        </LinkContainer>
                    </Nav>
                )}
                {loggedIn && (
                    <Button 
                        variant="outline-secondary"
                        style={{
                            marginLeft: '20px'
                        }}
                        onClick={onLogout}
                    >
                        Logout
                    </Button>
                )}
            </Navbar>
        </>
    )
}

const mapStateToProps = (state: any) => ({
    tokens: getTokens(state)
});

export default connect(
    mapStateToProps,
    { setTokens }
)(MyNavbar);