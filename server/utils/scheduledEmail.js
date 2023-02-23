const CronJob = require("cron").CronJob;
const connectDatabase = require("../utils/connectDatabase");
const sendMail = require("../utils/sendMail");

const scheduledEmail = () => {
  const job = new CronJob(
    // every midnight "0 0 0 * * *"
    // every 10 seconds "*/10 * * * * *"
    "*/10 * * * * *",
    async () => {
      // Connect to "visitors" collection
      const { client, dbCollection: visitorCollection } = await connectDatabase(
        "visitors"
      );

      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1; // +1 to get month instead of month index
      const day = today.getDate();
      // getHours(), getMinutes(), getSeconds()

      // These will add leading 0 to months and day if necessary
      // if the returned day is 2, it will make it 02
      // if the returned month is 6, it will make it 06
      const paddedMonth = month.toString().padStart(2, 0);
      const paddedDay = day.toString().padStart(2, 0);

      // Here T represents time, Z represents Zulu time which is UTC.
      const todayStartString = `${year}-${paddedMonth}-${paddedDay}T00:00:00.000Z`;
      const todayEndString = `${year}-${paddedMonth}-${paddedDay}T23:59:59.999Z`;

      const todayStartTimeStamp = new Date(todayStartString).getTime();
      const todayEndTimeStamp = new Date(todayEndString).getTime();

      const allVisitors = await visitorCollection
        .find({
          visitingDates: {
            $elemMatch: {
              $gt: todayStartTimeStamp,
              $lt: todayEndTimeStamp,
            },
          },
        })
        .toArray();

      client.close();

      const emailTitle = `Today's Visitors to ${process.env.PORTFOLIO_WEBSITE}`;

      if (!allVisitors || allVisitors.length === 0) {
        const emailBody = `
          <html>
            <head>
              <title>Visitors Today</title>
            </head>
            <body>
              <h2>Details:</h2>
              <h3>No people visited your website today!</h3>
            </body>
          </html>
        `;
        try {
          await sendMail(emailTitle, emailBody);
        } catch (e) {
          console.error(e.message || "Problem sending daily email!");
        }

        return;
      }

      const visitorCount = allVisitors.length;

      const visitorList = allVisitors.map(
        (visitor) => `
        <li>
          <p><strong style="color: blue;">IP:</strong> ${visitor.IP}</p>
          <p><strong style="color: blue;">Times Visited:</strong> ${
            visitor.visitInstance
          }</p>
          <ol>
            ${visitor.visitingDates
              .map((timeStamp) => `<li>${new Date(timeStamp)}</li>`)
              .join("")}
          </ol>
          <p><strong style="color: blue;">Country:</strong> ${
            visitor.country
          }</p>
          <p><strong style="color: blue;">City:</strong> ${visitor.city}</p>
          <p><strong style="color: blue;">Latitude:</strong> ${visitor.lat}</p>
          <p><strong style="color: blue;">Longitude:</strong> ${visitor.lon}</p>
          <p><strong style="color: blue;">Zip Code:</strong> ${visitor.zip}</p>
          <p><strong style="color: blue;">ISP:</strong> ${visitor.isp}</p>
        </li><br>`
      );

      // This can be added to email body to see json data in formatted form
      // <pre>${JSON.stringify(allVisitors, null, "\t")}</pre>
      const emailBody = `
      <html>
        <head>
          <title>Visitors Today</title>
        </head>
        <body>
          <h2>Details:</h2>
          <h3><strong style="color: red;">${visitorCount}</strong> people visited your website today!</h3>
          <ol>${visitorList.join("")}</ol>
        </body>
      </html>
      `;

      try {
        await sendMail(emailTitle, emailBody);
      } catch (e) {
        console.error(e.message || "Problem sending daily email!");
      }

      console.log("You will see this message every 10 seconds");
    },
    null,
    true,
    "America/New_York"
  );

  return job;
};

module.exports = scheduledEmail;
