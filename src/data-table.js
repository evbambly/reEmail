import React, { useState, useEffect } from 'react'
import { TableContainer, Table, TableHead, Paper, TableRow, TableCell, TableBody, TablePagination, Button } from '@material-ui/core'
import * as firebase from "firebase/app";
import "firebase/firestore";
import TablePaginationActions from './table-pagination-actions'
import moment from 'moment'

export default function DataTable({ emailAddress, back }) {
    const ROWS_PER_PAGE = 4
    const [rows, setRows] = useState([])
    const [page, setPage] = useState(0)
    const [refresh, setRefresh] = useState(new Date())
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    useEffect(() => {
        const fetchRows = async () => {
            const doc = await firebase.firestore().collection("recipients").doc(emailAddress).get()
            setRows(doc.data().status)
        }
        fetchRows()
    }, [emailAddress, refresh])
    const sortRows = (a, b) => {
        return a.timestamp < b.timestamp ? 1 : -1
    }
    return (
        <>
            <TableContainer component={Paper} style={{ maxWidth: 1000, marginTop: "12px" }}>
                <Table aria-label="simple table">
                    <TableHead>
                        <TableRow style={{ fontWeight: "bold", maxHeight: "3rem" }}>
                            <TableCell><strong>email</strong></TableCell>
                            <TableCell align="right"><strong>event</strong></TableCell>
                            <TableCell align="right"><strong>sg_message_id</strong></TableCell>
                            <TableCell align="right"><strong>timestamp</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.length > 0 ? rows.sort(sortRows).slice(page * ROWS_PER_PAGE, page * ROWS_PER_PAGE + ROWS_PER_PAGE)
                            .map((row, index) => (
                                <TableRow key={index} style={{ maxHeight: "3rem" }}>
                                    <TableCell component="th" scope="row">
                                        {row.email}
                                    </TableCell>
                                    <TableCell align="right">{row.event}</TableCell>
                                    <TableCell align="right">{row.sg_message_id}</TableCell>
                                    <TableCell align="right" style={{whiteSpace: "nowrap"}}>{moment(row.timestamp * 1000).toLocaleString()}</TableCell>
                                </TableRow>
                            )) : null}
                        <TableRow>
                            <TablePagination
                                count={rows ? rows.length : 5}
                                rowsPerPageOptions={[ROWS_PER_PAGE]}
                                rowsPerPage={ROWS_PER_PAGE}
                                page={page}
                                onChangePage={handleChangePage}
                                ActionsComponent={TablePaginationActions}
                            />
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
            <div style={{display:"inline-block"}}>
            <Button variant="contained" color="primary" style={{ marginTop: "3%", marginLeft: "3%" }} onClick={() => setRefresh(new Date())}>Refresh</Button>
            <Button variant="contained" color="primary" style={{ marginTop: "3%" }} onClick={back}>Back</Button>
            </div>
        </>
    )
}