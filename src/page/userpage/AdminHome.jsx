import React, { useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import CustomAppBar from "../component/CustomAppBar";
import CustomSideBar from '../component/CustomSideBar';
import { Route, useHistory } from 'react-router';
import Dashboard from "./dashboard/DashBoard";
import Statistic from "./statistic/Statistic";
import {LoginApi} from "../../api/LoginApi";
import { useDispatch } from 'react-redux';
import {setUpRole} from "../../app/slice/SideBarSlice";
import Term from './term/Term';
import StatList from './statList/StatList';
import Registration from "./registration/Registration";

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
    },
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: theme.spacing(0, 1),
        // necessary for content to be below app bar
        ...theme.mixins.toolbar,
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
        display:"flex",
        justifyContent:"center",
        alignItems:"center",
        flexDirection:"column"
    },
}));

export default function AdminHome() {
    //Tự động chuyển hướng
    const history = useHistory();
     //Lấy dispatch để thực hiện hàm của slice
    const dispatch = useDispatch();
    useEffect(() => {
        LoginApi.autoLogin().then(resp=>{
            if(resp!=="admin"){
                history.push("/login");
                return;
            }
            dispatch(setUpRole("ADMIN"));
        })
    }, [history,dispatch]);
    //CSS
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <CssBaseline />
            <CustomAppBar/>
            <CustomSideBar/>
            <main className={classes.content}>
                <div className={classes.toolbar} />
                <Route path="/admin" exact>
                    <Dashboard/>
                </Route>
                <Route path="/admin/regtime">
                    <Term/>
                </Route>
                <Route path="/admin/stat" exact>
                    <Statistic/>
                </Route>
                <Route path="/admin/stat/remember">
                    <StatList/>
                </Route>
                <Route path="/admin/stat/forgot">
                    <StatList/>
                </Route>
                <Route path="/admin/stat/modify">
                    <Registration/>
                </Route>
            </main>
        </div>
    );
}
