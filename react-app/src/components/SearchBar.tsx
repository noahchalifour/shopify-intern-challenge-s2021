import React, {
    useState
} from 'react';
import axios from 'axios';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Button from 'react-bootstrap/Button';
import FileSelector from './FileSelector';
import { doRequest } from '../utils/api';
import { getTokens } from '../redux/selectors';
import { setTokens } from '../redux/actions';
import { connect } from 'react-redux';

interface SearchBarProps {
    onResults: (results: any[]) => void,
    tokens?: {
        accessToken: string,
        refreshToken: string
    },
    setTokens?: (accessToken: string, refreshToken: string) => void
}

function SearchBar(props: SearchBarProps) {
    const {
        onResults
    } = props;
    const tokens = props.tokens!;
    const _setTokens = props.setTokens!;

    const [type, setType] = useState<'keywords' | 'image'>('keywords');
    const [keywords, setKeywords] = useState<string>('');
    const [files, setFiles] = useState<any>(null);

    const typeTitles: {keywords: string, image: string} = {
        'keywords': 'Search by keywords',
        'image': 'Image search'
    }

    const onSubmit = async () => {
        const data = new FormData();

        data.append('search_type', type);

        if (type === 'keywords') {
            data.append('value', keywords);
        } else {
            if (files) {
                data.append('image', files[0]);
            }
        }

        const requestFn = async () => {
            return await axios.post('/images/search/', data);
        }

        const response = await doRequest(
            requestFn,
            tokens,
            (token: string) => _setTokens(token, tokens.refreshToken)
        );

        if (response) {
            console.log(response.data);
            onResults(response.data);
        }
    }

    return (
        <div>
            <InputGroup className="mb-3">
                <DropdownButton
                    as={InputGroup.Prepend}
                    variant="outline-secondary"
                    title={typeTitles[type]}
                    id="input-group-dropdown-1"
                >
                    <Dropdown.Item 
                        href="#"
                        onClick={() => setType('keywords')}
                    >
                        {typeTitles['keywords']}
                    </Dropdown.Item>
                    <Dropdown.Item 
                        href="#"
                        onClick={() => setType('image')}
                    >
                        {typeTitles['image']}
                    </Dropdown.Item>
                </DropdownButton>
                {type === 'keywords' 
                    ?
                        <FormControl 
                            aria-describedby="basic-addon1" 
                            placeholder="Enter keywords separated by commas"
                            value={keywords}
                            onChange={(e: any) => setKeywords(e.target.value)}
                        />
                    : 
                        <FileSelector
                            onFileChanged={(f: any) => setFiles(f)}
                        />
                }
                <Button
                    as={InputGroup.Append}
                    onClick={onSubmit}
                >
                    Search
                </Button>
            </InputGroup>
            
        </div>
    )
}

const mapStateToProps = (state: any) => ({
    tokens: getTokens(state)
});

export default connect(
    mapStateToProps,
    { setTokens }
)(SearchBar);