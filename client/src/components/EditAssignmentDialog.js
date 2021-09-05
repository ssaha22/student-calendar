import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  TextField,
  Typography,
  Button,
  makeStyles,
} from "@material-ui/core";
import { KeyboardDatePicker, KeyboardTimePicker } from "@material-ui/pickers";
import axios from "axios";
import { useSelector } from "react-redux";
import { format, parseISO } from "date-fns";

const useStyles = makeStyles((theme) => ({
  title: {
    textAlign: "center",
  },
  form: {
    width: "100%",
    marginTop: theme.spacing(1),
  },
  button: {
    margin: theme.spacing(3, 0.5, 2),
  },
  errorMessage: {
    color: "red",
    textAlign: "center",
  },
}));

function formatAssignment(assignment) {
  return {
    ...assignment,
    dueDate: parseISO(assignment.dueDate),
    dueTime: assignment.dueTime
      ? parseISO(
          `${new Date().toISOString().substring(0, 10)}T${assignment.dueTime}`
        )
      : null,
  };
}

function EditAssignmentDialog({
  initialAssignment,
  open,
  handleClose,
  editAssignment,
}) {
  const classes = useStyles();
  const userInfo = useSelector((state) => state.user);
  const [assignment, setAssignment] = useState(
    formatAssignment(initialAssignment)
  );
  const [error, setError] = useState("");

  function onClose(assignmentState) {
    handleClose();
    setAssignment(formatAssignment(assignmentState));
    setError("");
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setAssignment((prevAssignment) => ({ ...prevAssignment, [name]: value }));
  }

  async function handleEditAssignment(e) {
    e.preventDefault();
    const assignmentCopy = Object.assign({}, assignment);
    const { dueDate, dueTime } = assignmentCopy;
    assignmentCopy.dueDate = format(dueDate, "yyyy-MM-dd");
    assignmentCopy.dueTime = dueTime ? format(dueTime, "HH:mm") : null;
    try {
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/assignments/${assignment.id}`,
        assignmentCopy,
        { headers: { Authorization: `Bearer ${userInfo.authToken}` } }
      );
      onClose(res.data);
      editAssignment(res.data);
    } catch (err) {
      setError("Error updating assignment");
    }
  }

  return (
    <Dialog open={open} onClose={() => onClose(initialAssignment)}>
      <DialogContent>
        <Typography component="h1" variant="h5" className={classes.title}>
          Edit Assignment
        </Typography>
        <form
          className={classes.form}
          onSubmit={handleEditAssignment}
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
            value={assignment.name}
            onChange={handleChange}
          />
          <KeyboardDatePicker
            inputVariant="outlined"
            margin="normal"
            required
            fullWidth
            label="Due Date"
            value={assignment.dueDate}
            format="yyyy-MM-dd"
            placeholder="YYYY-MM-DD"
            disablePast
            onChange={(newDueDate) =>
              handleChange({
                target: { name: "dueDate", value: newDueDate },
              })
            }
          />
          <KeyboardTimePicker
            inputVariant="outlined"
            margin="normal"
            fullWidth
            label="Due Time"
            value={assignment.dueTime}
            format="hh:mm a"
            placeholder="HH:MM AM/PM"
            onChange={(newDueTime) =>
              handleChange({
                target: { name: "dueTime", value: newDueTime },
              })
            }
          />
          <Typography className={classes.errorMessage}>{error}</Typography>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!assignment.name || !assignment.dueDate}
            className={classes.button}
          >
            Save Assignment
          </Button>
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={() => onClose(initialAssignment)}
          >
            Cancel
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditAssignmentDialog;
