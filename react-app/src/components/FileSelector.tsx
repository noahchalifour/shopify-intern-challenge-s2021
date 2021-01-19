import React, {
    useState,
    useRef
} from 'react';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';

interface FileSelectorProps {
    onFileChanged: (file: any) => void,
    multiple?: boolean
}

function FileSelector(props: FileSelectorProps) {
    const uploadText = props.multiple ? 'Click to upload image(s)' : 'Click to upload an image';
    
    const [fileInputPlaceholder, setFileInputPlaceholder] = useState<string>(uploadText);
    const fileInputEl = useRef<HTMLInputElement>(null);

    const onFileChange = (e: any) => {
        const files = e.target.files;
        if (files.length > 1) {
            setFileInputPlaceholder(`Multiple images (${files.length}) (click to change)`);
        } else {
            setFileInputPlaceholder(`${files[0].name} (click to change)`);
        }
        props.onFileChanged(files);
    }

    return (
        <>
            <Form.File
                style={{
                    display: 'none'
                }}
                ref={fileInputEl}
                onChange={onFileChange}
                required
                multiple={props.multiple}
            />
            <FormControl 
                aria-describedby="basic-addon1" 
                placeholder={fileInputPlaceholder}
                onClick={() => fileInputEl.current?.click()}
                readOnly
            />
        </>
    )
}

export default FileSelector;