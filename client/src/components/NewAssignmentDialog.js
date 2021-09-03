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
import { format } from "date-fns";

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

function NewAssignmentDialog({ courseID, open, handleClose, addAssignment }) {
  const classes = useStyles();
  const userInfo = useSelector((state) => state.user);
  const initialAssignment = {
    name: "",
    dueDate: null,
    dueTime: null,
  };
  const [assignment, setAssignment] = useState(initialAssignment);
  const [error, setError] = useState("");

  function onClose() {
    handleClose();
    setAssignment(initialAssignment);
    setError("");
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setAssignment((prevAssignment) => ({ ...prevAssignment, [name]: value }));
  }

  async function handleAddAssignment(e) {
    e.preventDefault();
    const assignmentCopy = Object.assign({}, assignment);
    const { dueDate, dueTime } = assignmentCopy;
    assignmentCopy.dueDate = dueDate ? format(dueDate, "yyyy-MM-dd") : null;
    assignmentCopy.dueTime = dueTime ? format(dueTime, "HH:mm") : null;
    assignmentCopy.courseID = courseID;
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/assignments`,
        assignmentCopy,
        { headers: { Authorization: `Bearer ${userInfo.authToken}` } }
      );
      addAssignment(res.data);
      onClose();
    } catch (err) {
      setError("Error adding course");
    }
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent>
        <Typography component="h1" variant="h5" className={classes.title}>
          New Assignment
        </Typography>
        <form
          className={classes.form}
          onSubmit={handleAddAssignment}
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
            Add Assignment
          </Button>
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={onClose}
          >
            Cancel
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default NewAssignmentDialog;
