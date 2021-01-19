import axios from 'axios';

const refresh = async (
    refreshToken: string, 
    updateAccessToken: (token: string) => void
) => {
    console.log('refresh');
    const response = await axios.post('/token/refresh/', {
        refresh: refreshToken
    });
    console.log(response);
    if (response.status === 200) {
        const token = response.data.access
        updateAccessToken(token);
        return token;
    }
    return '';
}

export const doRequest = async (
    requestFn: () => any, 
    tokens: any, 
    updateAccessToken: (token: string) => void,
    attempt: number = 0
): Promise<any> => {
    try {
        const response = await requestFn();
        if (response) {
            if (response.status !== 401) {
                return response;
            }
        }
    } catch (err) {
        if (err.response.status === 401) {
            if (attempt < 1) {
                const newToken = await refresh(tokens.refreshToken, updateAccessToken);
                tokens.accessToken = newToken;
                return doRequest(
                    requestFn, 
                    tokens,
                    updateAccessToken,
                    attempt + 1
                );
            }
        }
    }
    return null;
}