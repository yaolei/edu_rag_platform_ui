import {useState, useRef, useEffect} from 'react'
import { Typography } from '@mui/material'
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
    const [allActive, setAllActive] = useState(true);
    const [isloading, setIsLoading] = useState(false);
    const [noticeOpen, setNoticeOpen] = useState(false);
    const [noticeMessage, setNoticeMessage] = useState('');
    const [noticeSeverity, setNoticeSeverity] = useState('success');

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
                const allItemsActive = processedItems.length > 0 && processedItems.every(item => item.active);
                setAllActive(allItemsActive);
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

            try {
                const response = await uploadFile('/upload_knowledge', formData, (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                });
                
                showNotice(response.message ||'File uploaded successfully', 'success');
                clearSelectedFile();
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
    
    const toggleItemStatus = async (itemId, currentStatus) => {
        try {
            const response = await post('/knowledge/toggleStatus', {
                id: itemId,
                activate: !currentStatus
            });
            if (response && response.status === 200) {
                setKnowledgeItems(prevItems => prevItems.map(item => 
                    item.id === itemId ? { ...item, active: !currentStatus } : item
                ));
                const uploadedItems = knowledgeItems.map(item => item.id === itemId ? {...item, active: !currentStatus } : item);
                const allItemsActive = uploadedItems.length > 0 && uploadedItems.every(item => item.active);
                setAllActive(allItemsActive);
                showNotice('Knowledge item status updated', 'success');
            } else {
                showNotice('Failed to update status', 'error');
            }
        } catch (error) {
            console.error('Error toggling item status:', error);
            showNotice('Error toggling item status', 'error');
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

    const toggleAllItems = async () => {
        const newActiveStatus = !allActive;
        if (knowledgeItems.length === 0) {
            setAllActive(newActiveStatus);
            return;
        }
        try {
            const response = await post('/knowledge/toggleAllStatus', {
                activate: newActiveStatus
            });
            if (response && response.status === 200) {
                setKnowledgeItems(prevItems => prevItems.map(item => 
                    ({ ...item, active: newActiveStatus })
                ));
                setAllActive(newActiveStatus);
                showNotice('All knowledge items status updated', 'success');
            } else {
                showNotice('Failed to update all statuses', 'error');
            }
        } catch (error) {
            console.error('Error toggling all items status:', error);
            showNotice('Error toggling all items status' + (error.message), 'error');
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
    }
    const isUploadButtonEnabled = () => {
        return selectedFile && !isUploading;
    }
    return (
        <div className='p-6 mt-10'>
            <Typography variant="h5" className="mb-4">knowledge Management</Typography>
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
            />
            <KnowledgeTable
                knowledgeItems={knowledgeItems}
                isLoading={isloading}
                onToggleStatus={toggleItemStatus}
                deleteItem={deleteItem}
                allActive={allActive}
                onToggleAll={toggleAllItems}
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
