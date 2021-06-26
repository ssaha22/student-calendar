const { google } = require("googleapis");
const { OAuth2 } = google.auth;
const { Pool } = require("pg");
const pool = new Pool();

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
  const calendar = await getAuthenticatedCalendar(userID);
  try {
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
