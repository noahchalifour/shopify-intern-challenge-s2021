import React from 'react';
import Card from 'react-bootstrap/Card';

interface ImageViewProps {
    imageUrl: string,
    title: string,
    keywords: string
}

function ImageView(props: ImageViewProps) {
    const {
        imageUrl,
        title,
        keywords
    } = props;

    return (
        <Card 
            className='shadow-sm'
            style={{
                marginBottom: '15px'
            }}
        >
            <Card.Img variant="top" src={imageUrl} />
            <Card.Body>
                <Card.Title>{title}</Card.Title>
                <Card.Text>
                    {keywords === '' ? (
                        <small>No keywords provided.</small>
                    ) : keywords}
                </Card.Text>
            </Card.Body>
        </Card>
    )
}

export default ImageView;