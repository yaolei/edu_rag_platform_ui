import React from 'react'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import TablePagination from '@mui/material/TablePagination';

import DeleteIcon from '@mui/icons-material/Delete'

const KnowledgeTable = ({knowledgeItems,
                        deleteItem, 
                        deleteAllItems,
                        isLoading = false}) => {
    const [page, setPage] = React.useState(0);
    const [rowPerPage, setRowPerPage] = React.useState(5);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const displayedItems = knowledgeItems.slice(page * rowPerPage, page * rowPerPage + rowPerPage);

    return (
        <>
        <Box className="flex justify-between items-center mb-4">
            <div></div>
            <div>
                <Button
                    className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed 
                    border-2 border-red-500"
                    onClick={deleteAllItems}
                    disabled={knowledgeItems.length === 0}
                    sx={{textTransform: 'none', fontWeight: 600}}
                    startIcon={<DeleteIcon color="error" />}
                    >
                    Knowledge Base
                </Button>
            </div>
        </Box>
        {isLoading ? (
            <Box className="flex justify-center items-center py-12">
                <CircularProgress />
                <Typography variant="body1" className="ml-3">Loading knowledge items...</Typography>
            </Box>
        ) : (
            <TableContainer component={Paper} className="overflow-auto">
                <Table>
                    <TableHead className="">
                        <TableRow>
                            <TableCell width="40%">File Name</TableCell>
                            <TableCell width="10%">Type</TableCell>
                            <TableCell width="40%">Create Date</TableCell>
                            <TableCell width="10%">Action</TableCell> 

                        </TableRow>
                    </TableHead>
                    <TableBody>
                    { knowledgeItems.length> 0 ? (
                        displayedItems.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>{item.knowledgeName}</TableCell>
                                <TableCell>{item.doc_type}</TableCell>
                                <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <IconButton
                                        color="error"
                                        title="delete"
                                        onClick={() => deleteItem(item.id, item.corpus_id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} align="center" className="py-6">
                                No knowledge items found.
                            </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    count={knowledgeItems.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25]}
                />
            </TableContainer>
         )}
        </>
    )
}
export default KnowledgeTable