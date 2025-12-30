import {useState, useRef, useEffect} from 'react'
import Typography from '@mui/material/Typography';
import ResponseNotice from '../components/responseNotice'
import KnowledegeUploader from '../components/knowledegeUploader'
import KnowledgeTable from '../components/knowledgeTable'
import {get, post , uploadFile} from '@workspace/shared-util'

const KnowledgeManger = () => {
    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [customFileName, setCustomFileName] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [knowledgeItems, setKnowledgeItems] = useState([]);
    const [isloading, setIsLoading] = useState(false);
    const [noticeOpen, setNoticeOpen] = useState(false);
    const [noticeMessage, setNoticeMessage] = useState('');
    const [noticeSeverity, setNoticeSeverity] = useState('success');
    const [documentType, setDocumentType] = useState('document');

    useEffect(() => {
        fetchKnowledgeItems();
    }, []);

    const fetchKnowledgeItems = async () => {
        setIsLoading(true);
        try {
            const response = await get('/knowledge_items');
            if (response) {
                const processedItems = response.map(item => {
                    if(item.corpus_id && typeof item.corpus_id === 'string'&& item.corpus_id.startsWith('[') && item.corpus_id.includes(']') ) {
                        try {
                            return {
                                ...item,
                                corpus_id: JSON.parse(item.corpus_id)
                            };
                        } catch (e) {
                            console.error('Error parsing corpus_id:', e);
                            return item;
                        }
                    }
                    return item;
                })
                setKnowledgeItems(processedItems || []);
            }
            
        } catch (error) {
            console.error('Error fetching knowledge items:', error);
            showNotice('Error fetching knowledge items', 'error');
        } finally {
            setIsLoading(false);
        }
    }

    const onFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            const fileName = file.name.split('.').slice(0, -1).join('.');
            setCustomFileName(fileName);
            setUploadProgress(0);
        }
    }

    const handleCustomFileNameChange = (event) => {
        setCustomFileName(event.target.value);
    }


    const handleDocumentTypeChange = (type) => {
        setDocumentType(type);
    }

    const showNotice = (message, severity='success') => {
        setNoticeMessage(message);
        setNoticeSeverity(severity);
        setNoticeOpen(true);
    };

    const submitFiles = async () => {
        if (!selectedFile) {
            showNotice('Please select a file to upload', 'warning');
            return;
        }
        setIsUploading(true);

        try {
            const fileExtension = selectedFile.name.split('.').pop();
            const fileName = customFileName ? `${customFileName}.${fileExtension}` : selectedFile.name;

            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('knowledgeName', fileName);
            formData.append('activate', true);
            formData.append('document_type', documentType); 
            try {
                const response = await uploadFile('/upload_knowledge', formData, (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                });
                
                showNotice(response.message ||'File uploaded successfully', 'success');
                clearSelectedFile();
                setDocumentType('document');
            } catch (error) {
                console.error('Error uploading file:', error);
                showNotice('Error uploading file '+ (error.message), 'error');
            }
        } catch (error) {
            console.error('Error preparing file upload:', error);
            showNotice('Error preparing file upload ' + (error.message), 'error');
        } finally {
            setIsUploading(false);
            fetchKnowledgeItems();
        }
    }
    
    const deleteAllItems = async () => {
        if (!confirm('Are you sure you want to delete all knowledge items?')) {
            return;
        }
        try {
            const response = await get('/del_knowledge_items');
            if (response && response.status === 200) {
                setKnowledgeItems([]);
                showNotice('All knowledge items deleted', 'success');
            } else {
                showNotice('Failed to delete all knowledge items', 'error');
            }
        } catch (error) {
            console.error('Error deleting all knowledge items:', error);
            showNotice('Error deleting all knowledge items' + (error.message), 'error');
        }

    }
    const deleteItem = async (itemId, corpus_id) => {
        if (!confirm('Are you sure you want to delete this knowledge item?')) {
            return;
        }
        let parsedCorpusId = corpus_id;
        if (typeof corpus_id === 'string' && corpus_id.startsWith('[') && corpus_id.endsWith(']')) {
            try {
                parsedCorpusId = JSON.parse(corpus_id);
            } catch (e) {
                console.error('Error parsing corpus_id for deletion:', e);
            }
        }
        try {
            const response = await post('/del_knowledge_items_by_id', {
                id: itemId,
                corpus_ids: parsedCorpusId
            });
            if (response && response.status === 200) {
                await fetchKnowledgeItems();
                showNotice('Knowledge item deleted', 'success');
            } else {
                showNotice('Failed to delete knowledge item', 'error');
            }
        } catch (error) {
            console.error('Error deleting knowledge item:', error);
            showNotice('Error deleting knowledge item' + (error.message), 'error');
        }
    }   

    const hanleCloseNotice = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setNoticeOpen(false);
    }

    const clearSelectedFile = () => {
        setSelectedFile(null);
        setCustomFileName('');
        fileInputRef.current.value = '';
        setUploadProgress(0);
        setDocumentType('document'); 
    }
    const isUploadButtonEnabled = () => {
        return selectedFile && !isUploading;
    }
    return (
        <div className='p-4'>
            <Typography variant="h5" className="p-4">Knowledge Base Management</Typography>
            <KnowledegeUploader
                fileInputRef={fileInputRef}
                selectedFile={selectedFile}
                customFileName={customFileName}
                uploadProgress={uploadProgress}
                isUploading={isUploading}
                onFileChange={onFileChange}
                clearSelectedFile={clearSelectedFile}
                onCustomFileNameChange={handleCustomFileNameChange}
                isUploadingButtonEnabled={isUploadButtonEnabled}
                submitFiles={submitFiles}
                documentType={documentType}
                onDocumentTypeChange={handleDocumentTypeChange}
            />
            <KnowledgeTable
                knowledgeItems={knowledgeItems}
                isLoading={isloading}
                deleteItem={deleteItem}
                deleteAllItems={deleteAllItems}
            />
            <ResponseNotice
                open={noticeOpen}
                onClose={hanleCloseNotice}
                severity={noticeSeverity}
                message={noticeMessage}
            />
        </div>
    )
}

export default KnowledgeManger
