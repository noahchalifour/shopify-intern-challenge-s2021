import React, { useState } from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import { doRequest } from '../utils/api';
import { getTokens } from '../redux/selectors';
import { connect } from 'react-redux';
import { setTokens } from '../redux/actions';

interface ImageTableProps {
    images: any[],
    hasPrevious: boolean,
    hasNext: boolean,
    load: (type: 'next' | 'previous') => void,
    tokens?: {
        accessToken: string,
        refreshToken: string
    },
    setTokens?: (accessToken: string, refreshToken: string) => void
}

function ImagesTable(props: ImageTableProps) {
    const {
        images,
        hasPrevious,
        hasNext,
        load
    } = props;
    const tokens = props.tokens!;
    const _setTokens = props.setTokens!;

    const deleteImage = async (id: number) => {
        const requestFn = async () => {
            return await axios.delete(`/images/${id}/`);
        }
    
        const response = await doRequest(
            requestFn,
            tokens,
            (token: string) => _setTokens(token, tokens.refreshToken)
        );

        if (response) {
            if (response.status === 204) {
                window.location.reload();
            }
        }
    }

    return (
        <>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th></th>
                        <th>Title</th>
                        <th>Keywords</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {images.map((img, index) => (
                        <tr key={index}>
                            <td width='74px'>
                                <img
                                    src={`/images/${img.id}/image`}
                                    height='50px'
                                    width='50px'   
                                    alt=''
                                />
                            </td>
                            <td>{img.title}</td>
                            <td>{img.keywords}</td>
                            <td>
                                <Button 
                                    variant="outline-danger"
                                    onClick={() => deleteImage(img.id)}
                                >
                                    X
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <div
                style={{
                    textAlign: 'center'
                }}
            >
                <ButtonGroup>
                    <Button 
                        variant="outline-primary"
                        disabled={!hasPrevious}
                        onClick={() => load('previous')}
                    >
                        Previous
                    </Button>
                    <Button 
                        variant="primary"
                        disabled={!hasNext}
                        onClick={() => load('next')}
                    >
                        Next
                    </Button>
                </ButtonGroup>
            </div>
            
        </>
    )
}

const mapStateToProps = (state: any) => ({
    tokens: getTokens(state)
});

export default connect(
    mapStateToProps,
    { setTokens }
)(ImagesTable);