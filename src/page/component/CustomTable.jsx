import { 
    makeStyles, Table, TableCell,
    TableHead, TableRow, TablePagination, 
    TableSortLabel, TableContainer, Paper
} from "@material-ui/core"
import { useState } from "react";
var _ = require("lodash");

const useStyles=  makeStyles(theme=>({
    table:{
        overflowX:"auto",
        minWidth:"600px",
        '& thead th':{
            fontWeight:'600',
            color:"white",
            backgroundColor:theme.palette.primary.light,
            minWidth:"50px",
            maxWidth:"250px",
            overflow: "hidden",
            textOverflow:"ellipsis",
            whiteSpace:"nowrap"
        },
        '& tbody':{
            fontWeight:'300'
        }
    }
}));

function useTable(records=[],labels,filter,recordNumber = [5,10,25]){
    //Css
    const classes = useStyles();
    //Trang được hiển thị
    const [pageNumber,setPageNumber] = useState(0);
    //Số phần tử in ra được chọn
    const [recordPerPage,setRecordPerPage] = useState(recordNumber[pageNumber]);
    //Nhãn để sắp xếp
    const [sortLabelId,setSortLabelId] =  useState(0);
    //Thứ tự sắp xếp
    const [sortOrder,setSortOrder] = useState("asc");

    //Tạo bảng
    const CustomTable = props=>(
       <TableContainer component={Paper}>
           <Table className={classes.table} >
                {props.children}
            </Table>
       </TableContainer> 
    )

    //Sắp xếp phần tử của bảng
    const handleSortRecord = index=>{
        const isAsc = sortLabelId === index && sortOrder==="asc";
        setSortOrder(isAsc?"desc":"asc");
        setSortLabelId(index);
    }

    //Tạo đầu của bảng
    const CustomHeader = ()=>(
        <TableHead>
            <TableRow>
                {
                    labels.map((label,index)=>(
                        <TableCell
                            align="center" key={index}
                            sortDirection={sortLabelId === index?sortOrder:false}
                        >
                            {
                                label.disableSorting
                                ?label.title
                                :(
                                    <TableSortLabel
                                        active={sortLabelId === index}
                                        direction = {sortLabelId === index?sortOrder:"asc"}
                                        onClick={()=>handleSortRecord(index)}
                                    >
                                        {label.title}  
                                    </TableSortLabel>
                                )
                            }
                        </TableCell>
                    ))
                }
            </TableRow>
        </TableHead>
    );

    //Xử lý chuyển trang
    const handlePageChange = (e,newPageNumber)=>{
        setPageNumber(newPageNumber);
    }

    //Xử lý số bảng ghi hiển thị
    const handleRowsPerPageChange = e=>{
        setRecordPerPage(parseInt(e.target.value,10));
        setPageNumber(0);
    }

    //Sắp xếp lại bảng đã cắt
    const sliceSortedPageRecord = ()=>{
        const start = pageNumber*recordPerPage;
        let arr = _.sortBy(filter.filting(records),[labels[sortLabelId].name]);
        if(sortOrder === "desc"){
            arr = arr.reverse();
        }
        return arr.slice(start,start+recordPerPage);
    }

    //Tạo phần chuyển trang
    const CustomPagination = ()=>(
        <TablePagination
            component={"div"}
            page = {pageNumber}
            rowsPerPageOptions={recordNumber}
            rowsPerPage={recordPerPage}
            count={ records.length}
            onChangePage={handlePageChange}
            onChangeRowsPerPage= {handleRowsPerPageChange}
        />
    );

    return{
        CustomTable,
        CustomHeader,
        CustomPagination,
        sliceSortedPageRecord,
        pageNumber,setPageNumber
    }
}

export {useTable}