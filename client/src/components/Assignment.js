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

function Assignment({ assignment, onComplete, onEdit, onDelete }) {
  const classes = useStyles();
  const [showEditAssignmentDialog, setShowEditAssignmentDialog] =
    useState(false);

  return (
    <>
      <EditAssignmentDialog
        initialAssignment={assignment}
        open={showEditAssignmentDialog}
        handleClose={() => setShowEditAssignmentDialog(false)}
        editAssignment={onEdit}
      ></EditAssignmentDialog>
      <Paper className={classes.paper}>
        <Grid container justifyContent="space-between" wrap="nowrap">
          <Grid item>
            <Typography
              className={assignment.isCompleted ? classes.strikethrough : null}
            >
              <b>{assignment.name}</b> due{" "}
              {format(parseISO(assignment.dueDate), "MMM d, y")}
              {assignment.dueTime && ` at ${formatTime(assignment.dueTime)}`}
            </Typography>
          </Grid>
          <Grid item>
            <Tooltip title="Complete assignment">
              <IconButton size="small" onClick={onComplete}>
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
            <Tooltip title="Delete assignment" onClick={onDelete}>
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
