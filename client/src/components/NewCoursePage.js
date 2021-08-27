import React, { useState } from "react";
import AppMenu from "./AppMenu";
import { Container, Typography, TextField, Button } from "@material-ui/core";
import { KeyboardDatePicker } from "@material-ui/pickers";
import { makeStyles } from "@material-ui/core/styles";
import { format, isAfter } from "date-fns";
import { useSelector, useDispatch } from "react-redux";
import { addCourse } from "../redux/coursesSlice";
import axios from "axios";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  paper: {
    marginTop: theme.spacing(15),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  form: {
    width: "100%",
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  errorMessage: {
    color: "red",
    textAlign: "center",
  },
}));

function NewCoursePage() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.user);
  const history = useHistory();
  const [course, setCourse] = useState({
    name: "",
    section: "",
    startDate: null,
    endDate: null,
  });
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setCourse((prevCourse) => ({ ...prevCourse, [name]: value }));
  }

  async function handleAddCourse(e) {
    e.preventDefault();
    const courseCopy = Object.assign({}, course);
    const { startDate, endDate, section } = courseCopy;
    if (isAfter(startDate, endDate)) {
      return setError("Start date can not be after end date");
    }
    courseCopy.startDate = format(startDate, "yyyy-MM-dd");
    courseCopy.endDate = format(endDate, "yyyy-MM-dd");
    courseCopy.userID = userInfo.userID;
    if (!section) {
      delete courseCopy.section;
    }
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/courses`,
        courseCopy,
        { headers: { Authorization: `Bearer ${userInfo.authToken}` } }
      );
      dispatch(addCourse(res.data));
      history.push(`/courses/${res.data.id}`);
    } catch (err) {
      console.log(err);
      setError("Error adding course");
    }
  }

  return (
    <div className={classes.root}>
      <AppMenu showSideBar={true} selected="New Course" />
      <Container component="main" maxWidth="sm" className={classes.content}>
        <div className={classes.paper}>
          <Typography component="h1" variant="h5">
            New Course
          </Typography>
          <form
            className={classes.form}
            onSubmit={handleAddCourse}
            noValidate
            autoComplete="off"
          >
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="name"
              label="Name"
              name="name"
              autoFocus
              value={course.name}
              onChange={handleChange}
            />
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              name="section"
              label="Section"
              id="section"
              value={course.section}
              onChange={handleChange}
            />
            <KeyboardDatePicker
              inputVariant="outlined"
              margin="normal"
              fullWidth
              label="Start Date"
              value={course.startDate}
              format="yyyy-MM-dd"
              placeholder="YYYY-MM-DD"
              onChange={(newStartDate) =>
                handleChange({
                  target: { name: "startDate", value: newStartDate },
                })
              }
            />
            <KeyboardDatePicker
              inputVariant="outlined"
              margin="normal"
              fullWidth
              label="End Date"
              value={course.endDate}
              format="yyyy-MM-dd"
              placeholder="YYYY-MM-DD"
              onChange={(newEndDate) =>
                handleChange({
                  target: { name: "endDate", value: newEndDate },
                })
              }
            />
            <Typography className={classes.errorMessage}>{error}</Typography>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              disabled={!course.name}
            >
              Add Course
            </Button>
          </form>
        </div>
      </Container>
    </div>
  );
}

export default NewCoursePage;
