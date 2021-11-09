const db = require('../models');
const schedule = require('node-schedule');
const State = require('../model/request_state')

const { StatusCodes, } = require('http-status-codes')



const updateTimeOut = async (phone) => {
    try {
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
    } catch (error) {
        console.error(error.message)
    }

}

const scheduleTimeOut = (phone) => {
    const minutesToAdd = 2;
    const futureDate = new Date(new Date().getTime() + minutesToAdd * 60000);
    schedule.scheduleJob(futureDate, async () => {
        const request = await db.requests.findOne({
            where: { phone },
        });

        //handle state of request a
        switch (request.state) {
            case State.Pending:
                updateTimeOut(phone)
                break;
            case State.Canceled:
                console.log('Cannot Update ,timeOut!');
                break;
            case State.Rejected:
                console.log('Cannot Update again!');
                break;
            case State.Accepted:
                console.log('Cannot Update again!');
                break;
        }
    })
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
        scheduleTimeOut(submittedRequested.phone);
        res.status(StatusCodes.CREATED).send(submittedRequested);

    } catch (error) {
        console.error(error);
        res.status(StatusCodes.BAD_REQUEST).send(`invalid request: ${error.message}`)
    }
}


exports.getRequestByPhone = async (req, res) => {
    try {
        const request = await db.requests.findOne({ where: { phone: req.params.phone } });
        if (!request) {
            res.status(StatusCodes.NOT_FOUND).send(`Not found!`);
            return;
        }
        res.status(StatusCodes.OK).send(request);
    } catch (error) {
        console.error(error);
        res.status(StatusCodes.BAD_REQUEST).send(`${error.message}`)
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
        res.status(StatusCodes.OK).send('success!')
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).send(error.message)
    }
}

exports.updateRequestByPhone = async (req, res) => {
    try {
        const request = await db.requests.findOne({
            where: {
                phone: req.params.phone
            },
        })

        if (request
            && req.headers.organization == request.donor
            && request.state == State.Pending) {
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
            res.status(StatusCodes.BAD_REQUEST).send('cannot update')
        }
        else {
            res.status(StatusCodes.BAD_REQUEST).send(e.message)
        }
    } catch (e) {
        res.status(StatusCodes.BAD_REQUEST).send(e.message)
    }
}