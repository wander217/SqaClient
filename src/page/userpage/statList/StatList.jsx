import React, { useEffect, useState } from "react";
import { 
    FormGroup,IconButton,InputAdornment, makeStyles, Paper,
    TableBody, TableCell, TableRow, Toolbar, Tooltip, Typography
} from "@material-ui/core";
import { SearchOutlined} from "@material-ui/icons";
import {TeacherApi} from "../../../api/TeacherApi";
import {useTable} from "../../component/CustomTable";
import CustomTextField from "../../component/CustomTextField";
import CustomSelect from "../../component/CustomSelect";
import EditOutlinedIcon from '@material-ui/icons/EditOutlined';
import { useHistory, useLocation } from "react-router";
var _=require("lodash");

const useStyles=makeStyles((theme)=>({
    root:{
        width:"80%",
        padding:theme.spacing(3),
        paddingTop:theme.spacing(3)
    },
    title:{
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
    {title:"Mã giảng viên",disableSorting:false},
    {title:"Họ và tên",disableSorting:false},
    {title:"Hành động",disableSorting:true}
]

const showLabels = item=>[
    item.id,
    item.code,
    item.fullname
]

const searchData=[
    {value:0,title:"Mã giảng viên"},
    {value:1,title:"Tên giảng viên"}
]


//Dữ liệu bảng
const getId= data=>{
    if(data){
        const searchObject= {};
        _.split(data,/\?| /).forEach(query=>{
            const arr = _.split(query,"=");
            if(arr.length!==2) return;
            searchObject[arr[0]]=arr[1];
        });
        return parseInt(searchObject["id"]);
    }
    return 0;
};

export default function StatList(){
    const location = useLocation();
    const id = getId(location.search);
    const type = location.pathname.includes("remember")?"remember":"forgot";
    //Lưu trữ dữ liệu
    const [record, setRecord] = useState([])
    //Dữ liệu nhập vào
    const [dataInput, setdataInput] = useState({
        input:"",
        type:0
    });
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
    useEffect(() => {
        TeacherApi.getAllAssigned({id,type})
        .then(resp=>{ 
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
    }, [id,type,setPageNumber])

    //Lấy thuộc tính search
    const getSearchTitle = item=>{
        switch(dataInput.type){
            case "1":{
                return item.fullname.toLowerCase();
            }
            default:{
                return item.code.toLowerCase();
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
    const handleRegister = item=>{
        history.push("/admin/stat/modify?id="+item.id);
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
                {"Danh sách giảng viên "+(type==="remember"?"đăng kí đủ":"đăng kí thiếu")}
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
                                    <Tooltip title="Chỉnh sửa đăng kí">
                                         <IconButton size="small" 
                                            onClick={()=>handleRegister(item)}
                                        >
                                            <EditOutlinedIcon/>
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