import React, { useState, useEffect } from "react";
import AppMenu from "../components/AppMenu";
import { useSelector } from "react-redux";
import { Redirect } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Typography,
  IconButton,
  makeStyles,
} from "@material-ui/core";
import { ChevronLeft, ChevronRight } from "@material-ui/icons";
import { format, isSameDay, parseISO, addDays, subDays } from "date-fns";
import Course from "../components/Course";
import Assignment from "../components/Assignment";
import Exam from "../components/Exam";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  content: {
    margin: theme.spacing(9, 0, 5),
    display: "flex",
    flexDirection: "column",
    alignItems: "start",
  },
  date: {
    alignSelf: "center",
  },
  group: {
    margin: theme.spacing(1),
  },
}));

function SchedulePage() {
  const classes = useStyles();
  const userInfo = useSelector((state) => state.user);
  const [date, setDate] = useState(new Date());
  const [schedule, setSchedule] = useState(null);

  useEffect(() => {
    async function fetchSchedule() {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/users/${
          userInfo.userID
        }/schedule?date=${format(date, "yyyy-MM-dd")}`,
        { headers: { Authorization: `Bearer ${userInfo.authToken}` } }
      );
      setSchedule(res.data);
    }
    fetchSchedule();
  }, [userInfo, date]);

  function decreaseDate() {
    setDate(subDays(date, 1));
  }

  function increaseDate() {
    setDate(addDays(date, 1));
  }

  function completeAssignment(assignment) {
    const newAssignments = schedule.assignments.map((a) =>
      a.id === assignment.id
        ? {
            ...assignment,
            isCompleted: !assignment.isCompleted,
          }
        : a
    );
    setSchedule({ ...schedule, assignments: newAssignments });
  }

  function editAssignment(assignment) {
    let newAssignments;
    if (isSameDay(parseISO(assignment.dueDate), date)) {
      newAssignments = schedule.assignments.map((a) =>
        a.id === assignment.id ? assignment : a
      );
      newAssignments.sort(
        (a, b) =>
          parseISO(`${a.dueDate.substring(0, 10)}T${a.dueTime || "11:59:59"}`) -
          parseISO(`${b.dueDate.substring(0, 10)}T${b.dueTime || "11:59:59"}`)
      );
    } else {
      newAssignments = schedule.assignments.filter(
        (a) => a.id !== assignment.id
      );
    }
    setSchedule({ ...schedule, assignments: newAssignments });
  }

  function deleteAssignment(assignment) {
    const newAssignments = schedule.assignments.filter(
      (a) => a.id !== assignment.id
    );
    setSchedule({ ...schedule, assignments: newAssignments });
  }

  function editExam(exam) {
    let newExams;
    if (isSameDay(parseISO(exam.date), date)) {
      newExams = schedule.exams.map((e) => (e.id === exam.id ? exam : e));
      newExams.sort(
        (a, b) =>
          parseISO(`${a.date.substring(0, 10)}T${a.startTime || "23:59:59"}`) -
          parseISO(`${b.date.substring(0, 10)}T${b.startTime || "23:59:59"}`)
      );
    } else {
      newExams = schedule.exams.filter((e) => e.id !== exam.id);
    }
    setSchedule({ ...schedule, exams: newExams });
  }

  function deleteExam(exam) {
    const newExams = schedule.exams.filter((e) => e.id !== exam.id);
    setSchedule({ ...schedule, exams: newExams });
  }

  if (!userInfo.userID || !userInfo.authToken) {
    return <Redirect to="/login" />;
  }

  return (
    <div className={classes.root}>
      <AppMenu showSideBar selected="Schedule" />
      <Container component="main" className={classes.content}>
        <Typography component="h1" variant="h4" className={classes.date}>
          <IconButton color="primary" onClick={decreaseDate}>
            <ChevronLeft fontSize="large" />
          </IconButton>
          {format(date, "EEEE, MMMM do, y")}
          <IconButton color="primary" onClick={increaseDate}>
            <ChevronRight fontSize="large" />
          </IconButton>
        </Typography>
        <div className={classes.group}>
          <Typography component="h2" variant="h5">
            Courses
          </Typography>
          {schedule &&
            [...schedule.courses, ...schedule.additionalSections]
              .sort(
                (a, b) =>
                  parseISO(`${format(date, "yyyy-MM-dd")}T${a.startTime}`) -
                  parseISO(`${format(date, "yyyy-MM-dd")}T${b.startTime}`)
              )
              .map((course) => {
                return <Course course={course} date={date} key={course.id} />;
              })}
        </div>
        <div className={classes.group}>
          <Typography component="h2" variant="h5">
            Assignments
          </Typography>
          {schedule &&
            schedule.assignments.map((assignment) => {
              return (
                <Assignment
                  assignment={assignment}
                  onComplete={() => completeAssignment(assignment)}
                  onEdit={editAssignment}
                  onDelete={() => deleteAssignment(assignment)}
                  showCourseName
                  key={assignment.id}
                />
              );
            })}
        </div>
        <div className={classes.group}>
          <Typography component="h2" variant="h5">
            Exams
          </Typography>
          {schedule &&
            schedule.exams.map((exam) => {
              return (
                <Exam
                  exam={exam}
                  onEdit={editExam}
                  onDelete={() => deleteExam(exam)}
                  showCourseName
                  key={exam.id}
                />
              );
            })}
        </div>
      </Container>
    </div>
  );
}

export default SchedulePage;
