import React, { useState, useEffect } from "react";
import AppMenu from "../components/AppMenu";
import { useParams, Redirect, useHistory } from "react-router";
import { useSelector } from "react-redux";
import {
  Typography,
  Container,
  Button,
  IconButton,
  Tooltip,
} from "@material-ui/core";
import axios from "axios";
import { makeStyles } from "@material-ui/core/styles";
import { Home, Add } from "@material-ui/icons";
import { parseISO } from "date-fns";
import Assignment from "../components/Assignment";
import NewAssignmentDialog from "../components/NewAssignmentDialog";
import Exam from "../components/Exam";
import NewExamDialog from "../components/NewExamDialog";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  errorContent: {
    marginTop: theme.spacing(15),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  errorText: {
    [theme.breakpoints.down("xs")]: {
      fontSize: "2rem",
    },
  },
  content: {
    margin: theme.spacing(9, 0, 5),
    display: "flex",
    flexDirection: "column",
    alignItems: "start",
  },
  courseName: {
    alignSelf: "center",
  },
  homeButton: {
    marginTop: theme.spacing(3),
  },
  group: {
    margin: theme.spacing(1),
  },
}));

function CoursePage() {
  const { id } = useParams();
  const history = useHistory();
  const userInfo = useSelector((state) => state.user);
  const classes = useStyles();
  const [course, setCourse] = useState(null);
  const [error, setError] = useState("");
  const [showNewAssignmentDialog, setShowNewAssignmentDialog] = useState(false);
  const [showNewExamDialog, setShowNewExamDialog] = useState(false);

  useEffect(() => {
    async function fetchCourse() {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/courses/${id}`,
          { headers: { Authorization: `Bearer ${userInfo.authToken}` } }
        );
        setCourse(res.data);
        setError("");
      } catch {
        setError("Course Not Found");
      }
    }
    fetchCourse();
  }, [id, userInfo]);

  function addAssignment(assignment) {
    const newAssignments = [...course.assignments, assignment];
    newAssignments.sort(
      (a, b) =>
        parseISO(`${a.dueDate.substring(0, 10)}T${a.dueTime || "23:59:59"}`) -
        parseISO(`${b.dueDate.substring(0, 10)}T${b.dueTime || "23:59:39"}`)
    );
    setCourse({ ...course, assignments: newAssignments });
  }

  function completeAssignment(assignment) {
    const newAssignments = course.assignments.map((a) =>
      a.id === assignment.id
        ? {
            ...assignment,
            isCompleted: !assignment.isCompleted,
          }
        : a
    );
    setCourse({ ...course, assignments: newAssignments });
  }

  function editAssignment(assignment) {
    const newAssignments = course.assignments.map((a) =>
      a.id === assignment.id ? assignment : a
    );
    newAssignments.sort(
      (a, b) =>
        parseISO(`${a.dueDate.substring(0, 10)}T${a.dueTime || "11:59:59"}`) -
        parseISO(`${b.dueDate.substring(0, 10)}T${b.dueTime || "11:59:59"}`)
    );
    setCourse({ ...course, assignments: newAssignments });
  }

  function deleteAssignment(assignment) {
    const newAssignments = course.assignments.filter(
      (a) => a.id !== assignment.id
    );
    setCourse({ ...course, assignments: newAssignments });
  }

  function addExam(exam) {
    const newExams = [...course.exams, exam];
    newExams.sort(
      (a, b) =>
        parseISO(`${a.date.substring(0, 10)}T${a.startTime || "23:59:59"}`) -
        parseISO(`${b.date.substring(0, 10)}T${b.startTime || "23:59:59"}`)
    );
    setCourse({ ...course, exams: newExams });
  }

  function editExam(exam) {
    const newExams = course.exams.map((e) => (e.id === exam.id ? exam : e));
    newExams.sort(
      (a, b) =>
        parseISO(`${a.date.substring(0, 10)}T${a.startTime || "23:59:59"}`) -
        parseISO(`${b.date.substring(0, 10)}T${b.startTime || "23:59:59"}`)
    );
    setCourse({ ...course, exams: newExams });
  }

  function deleteExam(exam) {
    const newExams = course.exams.filter((e) => e.id !== exam.id);
    setCourse({ ...course, exams: newExams });
  }

  if (!userInfo.userID || !userInfo.authToken) {
    return (
      <Redirect
        to={{ pathname: "/login", state: { redirectedFrom: `/courses/${id}` } }}
      />
    );
  }

  if (error) {
    return (
      <div className={classes.root}>
        <AppMenu showSideBar selectedCourseID={parseInt(id)} />
        <Container component="main" className={classes.errorContent}>
          <Typography variant="h2" className={classes.errorText}>
            {error}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<Home />}
            className={classes.homeButton}
            onClick={() => history.push("/")}
          >
            Home
          </Button>
        </Container>
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <NewAssignmentDialog
        courseID={id}
        open={showNewAssignmentDialog}
        handleClose={() => setShowNewAssignmentDialog(false)}
        addAssignment={addAssignment}
      ></NewAssignmentDialog>
      <NewExamDialog
        courseID={id}
        open={showNewExamDialog}
        handleClose={() => setShowNewExamDialog(false)}
        addExam={addExam}
      ></NewExamDialog>
      <AppMenu showSideBar selectedCourseID={parseInt(id)} />
      {course && (
        <Container component="main" className={classes.content}>
          <Typography
            component="h1"
            variant="h4"
            className={classes.courseName}
          >
            {course.name}
          </Typography>
          <div className={classes.group}>
            <Typography component="h2" variant="h5">
              Assignments
              <Tooltip title="Add new assignment">
                <IconButton
                  color="primary"
                  onClick={() => setShowNewAssignmentDialog(true)}
                >
                  <Add />
                </IconButton>
              </Tooltip>
            </Typography>
            {course.assignments.map((assignment) => {
              return (
                <Assignment
                  assignment={assignment}
                  onComplete={() => completeAssignment(assignment)}
                  onEdit={editAssignment}
                  onDelete={() => deleteAssignment(assignment)}
                  showDate
                  key={assignment.id}
                />
              );
            })}
          </div>
          <div className={classes.group}>
            <Typography component="h2" variant="h5">
              Exams
              <Tooltip title="Add new exam">
                <IconButton
                  color="primary"
                  onClick={() => setShowNewExamDialog(true)}
                >
                  <Add />
                </IconButton>
              </Tooltip>
            </Typography>
            {course.exams.map((exam) => {
              return (
                <Exam
                  exam={exam}
                  onEdit={editExam}
                  onDelete={() => deleteExam(exam)}
                  showDate
                  key={exam.id}
                />
              );
            })}
          </div>
        </Container>
      )}
    </div>
  );
}

export default CoursePage;
