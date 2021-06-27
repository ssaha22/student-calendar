const { google } = require("googleapis");
const { OAuth2 } = google.auth;
const { nextDay, parseISO, format } = require("date-fns");
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

async function getAuthenticatedCalendar(userID) {
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
  return google.calendar({ version: "v3", auth: oAuth2Client });
}

async function createCalendar(userID) {
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
    const id = res.data.id;
    await pool.query(
      "UPDATE google_api_info SET calendar_id = $1, time_zone = $2 WHERE user_id = $3",
      [id, timeZone, userID]
    );
  } catch (err) {
    console.error(err);
  }
}

async function addCourse(course) {
  try {
    const { userID, name, startDate, endDate, times, additionalSections } =
      course;
    let res = await pool.query(
      "SELECT calendar_id, time_zone FROM google_api_info WHERE user_id = $1",
      [userID]
    );
    const { calendarID, timeZone } = convertKeysToCamelCase(res.rows[0]);
    if (!calendarID) {
      return;
    }
    const calendar = await getAuthenticatedCalendar(userID);
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
          calendarId: calendarID,
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
              calendarId: calendarID,
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
      "SELECT calendar_id FROM google_api_info WHERE user_id = $1",
      [userID]
    );
    const { calendarID } = convertKeysToCamelCase(res.rows[0]);
    if (!calendarID) {
      return;
    }
    const calendar = await getAuthenticatedCalendar(userID);
    if (times) {
      for (const day of times) {
        await calendar.events.delete({
          calendarId: calendarID,
          eventId: day.googleCalendarEventID,
        });
      }
    }
    if (additionalSections) {
      for (const additionalSection of additionalSections) {
        if (additionalSection.times) {
          for (const day of additionalSection.times) {
            await calendar.events.delete({
              calendarId: calendarID,
              eventId: day.googleCalendarEventID,
            });
          }
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
}

module.exports = {
  createCalendar,
  addCourse,
  updateCourse,
  removeCourse,
};
