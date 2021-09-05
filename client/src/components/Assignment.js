import React, { useState } from "react";
import {
  Typography,
  IconButton,
  Tooltip,
  Grid,
  Paper,
} from "@material-ui/core";
import { parseISO, format } from "date-fns";
import formatTime from "../utils/formatTime";
import { makeStyles } from "@material-ui/core/styles";
import { Edit, Delete, Done } from "@material-ui/icons";
import EditAssignmentDialog from "./EditAssignmentDialog";
import axios from "axios";
import { useSelector } from "react-redux";

const useStyles = makeStyles((theme) => ({
  paper: {
    margin: theme.spacing(0.75, 0.25),
    padding: theme.spacing(1.5),
    width: 600,
  },
  strikethrough: {
    textDecoration: "line-through",
  },
}));

function Assignment({
  assignment,
  onComplete,
  onEdit,
  onDelete,
  showDate,
  showCourseName,
}) {
  const classes = useStyles();
  const userInfo = useSelector((state) => state.user);
  const [showEditAssignmentDialog, setShowEditAssignmentDialog] =
    useState(false);

  async function handleComplete() {
    onComplete();
    await axios.put(
      `${process.env.REACT_APP_API_URL}/assignments/${assignment.id}`,
      {
        ...assignment,
        isCompleted: !assignment.isCompleted,
      },
      { headers: { Authorization: `Bearer ${userInfo.authToken}` } }
    );
  }

  async function handleDelete() {
    onDelete();
    await axios.delete(
      `${process.env.REACT_APP_API_URL}/assignments/${assignment.id}`,
      { headers: { Authorization: `Bearer ${userInfo.authToken}` } }
    );
  }

  return (
    <>
      <EditAssignmentDialog
        initialAssignment={assignment}
        open={showEditAssignmentDialog}
        handleClose={() => setShowEditAssignmentDialog(false)}
        editAssignment={onEdit}
      />
      <Paper className={classes.paper}>
        <Grid container justifyContent="space-between" wrap="nowrap">
          <Grid item>
            <Typography
              className={assignment.isCompleted ? classes.strikethrough : null}
            >
              <b>
                {showCourseName && `${assignment.courseName} - `}
                {assignment.name}
              </b>
              {showDate &&
                ` due ${format(parseISO(assignment.dueDate), "MMM d, y")}`}
              {!showDate && assignment.dueTime && " due "}
              {assignment.dueTime && ` at ${formatTime(assignment.dueTime)}`}
            </Typography>
          </Grid>
          <Grid item>
            <Tooltip title="Complete assignment">
              <IconButton size="small" onClick={handleComplete}>
                <Done />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit assignment">
              <IconButton
                size="small"
                onClick={() => setShowEditAssignmentDialog(true)}
              >
                <Edit />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete assignment" onClick={handleDelete}>
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

export default Assignment;
