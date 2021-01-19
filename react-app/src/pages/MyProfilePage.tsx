import React, {
    useState,
    useEffect,
    useCallback,
    useReducer
} from 'react';
import axios from 'axios';
import Container from 'react-bootstrap/Container';
import { getTokens } from '../redux/selectors';
import { setTokens } from '../redux/actions';
import { connect } from 'react-redux';
import { doRequest } from '../utils/api';
import { Redirect } from 'react-router-dom';
import ImagesTable from '../components/ImagesTable';

interface ImagesData {
    next: string | null,
    previous: string | null,
    images: any[]
}

interface ImagesState {
    loading: boolean,
    data: ImagesData,
    url?: 'next' | 'previous',
    error?: string
}

type ImagesAction = 
    { type: 'request', url: 'next' | 'previous' } |
    { type: 'success', data: ImagesData } |
    { type: 'failure', error: string }; 

interface MyProfilePageProps {
    tokens?: {
        accessToken: string,
        refreshToken: string
    },
    setTokens?: (accessToken: string, refreshToken: string) => void
}

function MyProfilePage(props: MyProfilePageProps) {
    const tokens = props.tokens!;
    const _setTokens = props.setTokens!;

    const [user, setUser] = useState<any>(null);

    const imagesReducer = (state: ImagesState, action: ImagesAction): ImagesState => {
        switch (action.type) {
            case 'request':
                return { loading: true, data: state.data, url: action.url };
            case 'success':
                return { 
                    loading: false, 
                    data: {
                        previous: action.data.previous,
                        next: action.data.next,
                        images: [...action.data.images]
                    }
                };
            case 'failure':
                return { loading: false, data: state.data, error: action.error };
        }
    }

    const [images, imagesDispatch] = useReducer(imagesReducer, { 
        loading: false,
        data: {
            previous: null,
            next: null,
            images: []
        }
    });

    const getUser = useCallback(async () => {
        const requestFn = async () => {
            return await axios.get('/users/me/');
        }

        const response = await doRequest(
            requestFn,
            tokens,
            (token: string) => _setTokens(token, tokens.refreshToken)
        );

        if (response) {
            setUser(response.data);
        }
    }, []);

    const getImages = useCallback((type: 'next' | 'previous') => {
        // console.log(user);
        if (user && user.id) {
            imagesDispatch({ type: 'request', url: type });
        }
    }, [user]);

    const loadImages = useCallback(async () => {
        // console.log(user);
        // console.log(images);
        if (!images.url || user === null) {
            return;
        }

        const imagesRequestFn = async () => {
            if (images.data[images.url!] === null) {
                return await axios.get(`/images?owner=${user.id}`)
            } else {
                return await axios.get(`${images.data[images.url!]!}&owner=${user.id}`);
            }
        }

        const response = await doRequest(
            imagesRequestFn,
            tokens,
            (token: string) => _setTokens(token, tokens.refreshToken)
        );

        if (response) {
            imagesDispatch({
                type: 'success',
                data: {
                    next: response.data.next,
                    previous: response.data.previous,
                    images: response.data.results
                }
            });
        }
    }, [images.url, user]);

    useEffect(() => {
        // console.log('getImages()');
        getImages('next');
    }, [getImages]);

    useEffect(() => {
        // console.log('loadImages()');
        loadImages();
    }, [loadImages]);

    useEffect(() => {
        getUser();
    }, [getUser]);

    // console.log(user);

    if (tokens.accessToken === '' || tokens.refreshToken === '') {
        return (
            <Redirect
                to='/'
            />
        )
    }

    console.log(images.data)

    return (
        <Container
            style={{
                paddingTop: '50px'
            }}
        >
            <div
                style={{
                    marginBottom: '50px'
                }}
            >
                <h2>Account Information</h2>
                <hr />
                <p><b>Username: </b>{user?.username}</p>
            </div>
            <div>
                <h2>My Images</h2>
                <hr />
                <ImagesTable
                    images={images.data.images}
                    hasPrevious={images.data.previous !== null}
                    hasNext={images.data.next !== null}
                    load={getImages}
                />
            </div>
        </Container>
    )
}

const mapStateToProps = (state: any) => ({
    tokens: getTokens(state)
});

export default connect(
    mapStateToProps,
    { setTokens }
)(MyProfilePage);