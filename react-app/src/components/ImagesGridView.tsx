import React, {
    ReactNode
} from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';
import InfiniteScroll from 'react-infinite-scroll-component';

import ImageView from './ImageView';

const IMAGES_PER_ROW = 4;

interface ImagesGridViewProps {
    images: {
        loading: boolean,
        data: {
            next?: string,
            images: any[]
        }
    },
    nextFunc: () => void
}

function ImagesGridView(props: ImagesGridViewProps) {
    const {
        images,
        nextFunc
    } = props;

    const _images = images.data.images.map((img) => ({
        imageUrl: `/images/${img.id}/image`,
        title: img.title,
        keywords: img.keywords
    }))

    const numRows = Math.ceil(_images.length / IMAGES_PER_ROW);
    let columns: ReactNode[] = [];

    // console.log('length:', images.length);

    for (let i = 0; i < IMAGES_PER_ROW; i++) {
        let columnImages: ReactNode[] = [];
        for (let j = 0; j < numRows; j++) {
            const pos = i + (j * IMAGES_PER_ROW);
            if (pos >= _images.length) {
                break;
            }
            const img = _images[pos];
            columnImages.push(
                <ImageView
                    imageUrl={img.imageUrl}
                    title={img.title}
                    keywords={img.keywords}
                    key={j}
                />
            )
        }
        let style = {};
        if (i < IMAGES_PER_ROW - 1) {
            style = {
                paddingRight: '0px'
            }
        }
        columns.push(
            <Col 
                style={style} 
                key={i} 
                md={12 / IMAGES_PER_ROW}
            >
                {columnImages}
            </Col>
        );
    }

    return (
        <InfiniteScroll
            dataLength={images.data.images.length} //This is important field to render the next data
            next={nextFunc}
            hasMore={images.data.next !== null}
            loader={
                <div
                    style={{
                        display: 'flex',
                        height: '200px',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Spinner 
                        animation="grow" 
                    />
                </div>
            }
            endMessage={
                <p 
                    style={{ 
                        textAlign: 'center',
                        margin: '70px 0'
                    }}
                >
                    <b>Yay! You have seen it all</b>
                </p>
            }
        >
            <Row>
                {columns}
            </Row>
        </InfiniteScroll>
        
    )
}

export default ImagesGridView;