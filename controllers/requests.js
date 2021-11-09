const db = require('../models');
const schedule = require('node-schedule');
const State = require('../model/request_state')

const scheduleDate = (phone) => {
    const minutesToAdd = .3;
    const futureDate = new Date(new Date().getTime() + minutesToAdd * 60000);
    schedule.scheduleJob(futureDate, () => {
        db.requests.findOne({
            where: {
                phone
            },
        }).then(async (request) => {
            if (request.state == State.Pending) {
                await db.requests.update(
                    {
                        state: State.Canceled
                    },
                    {
                        where: {
                            phone
                        }
                    }
                )

            }

        })
    });
}


exports.getAll = (req, res) => {
    db.requests.findAll().then(requests => {
        res.send(requests);
    })
    console.log('in all');
};

exports.porting = async (req, res) => {
    try {
        const submittedRequested = await db.requests.create({
            organization: req.headers.organization,
            phone: req.body.phone,
            state: State.Pending,
            donor: req.body.donor,
        });
        scheduleDate(submittedRequested.phone);
        res.status(200).send(submittedRequested);

    } catch (error) {
        console.log(error);
        res.status(400).send(`invalid request: ${error.message}`)
    }
}


exports.getRequestByPhone = async (req, res) => {
    try {
        const request = await db.requests.findOne({ where: { phone: req.params.phone } });
        if (request === null) {
            res.status(400).send(`Not found!`);
            return;
        }
        res.status(200).send(request);
    } catch (error) {
        console.log(error);
        res.status(400).send(`Not found! ${error.message}`)
    }
}

exports.deleteRequestByPhone = async (req, res) => {
    console.log(req.params.phone)
    try {
        await db.requests.destroy({
            where: {
                phone: req.params.phone
            }

        })
        res.status(200).send('success!')
    } catch (error) {
        res.status(404).send('NOT FOUND')
    }
}

exports.updateRequestByPhone = async (req, res) => {
    const request = await db.requests.findOne({
        where: {
            phone: req.params.phone
        },
    })

    if (req.headers.organization == request.donor && request.state == State.Pending)
        try {
            await db.requests.update(
                {
                    state: req.body.state
                },
                {
                    where: {
                        phone: req.params.phone
                    }
                }
            )
            res.status(200).send('Updated!')
        } catch (e) {
            res.status(404).send('cannot update state')
        }
    else {
        res.status(400).send('not valid to update')
    }


}