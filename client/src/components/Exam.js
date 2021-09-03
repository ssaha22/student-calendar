import React, { useState } from "react";
import {
  Typography,
  IconButton,
  Tooltip,
  Grid,
  Paper,
} from "@material-ui/core";
import { parseISO, format, isPast } from "date-fns";
import formatTime from "../utils/formatTime";
import { makeStyles } from "@material-ui/core/styles";
import { Edit, Delete } from "@material-ui/icons";
import clsx from "clsx";
import EditExamDialog from "./EditExamDialog";

const useStyles = makeStyles((theme) => ({
  paper: {
    margin: theme.spacing(0.75),
    padding: theme.spacing(1.5),
    width: 600,
  },
  strikethrough: {
    textDecoration: "line-through",
  },
}));

function Exam({ exam, onEdit, onDelete }) {
  const classes = useStyles();
  const [showEditExamDialog, setShowEditExamDialog] = useState(false);

  return (
    <>
      <EditExamDialog
        initialExam={exam}
        open={showEditExamDialog}
        handleClose={() => setShowEditExamDialog(false)}
        editExam={onEdit}
      ></EditExamDialog>
      <Paper className={classes.paper}>
        <Grid container justifyContent="space-between" wrap="nowrap">
          <Grid item>
            <Typography
              className={clsx({
                [classes.strikethrough]:
                  (exam.endTime &&
                    isPast(
                      parseISO(`${exam.date.substring(0, 10)}T${exam.endTime}`)
                    )) ||
                  (!exam.endTime &&
                    isPast(parseISO(`${exam.date.substring(0, 10)}T23:59:59`))),
              })}
            >
              <b>{exam.name}</b> on {format(parseISO(exam.date), "MMM d, y")}
              {exam.startTime &&
                exam.endTime &&
                ` from ${formatTime(exam.startTime)} to ${formatTime(
                  exam.endTime
                )}`}
              {exam.startTime &&
                !exam.endTime &&
                ` at ${formatTime(exam.startTime)}`}
              {!exam.startTime &&
                exam.endTime &&
                ` until ${formatTime(exam.endTime)}`}
            </Typography>
          </Grid>
          <Grid item>
            <Tooltip title="Edit Exam">
              <IconButton
                size="small"
                onClick={() => setShowEditExamDialog(true)}
              >
                <Edit />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Exam" onClick={onDelete}>
              <IconButton size="small">
                <Delete />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>
    </>
  );
}

export default Exam;
