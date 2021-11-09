const schedule = require('node-schedule');
const minutesToAdd = .5;

const scheduleDate = () => {
    const futureDate = new Date(new Date().getTime() + minutesToAdd * 60000);
    schedule.scheduleJob(futureDate, function () {
        console.log('afer .5 minuits');
    });
}
scheduleDate();
