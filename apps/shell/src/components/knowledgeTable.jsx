import React from 'react'
import { Table,
         TableBody, 
         TableCell, 
         TableContainer,
         TableHead,
         TableRow, 
         Paper, 
         Switch, 
         IconButton, 
         FormControlLabel, 
         Box, 
         CircularProgress, 
         Typography, 
         TablePagination} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'

const KnowledgeTable = ({knowledgeItems, 
                        onToggleStatus, 
                        deleteItem, 
                        allActive, 
                        onToggleAll, 
                        isLoading = false}) => {
    const isToggleDisabled = knowledgeItems.length === 0;
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
            <FormControlLabel
                control={
                    <Switch
                        checked={allActive}
                        onChange={onToggleAll}
                        color="primary"
                        disabled={isToggleDisabled}/>
                }
                label="Enable All Knowledge Items"
            />
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
                            <TableCell width="5%">ID</TableCell>
                            <TableCell width="25%">Knowledge Name</TableCell>
                            <TableCell width="15%">State</TableCell>
                            <TableCell width="20%">Create Date</TableCell>
                            <TableCell width="15%">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                    { knowledgeItems.length> 0 ? (
                        displayedItems.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="hover: bg-gray-500">{item.id}</TableCell>
                                <TableCell>{item.knowledgeName}</TableCell>
                                <TableCell>
                                    <Switch
                                        checked={!item.active}
                                        onChange={() => onToggleStatus(item.id, item.active)}
                                        color="primary"/>
                                </TableCell>
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