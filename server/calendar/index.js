const { google } = require("googleapis");
const { OAuth2 } = google.auth;
const { nextDay, format } = require("date-fns");
const convertKeysToCamelCase = require("../utils/convertKeysToCamelCase");
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

async function getAuthClient(userID) {
  const oAuth2Client = new OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  const res = await pool.query(
    "SELECT refresh_token FROM google_api_info WHERE user_id = $1",
    [userID]
  );
  const { refreshToken } = convertKeysToCamelCase(res.rows[0]);
  if (!refreshToken) {
    return;
  }
  oAuth2Client.setCredentials({ refresh_token: refreshToken });
}

async function getAuthenticatedCalendar(userID) {
  const oAuth2Client = await getAuthClient(userID);
  if (!oAuth2Client) {
    return;
  }
  return google.calendar({ version: "v3", auth: oAuth2Client });
}

async function getAuthenticatedTasks(userID) {
  const oAuth2Client = await getAuthClient(userID);
  if (!oAuth2Client) {
    return;
  }
  return google.tasks({ version: "v1", auth: oAuth2Client });
}

async function createCalendars(userID) {
  try {
    const calendar = await getAuthenticatedCalendar(userID);
    if (!calendar) {
      return;
    }
    let res = await calendar.settings.get({ setting: "timezone" });
    const timeZone = res.data.value;
    res = await calendar.calendars.insert({
      requestBody: {
        summary: "Courses",
        timeZone,
      },
    });
    const coursesCalendarID = res.data.id;
    await pool.query(
      "UPDATE google_api_info SET courses_calendar_id = $1, time_zone = $2 WHERE user_id = $3",
      [coursesCalendarID, timeZone, userID]
    );
    res = await calendar.calendars.insert({
      requestBody: {
        summary: "Exams",
        timeZone,
      },
    });
    const examsCalendarID = res.data.id;
    await pool.query(
      "UPDATE google_api_info SET exams_calendar_id = $1, time_zone = $2 WHERE user_id = $3",
      [examsCalendarID, timeZone, userID]
    );
  } catch (err) {
    console.error(err);
  }
}

async function createTaskList(userID) {
  const tasks = await getAuthenticatedTasks(userID);
  if (!tasks) {
    return;
  }
  const res = tasks.tasklists.insert({ requestBody: { title: "Assignments" } });
  await pool.query(
    "UPDATE google_api_info SET assignments_task_list_id = $1 WHERE user_id = $2",
    [res.data.id, userID]
  );
}

async function addCourse(course) {
  try {
    const { userID, name, startDate, endDate, times, additionalSections } =
      course;
    let res = await pool.query(
      "SELECT courses_calendar_id, time_zone FROM google_api_info WHERE user_id = $1",
      [userID]
    );
    const { coursesCalendarID, timeZone } = convertKeysToCamelCase(res.rows[0]);
    const calendar = await getAuthenticatedCalendar(userID);
    if (!calendar || !coursesCalendarID) {
      return;
    }
    const startDateDay = format(startDate, "EEEE");
    if (times) {
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
        res = await calendar.events.insert({
          calendarId: coursesCalendarID,
          requestBody: event,
        });
        await pool.query(
          "UPDATE course_times SET google_calendar_event_id = $1 WHERE id = $2",
          [res.data.id, day.id]
        );
      }
    }
    if (additionalSections) {
      for (const additionalSection of additionalSections) {
        if (additionalSection.times) {
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
            res = await calendar.events.insert({
              calendarId: coursesCalendarID,
              requestBody: event,
            });
            await pool.query(
              "UPDATE additional_section_times SET google_calendar_event_id = $1 WHERE id = $2",
              [res.data.id, day.id]
            );
          }
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
}

async function updateCourse(oldCourse, newCourse) {
  await removeCourse(oldCourse);
  await addCourse(newCourse);
}

async function removeCourse(course) {
  try {
    const { userID, times, additionalSections } = course;
    let res = await pool.query(
      "SELECT courses_calendar_id FROM google_api_info WHERE user_id = $1",
      [userID]
    );
    const { coursesCalendarID } = convertKeysToCamelCase(res.rows[0]);
    const calendar = await getAuthenticatedCalendar(userID);
    if (!calendar || !coursesCalendarID) {
      return;
    }
    if (times) {
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
    }
    if (additionalSections) {
      for (const additionalSection of additionalSections) {
        if (additionalSection.times) {
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
      }
    }
  } catch (err) {
    console.error(err);
  }
}

async function addExam(exam) {
  try {
    const { id, userID, courseName, name, date, startTime, endTime } = exam;
    let res = await pool.query(
      "SELECT exams_calendar_id, time_zone FROM google_api_info WHERE user_id = $1",
      [userID]
    );
    const { examsCalendarID, timeZone } = convertKeysToCamelCase(res.rows[0]);
    const calendar = await getAuthenticatedCalendar(userID);
    if (!calendar || !examsCalendarID) {
      return;
    }
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
    res = await calendar.events.insert({
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
    let res = await pool.query(
      "SELECT exams_calendar_id, time_zone FROM google_api_info WHERE user_id = $1",
      [userID]
    );
    const { examsCalendarID, timeZone } = convertKeysToCamelCase(res.rows[0]);
    const calendar = await getAuthenticatedCalendar(userID);
    if (!calendar || !examsCalendarID) {
      return;
    }
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

async function removeExam(exam) {
  try {
    const { userID, googleCalendarEventID } = exam;
    if (!googleCalendarEventID) {
      return;
    }
    let res = await pool.query(
      "SELECT exams_calendar_id FROM google_api_info WHERE user_id = $1",
      [userID]
    );
    const { examsCalendarID } = convertKeysToCamelCase(res.rows[0]);
    const calendar = await getAuthenticatedCalendar(userID);
    if (!calendar || !examsCalendarID) {
      return;
    }
    await calendar.events.delete({
      calendarId: examsCalendarID,
      eventId: googleCalendarEventID,
    });
  } catch (err) {
    console.error(err);
  }
}

module.exports = {
  createCalendars,
  createTaskList,
  addCourse,
  updateCourse,
  removeCourse,
  addExam,
  updateExam,
  removeExam,
};
