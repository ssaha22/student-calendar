const { google } = require("googleapis");
const { OAuth2 } = google.auth;
const { nextDay, format } = require("date-fns");
const convertKeysToCamelCase = require("../utils/convertKeysToCamelCase");
const db = require("../db");
const { Pool } = require("pg");
const pool = new Pool();

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

async function saveRefreshToken(userID, refreshToken) {
  await pool.query(
    "INSERT INTO google_api_info (user_id, refresh_token) VALUES ($1, $2)",
    [userID, refreshToken]
  );
}

async function getGoogleAPIInfo(userID) {
  const res = await pool.query(
    "SELECT * FROM google_api_info WHERE user_id = $1",
    [userID]
  );
  return convertKeysToCamelCase(res.rows[0]);
}

async function deleteGoogleAPIInfo(userID) {
  await pool.query("DELETE FROM google_api_info WHERE user_id = $1", [userID]);
}

async function getAuthenticatedCalendar(refreshToken) {
  const oAuth2Client = new OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  oAuth2Client.setCredentials({ refresh_token: refreshToken });
  return google.calendar({ version: "v3", auth: oAuth2Client });
}

async function createCalendars(userID) {
  try {
    const googleAPIInfo = await getGoogleAPIInfo(userID);
    if (!googleAPIInfo) {
      return;
    }
    const { refreshToken } = googleAPIInfo;
    const calendar = await getAuthenticatedCalendar(refreshToken);
    let res = await calendar.settings.get({ setting: "timezone" });
    const timeZone = res.data.value;
    res = await calendar.calendars.insert({
      requestBody: {
        summary: "Courses",
        timeZone,
      },
    });
    const coursesCalendarID = res.data.id;
    res = await calendar.calendars.insert({
      requestBody: {
        summary: "Assignments",
        timeZone,
      },
    });
    const assignmentsCalendarID = res.data.id;
    res = await calendar.calendars.insert({
      requestBody: {
        summary: "Exams",
        timeZone,
      },
    });
    const examsCalendarID = res.data.id;
    await pool.query(
      `UPDATE google_api_info 
      SET courses_calendar_id = $1, assignments_calendar_id = $2, exams_calendar_id = $3, time_zone = $4 
      WHERE user_id = $5`,
      [
        coursesCalendarID,
        assignmentsCalendarID,
        examsCalendarID,
        timeZone,
        userID,
      ]
    );
  } catch (err) {
    console.error(err);
  }
}

async function deleteCalendars(googleAPIInfo) {
  try {
    if (!googleAPIInfo) {
      return;
    }
    const {
      refreshToken,
      coursesCalendarID,
      assignmentsCalendarID,
      examsCalendarID,
    } = googleAPIInfo;
    const calendar = await getAuthenticatedCalendar(refreshToken);
    await calendar.calendarList.delete({ calendarId: coursesCalendarID });
    await calendar.calendarList.delete({ calendarId: assignmentsCalendarID });
    await calendar.calendarList.delete({ calendarId: examsCalendarID });
  } catch (err) {
    console.error(err);
  }
}

async function addCourse(course, calendar) {
  try {
    const { userID, name, startDate, endDate, times, additionalSections } =
      course;
    const googleAPIInfo = await getGoogleAPIInfo(userID);
    if (!googleAPIInfo) {
      return;
    }
    const { refreshToken, coursesCalendarID, timeZone } = googleAPIInfo;
    calendar = calendar || (await getAuthenticatedCalendar(refreshToken));
    const startDateDay = format(startDate, "EEEE");
    for (const day of times) {
      const newStartDate =
        startDateDay === day.day
          ? format(startDate, "yyyy-MM-dd")
          : format(
              nextDay(startDate, daysOfWeek.indexOf(day.day)),
              "yyyy-MM-dd"
            );
      const event = {
        summary: name,
        start: {
          dateTime: `${newStartDate}T${day.startTime}`,
          timeZone,
        },
        end: {
          dateTime: `${newStartDate}T${day.endTime}`,
          timeZone,
        },
        recurrence: [
          `RRULE:FREQ=WEEKLY;\
            BYDAY=${day.day.substring(0, 2)};\
            UNTIL=${format(endDate, "yyyyMMdd")}T235959Z`.replace(/ /g, ""),
        ],
      };
      const res = await calendar.events.insert({
        calendarId: coursesCalendarID,
        requestBody: event,
      });
      await pool.query(
        "UPDATE course_times SET google_calendar_event_id = $1 WHERE id = $2",
        [res.data.id, day.id]
      );
    }
    for (const additionalSection of additionalSections) {
      for (const day of additionalSection.times) {
        const newStartDate =
          startDateDay === day.day
            ? format(startDate, "yyyy-MM-dd")
            : format(
                nextDay(startDate, daysOfWeek.indexOf(day.day)),
                "yyyy-MM-dd"
              );
        const event = {
          summary: `${name} ${additionalSection.type} ${additionalSection.section}`,
          start: {
            dateTime: `${newStartDate}T${day.startTime}`,
            timeZone,
          },
          end: {
            dateTime: `${newStartDate}T${day.endTime}`,
            timeZone,
          },
          recurrence: [
            `RRULE:FREQ=WEEKLY;\
            BYDAY=${day.day.substring(0, 2)};\
            UNTIL=${format(endDate, "yyyyMMdd")}T235959Z`.replace(/ /g, ""),
          ],
        };
        const res = await calendar.events.insert({
          calendarId: coursesCalendarID,
          requestBody: event,
        });
        await pool.query(
          "UPDATE additional_section_times SET google_calendar_event_id = $1 WHERE id = $2",
          [res.data.id, day.id]
        );
      }
    }
  } catch (err) {
    console.error(err);
  }
}

async function updateCourse(oldCourse, newCourse) {
  try {
    const userID = newCourse.userID;
    const googleAPIInfo = await getGoogleAPIInfo(userID);
    if (!googleAPIInfo) {
      return;
    }
    const { refreshToken, assignmentsCalendarID, examsCalendarID } =
      googleAPIInfo;
    const calendar = await getAuthenticatedCalendar(refreshToken);
    await removeCourse(oldCourse, [], [], calendar);
    await addCourse(newCourse, calendar);
    if (newCourse.name !== oldCourse.name) {
      const courseID = newCourse.id;
      const assignments = await db.findAssignmentsForCourse(courseID);
      for (const assignment of assignments) {
        await calendar.events.patch({
          calendarId: assignmentsCalendarID,
          eventId: assignment.googleCalendarEventID,
          requestBody: { summary: `${newCourse.name} ${assignment.name}` },
        });
      }
      const exams = await db.findExamsForCourse(courseID);
      for (const exam of exams) {
        await calendar.events.patch({
          calendarId: examsCalendarID,
          eventId: exam.googleCalendarEventID,
          requestBody: { summary: `${newCourse.name} ${exam.name}` },
        });
      }
    }
  } catch (err) {
    console.error(err);
  }
}

async function removeCourse(course, assignments, exams, calendar) {
  try {
    const { userID, times, additionalSections } = course;
    const googleAPIInfo = await getGoogleAPIInfo(userID);
    if (!googleAPIInfo) {
      return;
    }
    const { refreshToken, coursesCalendarID } = googleAPIInfo;
    calendar = calendar || (await getAuthenticatedCalendar(refreshToken));
    if (!calendar) {
      return;
    }
    for (const day of times) {
      const { googleCalendarEventID } = day;
      if (!googleCalendarEventID) {
        continue;
      }
      await calendar.events.delete({
        calendarId: coursesCalendarID,
        eventId: googleCalendarEventID,
      });
    }
    for (const additionalSection of additionalSections) {
      for (const day of additionalSection.times) {
        const { googleCalendarEventID } = day;
        if (!googleCalendarEventID) {
          continue;
        }
        await calendar.events.delete({
          calendarId: coursesCalendarID,
          eventId: googleCalendarEventID,
        });
      }
    }
    for (const assignment of assignments) {
      await removeAssignment(assignment, calendar);
    }
    for (const exam of exams) {
      await removeExam(exam, calendar);
    }
  } catch (err) {
    console.error(err);
  }
}

async function addAssignment(assignment, calendar) {
  try {
    const { id, userID, courseName, name, dueDate, dueTime } = assignment;
    const googleAPIInfo = await getGoogleAPIInfo(userID);
    if (!googleAPIInfo) {
      return;
    }
    const { refreshToken, assignmentsCalendarID, timeZone } = googleAPIInfo;
    calendar = calendar || (await getAuthenticatedCalendar(refreshToken));
    let event;
    if (dueTime) {
      event = {
        summary: `${courseName} ${name}`,
        start: {
          dateTime: `${format(dueDate, "yyyy-MM-dd")}T${dueTime}`,
          timeZone,
        },
        end: {
          dateTime: `${format(dueDate, "yyyy-MM-dd")}T${dueTime}`,
          timeZone,
        },
      };
    } else {
      event = {
        summary: `${courseName} ${name}`,
        start: {
          date: `${format(dueDate, "yyyy-MM-dd")}`,
        },
        end: {
          date: `${format(dueDate, "yyyy-MM-dd")}`,
        },
      };
    }
    const res = await calendar.events.insert({
      calendarId: assignmentsCalendarID,
      requestBody: event,
    });
    await pool.query(
      "UPDATE assignments SET google_calendar_event_id = $1 WHERE id = $2",
      [res.data.id, id]
    );
  } catch (err) {
    console.error(err);
  }
}

async function updateAssignment(assignment) {
  try {
    const {
      userID,
      courseName,
      name,
      dueDate,
      dueTime,
      googleCalendarEventID,
    } = assignment;
    if (!googleCalendarEventID) {
      return;
    }
    const googleAPIInfo = await getGoogleAPIInfo(userID);
    if (!googleAPIInfo) {
      return;
    }
    const { refreshToken, assignmentsCalendarID, timeZone } = googleAPIInfo;
    const calendar = await getAuthenticatedCalendar(refreshToken);
    let event;
    if (dueTime) {
      event = {
        summary: `${courseName} ${name}`,
        start: {
          dateTime: `${format(dueDate, "yyyy-MM-dd")}T${dueTime}`,
          timeZone,
        },
        end: {
          dateTime: `${format(dueDate, "yyyy-MM-dd")}T${dueTime}`,
          timeZone,
        },
      };
    } else {
      event = {
        summary: `${courseName} ${name}`,
        start: {
          date: `${format(dueDate, "yyyy-MM-dd")}`,
        },
        end: {
          date: `${format(dueDate, "yyyy-MM-dd")}`,
        },
      };
    }
    await calendar.events.update({
      calendarId: assignmentsCalendarID,
      eventId: googleCalendarEventID,
      requestBody: event,
    });
  } catch (err) {
    console.error(err);
  }
}

async function removeAssignment(assignment, calendar) {
  try {
    const { userID, googleCalendarEventID } = assignment;
    if (!googleCalendarEventID) {
      return;
    }
    const googleAPIInfo = await getGoogleAPIInfo(userID);
    if (!googleAPIInfo) {
      return;
    }
    const { refreshToken, assignmentsCalendarID } = googleAPIInfo;
    calendar = calendar || (await getAuthenticatedCalendar(refreshToken));
    await calendar.events.delete({
      calendarId: assignmentsCalendarID,
      eventId: googleCalendarEventID,
    });
  } catch (err) {
    console.error(err);
  }
}

async function addExam(exam, calendar) {
  try {
    const { id, userID, courseName, name, date, startTime, endTime } = exam;
    const googleAPIInfo = await getGoogleAPIInfo(userID);
    if (!googleAPIInfo) {
      return;
    }
    const { refreshToken, examsCalendarID, timeZone } = googleAPIInfo;
    calendar = calendar || (await getAuthenticatedCalendar(refreshToken));
    let event;
    if (startTime && endTime) {
      event = {
        summary: `${courseName} ${name}`,
        start: {
          dateTime: `${format(date, "yyyy-MM-dd")}T${startTime}`,
          timeZone,
        },
        end: {
          dateTime: `${format(date, "yyyy-MM-dd")}T${endTime}`,
          timeZone,
        },
      };
    } else {
      event = {
        summary: `${courseName} ${name}`,
        start: {
          date: `${format(date, "yyyy-MM-dd")}`,
        },
        end: {
          date: `${format(date, "yyyy-MM-dd")}`,
        },
      };
    }
    const res = await calendar.events.insert({
      calendarId: examsCalendarID,
      requestBody: event,
    });
    await pool.query(
      "UPDATE exams SET google_calendar_event_id = $1 WHERE id = $2",
      [res.data.id, id]
    );
  } catch (err) {
    console.error(err);
  }
}

async function updateExam(exam) {
  try {
    const {
      userID,
      courseName,
      name,
      date,
      startTime,
      endTime,
      googleCalendarEventID,
    } = exam;
    if (!googleCalendarEventID) {
      return;
    }
    const googleAPIInfo = await getGoogleAPIInfo(userID);
    if (!googleAPIInfo) {
      return;
    }
    const { refreshToken, examsCalendarID, timeZone } = googleAPIInfo;
    const calendar = await getAuthenticatedCalendar(refreshToken);
    let event;
    if (startTime && endTime) {
      event = {
        summary: `${courseName} ${name}`,
        start: {
          dateTime: `${format(date, "yyyy-MM-dd")}T${startTime}`,
          timeZone,
        },
        end: {
          dateTime: `${format(date, "yyyy-MM-dd")}T${endTime}`,
          timeZone,
        },
      };
    } else {
      event = {
        summary: `${courseName} ${name}`,
        start: {
          date: `${format(date, "yyyy-MM-dd")}`,
        },
        end: {
          date: `${format(date, "yyyy-MM-dd")}`,
        },
      };
    }
    await calendar.events.update({
      calendarId: examsCalendarID,
      eventId: googleCalendarEventID,
      requestBody: event,
    });
  } catch (err) {
    console.error(err);
  }
}

async function removeExam(exam, calendar) {
  try {
    const { userID, googleCalendarEventID } = exam;
    if (!googleCalendarEventID) {
      return;
    }
    const googleAPIInfo = await getGoogleAPIInfo(userID);
    if (!googleAPIInfo) {
      return;
    }
    const { refreshToken, examsCalendarID } = googleAPIInfo;
    calendar = calendar || (await getAuthenticatedCalendar(refreshToken));
    await calendar.events.delete({
      calendarId: examsCalendarID,
      eventId: googleCalendarEventID,
    });
  } catch (err) {
    console.error(err);
  }
}

async function addAll(userID) {
  try {
    const googleAPIInfo = await getGoogleAPIInfo(userID);
    if (!googleAPIInfo) {
      return;
    }
    const { refreshToken } = googleAPIInfo;
    const calendar = await getAuthenticatedCalendar(refreshToken);
    if (!calendar) {
      return;
    }
    const courses = await db.findCoursesForUser(userID);
    if (!courses) {
      return;
    }
    for (const course of courses) {
      await addCourse(course, calendar);
    }
    const assignments = await db.findAssignmentsForUser(userID);
    for (const assignment of assignments) {
      await addAssignment(assignment, calendar);
    }
    const exams = await db.findExamsForUser(userID);
    for (const exam of exams) {
      await addExam(exam, calendar);
    }
  } catch (err) {
    console.error(err);
  }
}

module.exports = {
  saveRefreshToken,
  getGoogleAPIInfo,
  deleteGoogleAPIInfo,
  createCalendars,
  deleteCalendars,
  addCourse,
  updateCourse,
  removeCourse,
  addAssignment,
  updateAssignment,
  removeAssignment,
  addExam,
  updateExam,
  removeExam,
  addAll,
};
