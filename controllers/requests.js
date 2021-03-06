const db = require('../models');
const schedule = require('node-schedule');
const State = require('../model/request_state')
const { Op } = require('sequelize')
const { StatusCodes } = require('http-status-codes');

//background task that cancels all pending requests that exceed X 
const scheduleTimeOut = async (phone) => {
    const minutesToAdd = 1;
    const futureDate = new Date(new Date().getTime() + minutesToAdd * 60000);
    schedule.scheduleJob(futureDate, async () => {
        const request = await db.requests.findOne({
            where: { phone },
        });

        //handle state of request a
        switch (request.state) {
            case State.Pending:
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

const ifExistPendingRequestForPhone = async (phone) => {
    return await db.requests.findOne(
        {
            where:
            {
                phone, state: State.Pending
            }
        });
}

exports.allAccepted = async (req, res) => {
    try {
        const requests = await db.requests.findAll({
            where: {
                state: State.Accepted
            }
        });
        if (!requests)
            res.status(StatusCodes.NOT_FOUND).send()
        else
            res.status(StatusCodes.OK).send(requests);
    } catch (e) {
        console.log(e.message)
    }
};

exports.allPending = async (req, res) => {
    try {
        const requests = await db.requests.findAll({
            where: {
                state: State.Pending,
                organization: req.headers.organization
            }

        });
        if (!requests)
            res.status(StatusCodes.NOT_FOUND).send()
        else
            res.status(StatusCodes.OK).send(requests);
    } catch (e) {
        console.log(e.message)
    }
}

exports.porting = async (req, res) => {
    try {

        if (req.body.phone.length !== 11) {
            res.status(StatusCodes.BAD_REQUEST).send('invalid request')
            return;

        }
        console.log('after statement');
        const requestPending = await ifExistPendingRequestForPhone(req.body.phone)
        if (!requestPending) {
            const submittedRequested = await db.requests.create({
                organization: req.headers.organization,
                phone: req.body.phone,
                state: State.Pending,
                donor: req.body.donor,
            });
            await scheduleTimeOut(submittedRequested.phone);
            res.status(StatusCodes.CREATED).send(submittedRequested);
        }
        else
            res.status(StatusCodes.FORBIDDEN).send('request pending exist');

    } catch (error) {
        console.error(error);
        res.status(StatusCodes.BAD_REQUEST).send(`invalid request: ${error.message}`)
    }
}


exports.getRequestByPhone = async (req, res) => {
    try {
        const request = await db.requests.findOne(
            {
                where:
                {
                    [Op.or]: [{ donor: req.body.donor }, { organization: req.headers.organization }],
                    phone: req.params.phone,
                    state: State.Pending
                }
            });
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
    try {
        await db.requests.destroy({
            where: {
                phone: req.params.phone,
                organization: req.headers.organization
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
                        phone: request.phone
                    }
                }
            )
            res.status(StatusCodes.OK).send('success!')
        }
        else {
            res.status(StatusCodes.BAD_REQUEST).send('not valid to update')
        }
    } catch (e) {
        res.status(StatusCodes.BAD_REQUEST).send(e.message)
    }
}

exports.getCurrentPhoneStatus = async (req, res) => {
    try {
        const request = await db.requests.findOne(
            {
                where:
                {
                    state: State.Accepted,
                    phone: req.params.phone,
                }
            });
        if (!request) {
            res.status(StatusCodes.NOT_FOUND).send(`Not found!`);
            return;
        }
        res.status(StatusCodes.OK).send({
            state: "ported",
            holder: request.organization
        });
    } catch (error) {
        console.error(error);
        res.status(StatusCodes.BAD_REQUEST).send(`${error.message}`)
    }
}