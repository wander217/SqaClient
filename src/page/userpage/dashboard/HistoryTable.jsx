import React, { useEffect, useState } from "react";
import { 
    FormGroup,
    IconButton,
    InputAdornment, makeStyles, Paper,
    TableBody, TableCell, TableRow, Toolbar, Typography
} from "@material-ui/core";
import { SearchOutlined} from "@material-ui/icons";
import {HistoryApi} from "../../../api/HistoryApi";
import {useTable} from "../../component/CustomTable";
import CustomTextField from "../../component/CustomTextField";
import CustomSelect from "../../component/CustomSelect";
import { useSelector } from "react-redux";

const useStyles=makeStyles((theme)=>({
    root:{
        width:"100%",
        padding:theme.spacing(3),
        paddingTop:theme.spacing(3)
    },
    title:{
        width:"100px",
        marginTop:theme.spacing(1),
        color:theme.palette.text.secondary,
        paddingBottom:theme.spacing(1)
    },
    search:{
        width:"100%",
        marginBottom:theme.spacing(2),
        display:"flex",
        justifyContent:"space-around",
        alignItems:"flex-end"
    },
    searchBox:{
        width:"80%"
    },
    tableCell:{
        minWidth:"50px",
        maxWidth:"200px",
        overflow: "hidden",
        textOverflow:"ellipsis",
        whiteSpace:"nowrap"
    },
}));

const headerCells=[
    {title:"id",disableSorting:false,name:"id"},
    {title:"Mã nhóm",disableSorting:false,name:"subjectGroupCode"},
    {title:"Tên môn",disableSorting:false,name:"subjectName"},
    {title:"Ngày đăng kí",disableSorting:false,name:"regTime"},
    {title:"Trạng thái",disableSorting:false,name:"enable"}
]

function getRegisterTime(data){
    const date =  new Date(data);
    const h =date.getHours()>9?date.getHours():("0"+date.getHours());
    const m =date.getMinutes()>9?date.getMinutes():("0"+date.getMinutes());
    const s =date.getSeconds()>9?date.getSeconds():("0"+date.getSeconds());
    const d =date.getDate()>9?date.getDate():("0"+date.getDate());
    const mh =date.getMonth()>8?(date.getMonth()+1):("0"+(date.getMonth()+1));
    return h+":"+m+":"+s+" "+d+"/"+mh+"/"+date.getFullYear();
}

const showLabels = item=>[
    item.id,
    item.subjectGroupCode,
    item.subjectName,
    getRegisterTime(item.regTime),
    item.enable?"Còn hiệu lực":"Đã hủy"
]

const searchData=[
    {value:0,title:"Mã nhóm"},
    {value:1,title:"Tên môn"}
]

export default function HistoryTable(){
    //Lấy state
    const state = useSelector(state => state.dashBoard);
    //Dữ liệu bảng
    const [record, setRecord] = useState([]);
    //Bộ lọc
    const [filter,setFilter] = useState({
        filting:items=>{
            return items;
        }
    });
    //Lấy thuộc tính của bảng
    const {
        CustomTable,
        CustomHeader,
        CustomPagination,
        sliceSortedPageRecord,
        setPageNumber
    }= useTable(record,headerCells,filter);
    //Cập nhật
    useEffect(()=>{
        HistoryApi.getByTeacher(state.id).then(resp=>{
            setRecord(resp);
        });
        return ()=>{
            setFilter({
                filting:items=>items
            });
            setdataInput({
                input:"",
                type:0
            })
            setPageNumber(0);
         }
    },[state.id,setPageNumber])
    //Dữ liệu nhập vào
    const [dataInput, setdataInput] = useState({
        input:"",
        type:0
    });

    //Lấy thuộc tính search
    const getSearchTitle = item=>{
        switch(dataInput.type){
            case "1":{
                return item.subjectName.toLowerCase();
            }
            default:{
                return item.subjectGroupCode.toLowerCase();
            }
        }
    }
    //Xử lý tìm kiếm
    const handleSearch = ()=>{
        setFilter({
            filting:items=>{
                if(dataInput==="") return items;
                return items.filter(item=>
                    getSearchTitle(item).includes(dataInput.input.toLowerCase())
                ); 
            }
        })
    }
    //Xử lý khi nhập
    const handleInputChange=e=>{
        const {name,value} = e.target;
        setdataInput({
           ...dataInput,
           [name]:value
        });
    }

    //Dữ liệu từng trang
    const sliceRecord = sliceSortedPageRecord();
    //CSS
    const classes = useStyles();

    return (
        <Paper elevation={3} className={classes.root}>
            <Toolbar>
                <FormGroup row className={classes.search}>
                    <CustomSelect
                        id={"search"} data={searchData}
                        name={"type"} title={"Loại tìm kiếm"}
                        initialValue={dataInput.type}
                        onChange={handleInputChange}
                    />
                    <CustomTextField
                        label={"Tìm kiếm theo "+searchData[dataInput.type].title.toLowerCase()}
                        className={classes.searchBox} name={"input"}
                        InputProps={{
                            endAdornment:(
                                <InputAdornment position="end">
                                    <IconButton onClick={handleSearch}>
                                        <SearchOutlined/>
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                        initialValue={dataInput.input}
                        onChange={handleInputChange}
                    />
                </FormGroup>
            </Toolbar>
            <Typography variant="subtitle2" className={classes.title}>
                {"Lịch sử đăng kí"}
            </Typography>
             <CustomTable>
                <CustomHeader/>
                <TableBody>
                    {
                        sliceRecord.length===0
                        ?(
                            <TableRow>
                                <TableCell align="center" colSpan={headerCells.length}>
                                    {"Không có dữ liệu"}
                                </TableCell>
                            </TableRow>
                        )
                        :sliceRecord.map((item,index)=>(
                            <TableRow key={index}>
                                {
                                    showLabels(item).map((label,index1)=>(
                                        <TableCell 
                                            align="center"
                                            key={index+" "+index1}
                                            className={classes.tableCell}
                                        >
                                            {label}
                                        </TableCell>   
                                    ))
                                }
                            </TableRow>
                        ))
                    }
                </TableBody>
            </CustomTable>
            <CustomPagination/>
        </Paper>
    )
}