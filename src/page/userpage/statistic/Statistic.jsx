import React, { useEffect, useState } from "react";
import { 
    FormGroup,
    IconButton,
    InputAdornment, makeStyles, Paper,
    TableBody, TableCell, TableRow, Toolbar, Tooltip, Typography
} from "@material-ui/core";
import { SearchOutlined} from "@material-ui/icons";
import {StatisticApi} from "../../../api/StatisticApi";
import {useTable} from "../../component/CustomTable";
import CustomTextField from "../../component/CustomTextField";
import CustomSelect from "../../component/CustomSelect";
import EventBusyOutlinedIcon from '@material-ui/icons/EventBusyOutlined';
import EventAvailableOutlinedIcon from '@material-ui/icons/EventAvailableOutlined';
import { useHistory } from "react-router";

const useStyles=makeStyles((theme)=>({
    root:{
        width:"80%",
        padding:theme.spacing(3),
        paddingTop:theme.spacing(3)
    },
    title:{
        width:"200px",
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
    searchSelect:{
        width:"20%"
    },
    searchBox:{
        width:"75%"
    },
    tableCell:{
        minWidth:"50px",
        maxWidth:"200px",
        overflow: "hidden",
        textOverflow:"ellipsis",
        whiteSpace:"nowrap"
    },
    buttonBox:{
        display:"flex",
        justifyContent:"space-around",
        alignItems:"center"
    }
}));

const headerCells=[
    {title:"id",disableSorting:false},
    {title:"Tên môn",disableSorting:false},
    {title:"Đăng kí đủ",disableSorting:false},
    {title:"Đăng kí thiếu",disableSorting:false},
    {title:"Hành động",disableSorting:true}
]

const showLabels = item=>[
    item.id,
    item.termSubjectName,
    item.remember,
    item.forgot
]

const searchData=[
    {value:0,title:"Tên môn"}
]

export default function Statistic(){
    //Load dữ liệu
    const [record, setRecord] = useState([])
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
    //Dữ liệu nhập vào
    const [dataInput, setdataInput] = useState({
        input:"",
        type:0
    });
    useEffect(() => {
        StatisticApi.getAll().then(resp=>{
            setRecord(resp);
        })
        return ()=>{
            setdataInput({
                input:"",
                type:0
            });
            setFilter({
                filting:items=>{
                    return items;
                }
            });
            setPageNumber(0);
        }
    }, [setPageNumber])
    

    //Lấy thuộc tính search
    const getSearchTitle = item=>{
        switch(dataInput.type){
            default:{
                return item.termSubjectName.toLowerCase();
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
    const history = useHistory();
    //Chuyển hướng sang thống kê đăng kí đủ
    const handleRemember = item=>{
        history.push("/admin/stat/remember?id="+item.id);
    }
    //Chuyển hướng sang thống kê đăng kí thiếu
    const handleForgot = item=>{
        history.push("/admin/stat/forgot?id="+item.id);
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
                        className={classes.searchSelect}
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
                {"Thống kê đăng kí theo nhóm"}
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
                                <TableCell 
                                    align="center"
                                    className={classes.buttonBox}
                                >
                                    <Tooltip title="Danh sách đăng kí đủ">
                                         <IconButton size="small" 
                                            onClick={()=>handleRemember(item)}
                                        >
                                            <EventAvailableOutlinedIcon/>
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Danh sách đăng kí thiếu">
                                         <IconButton size="small" 
                                            onClick={()=>handleForgot(item)}
                                        >
                                            <EventBusyOutlinedIcon/>
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))
                    }
                </TableBody>
            </CustomTable>
            <CustomPagination/>
        </Paper>
    )
}