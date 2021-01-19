import React, {
    useState
} from 'react';
import axios from 'axios';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import FileSelector from './FileSelector';
import { doRequest } from '../utils/api';
import { connect } from 'react-redux';
import { getTokens } from '../redux/selectors';
import { setTokens } from '../redux/actions';

interface UploadImagesModalProps {
    show: boolean,
    handleClose: () => void,
    onUpload?: () => void,
    tokens?: {
        accessToken: string,
        refreshToken: string
    },
    setTokens?: (accessToken: string, refreshToken: string) => void
}

function UploadImagesModal(props: UploadImagesModalProps) {
    const {
        show,
        handleClose,
        onUpload
    } = props;
    const tokens = props.tokens!;
    const _setTokens = props.setTokens!;

    const [images, setImages] = useState<any>(null);
    const [keywords, setKeywords] = useState('');
    const [_private, setPrivate] = useState(false);

    const onSubmit = async (e: any) => {
        e.preventDefault();

        const requestFn = async () => {
            const formData = new FormData();

            for (const image of images) {
                formData.append('upload', image, image.name);
                formData.append('private', _private.toString());
                formData.append('keywords', keywords);
            }

            return await axios.post('/images/', formData);
        }

        try {
            const response = await doRequest(
                requestFn,
                tokens,
                (token: string) => _setTokens(token, tokens.refreshToken)
            );
    
            if (response) {
                console.log(response);
                if (response.status === 201) {
                    handleClose();
                    if (onUpload) {
                        onUpload();
                    }
                }
            }
        } catch (err) {
            if (err.response) {
                console.log(err.response);
            } else {
                console.log(err)
            }
        }     
    }

    return (
        <Modal centered show={show} onHide={handleClose}>
            <Form onSubmit={onSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>Upload Images</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Images</Form.Label>
                        <FileSelector
                            onFileChanged={(f: any) => setImages(f)}
                            // multiple
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Keywords</Form.Label>
                        <FormControl
                            type='text'
                            placeholder='Enter keywords separated by commas'
                            value={keywords}
                            onChange={(e: any) => setKeywords(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group controlId="formBasicCheckbox">
                        <Form.Check 
                            type="checkbox" 
                            label="Private" 
                            checked={_private}
                            onChange={(e: any) => setPrivate(e.target.checked)}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" type="submit">
                        Upload
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    )
}

const mapStateToProps = (state: any) => ({
    tokens: getTokens(state)
});

export default connect(
    mapStateToProps,
    { setTokens }
)(UploadImagesModal);