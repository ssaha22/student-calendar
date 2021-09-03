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

function NewExamDialog({ courseID, open, handleClose, addExam }) {
  const classes = useStyles();
  const userInfo = useSelector((state) => state.user);
  const initialExam = {
    name: "",
    date: null,
    startTime: null,
    endTime: null,
  };
  const [exam, setExam] = useState(initialExam);
  const [error, setError] = useState("");

  function onClose() {
    handleClose();
    setExam(initialExam);
    setError("");
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setExam((prevExam) => ({ ...prevExam, [name]: value }));
  }

  async function handleAddExam(e) {
    e.preventDefault();
    const examCopy = Object.assign({}, exam);
    const { date, startTime, endTime } = examCopy;
    examCopy.date = format(date, "yyyy-MM-dd");
    examCopy.startTime = startTime ? format(startTime, "HH:mm") : null;
    examCopy.endTime = endTime ? format(endTime, "HH:mm") : null;
    examCopy.courseID = courseID;
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/exams`,
        examCopy,
        { headers: { Authorization: `Bearer ${userInfo.authToken}` } }
      );
      addExam(res.data);
      onClose();
    } catch (err) {
      setError("Error adding exam");
    }
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent>
        <Typography component="h1" variant="h5" className={classes.title}>
          New Exam
        </Typography>
        <form
          className={classes.form}
          onSubmit={handleAddExam}
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
            value={exam.name}
            onChange={handleChange}
          />
          <KeyboardDatePicker
            inputVariant="outlined"
            margin="normal"
            required
            fullWidth
            label="Date"
            value={exam.date}
            format="yyyy-MM-dd"
            placeholder="YYYY-MM-DD"
            disablePast
            onChange={(newDate) =>
              handleChange({
                target: { name: "date", value: newDate },
              })
            }
          />
          <KeyboardTimePicker
            inputVariant="outlined"
            margin="normal"
            fullWidth
            label="Start Time"
            value={exam.startTime}
            format="hh:mm a"
            placeholder="HH:MM AM/PM"
            onChange={(newStartTime) =>
              handleChange({
                target: { name: "startTime", value: newStartTime },
              })
            }
          />
          <KeyboardTimePicker
            inputVariant="outlined"
            margin="normal"
            fullWidth
            label="End Time"
            value={exam.endTime}
            format="hh:mm a"
            placeholder="HH:MM AM/PM"
            onChange={(newEndTime) =>
              handleChange({
                target: { name: "endTime", value: newEndTime },
              })
            }
          />
          <Typography className={classes.errorMessage}>{error}</Typography>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!exam.name || !exam.date}
            className={classes.button}
          >
            Add Exam
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

export default NewExamDialog;
