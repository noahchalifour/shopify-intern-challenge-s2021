import React, {
    useState
} from 'react';
import axios from 'axios';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import { connect } from 'react-redux';
import { setTokens } from '../redux/actions';
import { Redirect } from 'react-router-dom';
import { getTokens } from '../redux/selectors';

interface RegisterPageProps {
    tokens?: {
        accessToken: string,
        refreshToken: string
    },
    setTokens?: (accessToken: string, refreshToken: string) => void
}

function RegisterPage(props: RegisterPageProps) {
    const tokens = props.tokens!;
    const _setTokens = props.setTokens!;

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const onSubmit = async (e: any) => {
        e.preventDefault();
        let response;
        try {
            response = await axios.post('/users/', {
                username,
                password
            });
            if (response?.status === 201) {
                response = await axios.post('/token/', {
                    username,
                    password
                });
                if (response.status === 200) {
                    _setTokens(response.data.access, response.data.refresh);
                }
            }
        } catch (err) {
            const res = err.response;
            if (res) {
                if (res.data.username) {
                    setError(res.data.username);
                }
            } else {
                console.log(err);
            }
        }
    }

    if (tokens.accessToken !== '' && tokens.refreshToken !== '') {
        return (
            <Redirect
                to='/'
            />
        )
    }

    return (
        <div style={{
            display: 'flex',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <Form 
                onSubmit={onSubmit}
                style={{
                    width: '300px',
                }}
            >
                <div style={{
                    textAlign: 'center'
                }}>
                    <h1 style={{
                        fontSize: '24px',
                        marginBottom: '25px'
                    }}>
                        Image Repository
                    </h1>
                </div>
                {error !== '' && (
                    <Alert variant='danger'>
                        {error}
                    </Alert>
                )}
                <Form.Group controlId="formBasicEmail">
                    <Form.Label>Username</Form.Label>
                    <Form.Control 
                        type="text" 
                        placeholder="Enter username" 
                        value={username}
                        onChange={(e: any) => setUsername(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group controlId="formBasicPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control 
                        type="password" 
                        placeholder="Password" 
                        value={password}
                        onChange={(e: any) => setPassword(e.target.value)}
                        required
                    />
                </Form.Group>
                <Button 
                    style={{
                        width: '100%'
                    }} 
                    variant="primary" 
                    type="submit"
                >
                    Register
                </Button>
            </Form>
        </div>
    )
}

const mapStateToProps = (state: any) => ({
    tokens: getTokens(state)
});

export default connect(
    mapStateToProps,
    { setTokens }
)(RegisterPage);