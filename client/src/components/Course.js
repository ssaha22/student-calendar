import React from "react";
import { Typography, Paper, ButtonBase } from "@material-ui/core";
import { parseISO, format, isPast } from "date-fns";
import formatTime from "../utils/formatTime";
import { makeStyles } from "@material-ui/core/styles";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  paper: {
    display: "flex",
    justifyContent: "flex-start",
    margin: theme.spacing(0.5, 0.25),
    padding: theme.spacing(1.75),
    width: 600,
  },
  strikethrough: {
    textDecoration: "line-through",
  },
}));

function Course({ course, date }) {
  const classes = useStyles();
  const history = useHistory();

  return (
    <ButtonBase
      disableRipple
      onClick={() =>
        history.push(`/courses/${course.type ? course.courseID : course.id}`)
      }
    >
      <Paper className={classes.paper}>
        <Typography
          className={
            isPast(parseISO(`${format(date, "yyyy-MM-dd")}T${course.endTime}`))
              ? classes.strikethrough
              : null
          }
        >
          <b>
            {course.name}
            {course.type && ` ${course.type} `}
            {course.section && ` ${course.section} `}
          </b>
          {` from ${formatTime(course.startTime)} to ${formatTime(
            course.endTime
          )}`}
        </Typography>
      </Paper>
    </ButtonBase>
  );
}

export default Course;
