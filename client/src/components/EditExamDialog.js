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

function formatExam(exam) {
  return {
    ...exam,
    date: parseISO(exam.date),
    startTime: exam.startTime
      ? parseISO(
          `${new Date().toISOString().substring(0, 10)}T${exam.startTime}`
        )
      : null,
    endTime: exam.endTime
      ? parseISO(`${new Date().toISOString().substring(0, 10)}T${exam.endTime}`)
      : null,
  };
}

function EditExamDialog({ initialExam, open, handleClose, editExam }) {
  const classes = useStyles();
  const userInfo = useSelector((state) => state.user);
  const [exam, setExam] = useState(formatExam(initialExam));
  const [error, setError] = useState("");

  function onClose(examState) {
    handleClose();
    setExam(formatExam(examState));
    setError("");
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setExam((prevExam) => ({ ...prevExam, [name]: value }));
  }

  async function handleEditExam(e) {
    e.preventDefault();
    const examCopy = Object.assign({}, exam);
    const { date, startTime, endTime } = examCopy;
    examCopy.date = format(date, "yyyy-MM-dd");
    examCopy.startTime = startTime ? format(startTime, "HH:mm") : null;
    examCopy.endTime = endTime ? format(endTime, "HH:mm") : null;
    try {
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/exams/${exam.id}`,
        examCopy,
        { headers: { Authorization: `Bearer ${userInfo.authToken}` } }
      );
      onClose(res.data);
      editExam(res.data);
    } catch (err) {
      setError("Error updating exam");
    }
  }

  return (
    <Dialog open={open} onClose={() => onClose(initialExam)}>
      <DialogContent>
        <Typography component="h1" variant="h5" className={classes.title}>
          Edit Exam
        </Typography>
        <form
          className={classes.form}
          onSubmit={handleEditExam}
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
            Save Exam
          </Button>
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={() => onClose(initialExam)}
          >
            Cancel
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditExamDialog;
