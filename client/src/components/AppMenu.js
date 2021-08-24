import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/userSlice";
import { useHistory, useLocation } from "react-router-dom";
import clsx from "clsx";
import {
  AppBar,
  Divider,
  Drawer,
  Hidden,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Collapse,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import {
  Class,
  Schedule,
  ExpandLess,
  ExpandMore,
  Settings,
  Menu,
  Lock,
  AddBox,
} from "@material-ui/icons";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  drawer: {
    [theme.breakpoints.up("md")]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  appBar: {
    [theme.breakpoints.up("md")]: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
    },
  },
  title: {
    flexGrow: 1,
    textAlign: "center",
    fontSize: "2rem",
    [theme.breakpoints.down("xs")]: {
      fontSize: "1.5rem",
    },
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up("md")]: {
      display: "none",
    },
  },
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    width: drawerWidth,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  courses: {
    paddingLeft: theme.spacing(6),
  },
  selected: {
    backgroundColor: "#c5cae9",
    "&:hover": {
      background: "#c5cae9",
    },
  },
  notSelected: {
    "&:hover": {
      background: "#e8eaf6",
    },
  },
}));

function AppMenu({ selected, selectedCourseID }) {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();
  const courses = useSelector((state) => state.courses);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(Boolean(selectedCourseID));

  function handleDrawerToggle() {
    setMobileOpen(!mobileOpen);
  }

  function handleCoursesToggle() {
    setCoursesOpen(!coursesOpen);
  }

  function redirect(path) {
    if (location.pathname !== path) {
      history.push(path);
    }
  }

  function handleLogout() {
    dispatch(logout());
    history.push("/");
  }

  const drawer = (
    <div>
      <div className={classes.toolbar} />
      <Divider />
      <List>
        <ListItem
          button
          className={
            selected === "Schedule" ? classes.selected : classes.notSelected
          }
          onClick={() => redirect("/schedule")}
        >
          <ListItemIcon>
            <Schedule />
          </ListItemIcon>
          <ListItemText primary="Schedule" />
        </ListItem>
        <ListItem
          button
          className={classes.notSelected}
          onClick={handleCoursesToggle}
        >
          <ListItemIcon>
            <Class />
          </ListItemIcon>
          <ListItemText primary="Courses" />
          {coursesOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={coursesOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {courses.map((course) => {
              const { id, name } = course;
              return (
                <ListItem
                  key={id}
                  button
                  onClick={() => redirect(`/courses/${id}`)}
                  className={clsx(classes.courses, {
                    [classes.selected]: selectedCourseID === id,
                    [classes.notSelected]: selectedCourseID !== id,
                  })}
                >
                  <ListItemText primary={name} />
                </ListItem>
              );
            })}
          </List>
        </Collapse>
        <ListItem
          button
          className={
            selected === "New Course" ? classes.selected : classes.notSelected
          }
          onClick={() => redirect("/new-course")}
        >
          <ListItemIcon>
            <AddBox />
          </ListItemIcon>
          <ListItemText primary="New Course" />
        </ListItem>
        <ListItem
          button
          className={
            selected === "Settings" ? classes.selected : classes.notSelected
          }
          onClick={() => redirect("/settings")}
        >
          <ListItemIcon>
            <Settings />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItem>
        <ListItem button className={classes.notSelected} onClick={handleLogout}>
          <ListItemIcon>
            <Lock />
          </ListItemIcon>
          <ListItemText primary="Log Out" />
        </ListItem>
      </List>
    </div>
  );

  return (
    <div className={classes.root}>
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            className={classes.menuButton}
          >
            <Menu />
          </IconButton>
          <Typography noWrap className={classes.title}>
            Student Calendar
          </Typography>
        </Toolbar>
      </AppBar>
      <nav className={classes.drawer}>
        <Hidden mdUp implementation="css">
          <Drawer
            variant="temporary"
            anchor="left"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            classes={{
              paper: classes.drawerPaper,
            }}
            ModalProps={{
              keepMounted: true,
            }}
          >
            {drawer}
          </Drawer>
        </Hidden>
        <Hidden smDown implementation="css">
          <Drawer
            classes={{
              paper: classes.drawerPaper,
            }}
            variant="permanent"
            open
          >
            {drawer}
          </Drawer>
        </Hidden>
      </nav>
    </div>
  );
}

export default AppMenu;
