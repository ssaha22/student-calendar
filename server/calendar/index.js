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

const refreshToken =
  "1//04a8DaqcbZ3RLCgYIARAAGAQSNwF-L9IrvaF4E4Im03c_-4dBTxzDSXYzsH3Eo7LY_xKHVHVvXyvgECaa6yd59Ca0cKchHa97xnI";

const exampleCourse = {
  userID: 1,
  name: "CPSC 110",
  section: "202",
  startDate: "2021-06-29",
  endDate: "2021-07-28",
  times: [
    {
      day: "Monday",
      startTime: "13:00:00",
      endTime: "15:00:00",
    },
    {
      day: "Wednesday",
      startTime: "14:00:00",
      endTime: "15:00:00",
    },
    {
      day: "Friday",
      startTime: "10:00:00",
      endTime: "12:00:00",
    },
  ],
  links: [
    {
      name: "Canvas",
      url: "canvas.com",
    },
    {
      name: "Piazza",
      url: "piazza.com",
    },
  ],
  additionalSections: [
    {
      type: "Lab",
      section: "L2C",
      times: [
        {
          day: "Tuesday",
          startTime: "13:00:00",
          endTime: "15:00:00",
        },
      ],
    },
    {
      type: "Tutorial",
      section: "T2A",
      times: [
        {
          day: "Thursday",
          startTime: "09:00:00",
          endTime: "12:00:00",
        },
      ],
    },
  ],
};

async function getAuthenticatedCalendar(userID) {
  const oAuth2Client = new OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  const res = await pool.query(
    "SELECT refresh_token FROM google_api_info WHERE user_id = $1",
    [userID]
  );
  oAuth2Client.setCredentials({ refresh_token: res.rows[0].refresh_token });
  return google.calendar({ version: "v3", auth: oAuth2Client });
}

async function createCalendar(userID) {
  try {
    const calendar = await getAuthenticatedCalendar(userID);
    let res = await calendar.settings.get({ setting: "timezone" });
    const timeZone = res.data.value;
    res = await calendar.calendars.insert({
      requestBody: {
        summary: "School Scheduler",
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

async function addCourse(userID, course) {
  try {
    const { name, startDate, endDate, times, additionalSections } = course;
    const res = await pool.query(
      "SELECT calendar_id, time_zone FROM google_api_info WHERE user_id = $1",
      [userID]
    );
    const { calendarID, timeZone } = convertKeysToCamelCase(res.rows[0]);
    if (!calendarID) {
      return;
    }
    const calendar = await getAuthenticatedCalendar(userID);
    const startDateParsed = parseISO(startDate);
    const startDateDay = format(startDateParsed, "EEEE");
    if (times) {
      for (const day of times) {
        const newStartDate =
          startDateDay === day.day
            ? startDate
            : format(
                nextDay(startDateParsed, daysOfWeek.indexOf(day.day)),
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
            UNTIL=${endDate.replaceAll("-", "")}T235959Z`.replace(/ /g, ""),
          ],
        };
        await calendar.events.insert({
          calendarId: calendarID,
          requestBody: event,
        });
      }
    }
    if (additionalSections) {
      for (const additionalSection of additionalSections) {
        if (additionalSection.times) {
          for (const day of additionalSection.times) {
            const newStartDate =
              startDateDay === day.day
                ? startDate
                : format(
                    nextDay(startDateParsed, daysOfWeek.indexOf(day.day)),
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
                UNTIL=${endDate.replaceAll("-", "")}T235959Z`.replace(/ /g, ""),
              ],
            };
            await calendar.events.insert({
              calendarId: calendarID,
              requestBody: event,
            });
          }
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
}

addCourse(1, exampleCourse);
