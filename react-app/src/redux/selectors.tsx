import axios from 'axios';

const getAuthState = (store: any) => store.auth;

export const getTokens = (store: any) => {
    let tokens = getAuthState(store).tokens;
    // console.log(tokens);
    // console.log(tokens);
    if (tokens.accessToken === '') {
        tokens.accessToken = localStorage.getItem('accessToken') || '';
        // console.log(tokens);
    }
    if (tokens.refreshToken === '') {
        tokens.refreshToken = localStorage.getItem('refreshToken') || '';
    }
    // console.log(tokens);
    axios.interceptors.request.use(function (config) {
        if (tokens.accessToken && tokens.accessToken !== '') {
            config.headers.Authorization = `Bearer ${tokens.accessToken}`;
        }
        // else {
        //     if (config.headers.Authorization) {
        //         delete config.headers.Authorization;
        //     }
        // }
        // console.log(config.headers)
        return config;
    });
    return tokens;
};