import React, { useEffect, useState } from "react";
import { 
    Checkbox,
    FormControlLabel,
    FormGroup,
    IconButton,
    InputAdornment, List, ListItemText, makeStyles, Paper,
    TableBody, TableCell, TableRow, Toolbar, Typography
} from "@material-ui/core";
import { SearchOutlined} from "@material-ui/icons";
import {GroupApi} from "../../../api/GroupApi";
import {useTable} from "../../component/CustomTable";
import CustomTextField from "../../component/CustomTextField";
import CustomSelect from "../../component/CustomSelect";
import { useDispatch, useSelector } from "react-redux";
import CustomBackDrop from "../../component/CustomBackDrop";
import CustomNotification from "../../component/CustomNotification";
import {setChecked} from "../../../app/slice/RegistrationSlice";
var _=require("lodash");

const useStyles=makeStyles((theme)=>({
    root:{
        width:"100%",
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
    searchBox:{
        width:"80%"
    },
    tableCell:{
        minWidth:"50px",
        maxWidth:"250px",
        overflow: "hidden",
        textOverflow:"ellipsis",
        whiteSpace:"nowrap",
        textAlign:"center"
    },
    tableSubCell:{
        maxWidth:"200px",
        overflow: "hidden",
        textOverflow:"ellipsis",
        whiteSpace:"nowrap",
        textAlign:"center"
    }
}));

const headerCells=[
    {title:"Mã nhóm",disableSorting:false,name:"code"},
    {title:"Ngày học",disableSorting:false,name:"learningDay"},
    {title:"Kíp học",disableSorting:false,name:"shift"},
    {title:"Tuần học",disableSorting:false,name:"learningWeek"},
    {title:"Phòng học",disableSorting:false,name:"room"},
    {title:"Còn lại",disableSorting:false,name:"numberOfTeacher"},
    {title:"Hành động",disableSorting:true,name:""}
]

const searchData=[
    {value:0,title:"Mã nhóm"},
    {value:1,title:"Ngày học"},
    {value:2,title:"Kíp học"}
]

export default function GroupTable(){
    //Lấy state
    const state = useSelector(state => state.reg);
    //Dữ liệu bảng
    const [record, setRecord] = useState([]);
    const [checkedItem, setCheckedItem] = useState([]);
    const [otherCheckedItem, setOtherCheckedItem] = useState([]);
    //Dữ liệu được in ra
    const showLabels = item=>[
        item.code,
        item.learningDay,
        item.groupInfo.map(x=>x.shift),
        item.groupInfo.map(x=>x.learningWeek),
        item.groupInfo.map(x=>x.room),
        item.numberOfTeacher - checkedItem.filter(x=>x.subjectGroupId===item.id).length
            - otherCheckedItem.filter(x=>x.subjectGroupId===item.id).length
    ]
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
    //Thiết lập dữ liệu ban đầu
    useEffect(()=>{
        GroupApi.getBySubject(state.subjectId)
        .then(resp=>{
            setRecord(resp.data);
        }); 
        GroupApi.getAllCheckedItem({id:state.subjectId})
        .then(resp=>{
            setCheckedItem(resp.filter(item=>item.teacherId===state.teacherId));
            setOtherCheckedItem(resp.filter(item=>item.teacherId!==state.teacherId));
        }); 
        setdataInput({ input:"", type:0});
        setFilter({
             filting:items=>{
                 return items;
             }
         });
         return ()=>{
            setFilter({
                filting:items=>items
            });
            setdataInput({
                input:"",
                type:0
            });
            setPageNumber(0);
         }
    },[state.subjectId,state.teacherId,setPageNumber]);
    const dispatch= useDispatch();
    //Cập nhật khi danh sách đăng kí thay đổi
    useEffect(()=>{
        dispatch(setChecked(checkedItem.length));
    },[checkedItem.length,dispatch]);
    //Thông báo  
    const [notify,setNotify] = useState({ open:false, message:"", type:""});
    //mở chế độ chờ
    const [openBackDrop,setOpenBackDrop] = useState(false);

    //Lấy thuộc tính search
    const getSearchTitle = item=>{
        switch(dataInput.type){
            case "1":{
                return item.learningDay.toLowerCase();
            }
            case "2":{
                 return item.groupInfo.map(x=>x.learningWeek).join(" ");
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
    };
    //reset khi đăng kí
    const reset = ()=>{
        GroupApi.getBySubject(state.subjectId)
        .then(resp=>{
            setRecord(resp.data);
        }); 
        GroupApi.getAllCheckedItem({id:state.subjectId})
        .then(resp=>{
            setCheckedItem(resp.filter(item=>item.teacherId===state.teacherId));
            setOtherCheckedItem(resp.filter(item=>item.teacherId!==state.teacherId));
        }); 
    };
    //Xử lý khi ấn checkbox
    const handleCheck = e=>{
        const {value} = e.target;
        const data={
            teacherId:state.teacherId,
            subjectGroupId:JSON.parse(value).id
        };
        setOpenBackDrop(true);
        GroupApi.doRegister(data).then(resp=>{
            reset();
            setOpenBackDrop(false);
            setNotify({
                open:true,
                message:resp.data,
                type:"success"
            });
        }).catch(err=>{
            reset();
            setOpenBackDrop(false);
            setNotify({
                open:true,
                message:err.response.data,
                type:"error"
            });
        });
    };
    //Kiểm tra xem có bị disble không
    //Disable khi hết slot nhưng giảng viên được chọn chưa đăng kí
    //Disable khi đăng kí đủ số nhóm nhưng ô đó chưa được giảng viên chọn
    const isDisable= item=>{
        const checked = checkedItem.filter(x=>x.subjectGroupId===item.id).length;
        const otherChecked = otherCheckedItem.filter(x=>x.subjectGroupId===item.id).length
        const remain= item.numberOfTeacher - checked- otherChecked;
        return (remain ===0 || state.sumGroup===checkedItem.length)&&checked ===0;
    }

    //Kiểm tra xem có được check hay không
    const isCheck= item=>{
        return checkedItem.findIndex(value=>
                item.id===value.subjectGroupId)!==-1;
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
                {"Danh sách nhóm môn học"}
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
                                            {
                                                _.isArray(label)?(
                                                    <List>
                                                        {
                                                            label.map((iterator,index2)=>(
                                                                <ListItemText  key={iterator+index2}>
                                                                    <Typography 
                                                                        className={classes.tableSubCell} 
                                                                        variant="subtitle2"
                                                                    >
                                                                        {iterator}  
                                                                    </Typography>
                                                                </ListItemText>
                                                            ))
                                                        }
                                                    </List>
                                                ):label
                                            }
                                        </TableCell>   
                                    ))
                                }
                                <TableCell
                                    align="center"
                                    className={classes.tableCell}
                                >
                                    <FormControlLabel
                                        key={index}
                                        control={
                                            <Checkbox
                                                value={JSON.stringify(item)}
                                                checked={isCheck(item)}
                                                onChange={handleCheck} tabIndex={-1}
                                                color="primary" disableRipple
                                                disabled={isDisable(item)}
                                            />
                                        }
                                        label={
                                            <Typography variant="body2">
                                                {"Đăng ký"}
                                            </Typography>
                                        }
                                    />
                                </TableCell>
                            </TableRow>
                        ))
                    }
                </TableBody>
            </CustomTable>
            <CustomPagination/>
            <CustomBackDrop open={openBackDrop} />
            <CustomNotification notify={notify} onNotify={setNotify}/> 
        </Paper>
    )
}