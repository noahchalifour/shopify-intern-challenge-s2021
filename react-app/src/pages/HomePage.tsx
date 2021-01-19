import React, {
    useState,
    useEffect,
    useCallback,
    useReducer
} from 'react';
import axios from 'axios';
import Container from 'react-bootstrap/Container';


import SearchBar from '../components/SearchBar';
import ImagesGridView from '../components/ImagesGridView';

import {
    doRequest
} from '../utils/api';
import { getTokens } from '../redux/selectors';
import { connect } from 'react-redux';
import { setTokens } from '../redux/actions';

interface ImagesData {
    next?: string,
    images: any[]
}

interface ImagesState {
    loading: boolean,
    data: ImagesData,
    error?: string
}

type ImagesAction = 
    { type: 'request' } |
    { type: 'success_append', data: ImagesData } |
    { type: 'success_replace', data: ImagesData } |
    { type: 'failure', error: string }; 

interface HomePageProps {
    tokens?: {
        accessToken: string,
        refreshToken: string
    },
    setTokens?: (accessToken: string, refreshToken: string) => void
}

function HomePage(props: HomePageProps) {
    const tokens = props.tokens!;
    const _setTokens = props.setTokens!;

    const [loadMore, setLoadMore] = useState(true);

    const imagesReducer = (state: ImagesState, action: ImagesAction): ImagesState => {
        switch (action.type) {
            case 'request':
                return { loading: true, data: state.data };
            case 'success_append':
                return { 
                    loading: false, 
                    data: {
                        next: action.data.next,
                        images: [...state.data.images, ...action.data.images]
                    }
                };
            case 'success_replace':
                return { 
                    loading: false, 
                    data: {
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
            next: '/images',
            images: []
        }
    });

    const imagesRequestFn = useCallback(async () => {
        if (images.data.next) {
            return await axios.get(images.data.next);
        }
        return null;
    }, [images.data.next]);

    const getImages = useCallback(async () => {
        imagesDispatch({ type: 'request' });

        const response = await doRequest(
            imagesRequestFn,
            tokens,
            (token: string) => _setTokens(token, tokens.refreshToken)
        );

        // console.log(response.data.results);

        if (response) {
            setLoadMore(false);
            imagesDispatch({
                type: 'success_append',
                data: {
                    next: response.data.next,
                    images: response.data.results
                }
            });
        }
    }, [imagesRequestFn, tokens, _setTokens]);

    useEffect(() => {
        if (loadMore) {
            getImages();
        }
    }, [loadMore, getImages]);

    return (
        <Container
            style={{
                paddingTop: '50px'
            }}
        >
            <h1
                style={{
                    marginBottom: '20px',
                    fontWeight: 700
                }}
            >
                Browse Images
            </h1>
            <h5
                style={{
                    marginBottom: '20px',
                    fontWeight: 400
                }}
            >
                Look around, you might find something interesting!
            </h5>
            <SearchBar 
                onResults={(data: any) => imagesDispatch({
                    type: 'success_replace',
                    data: {
                        next: data.next,
                        images: data.results
                    }
                })}
            />
            <hr 
                style={{
                    margin: '25px 0'
                }}
            />
            {images.data.images.length === 0 ? (
                <div
                    style={{
                        display: 'flex',
                        height: '200px',
                        alignItems: 'center',
                        textAlign: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <h6>No images found.</h6>
                </div>
                
            ) : (
                <ImagesGridView 
                    images={images}
                    nextFunc={getImages}
                />
            )}
            
        </Container>
    )
}

const mapStateToProps = (state: any) => ({
    tokens: getTokens(state)
});

export default connect(
    mapStateToProps,
    { setTokens }
)(HomePage);