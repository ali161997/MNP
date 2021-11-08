const express = require('express')
const router = express.Router();
const db = require('../models');
const auth = require('../middleware/auth')

const State = {
    Pending: "Pending",
    Accepted: "Accepted",
    Rejected: "Rejected",
    Canceled: "Canceled"
};

//get requests
router.get('/all', auth, (req, res) => {
    db.requests.findAll().then(requests => {
        res.send(requests);
    })
    console.log('in all');
})

//make porting request
router.post('/porting', auth, async (req, res) => {
    try {
        const submittedRequested = await db.requests.create({
            organization: req.headers.organization,
            phone: req.body.phone,
            state: State.Pending,
            donor: req.body.donor,
        });
        res.status(200).send(submittedRequested);

    } catch (error) {
        console.log(error);
        res.status(400).send(`invalid request: ${error.message}`)
    }
})

//find request by phone
router.get('/:phone', auth, async (req, res) => {
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
})


//delete request by phone
router.delete('/:phone', auth, async (req, res) => {
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
})


//update request from donor only
router.put('/:phone', auth, async (req, res) => {
    const request = await db.requests.findOne({
        where: {
            phone: req.params.phone
        },
    })

    if (req.headers.organization == request.donor)
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


})

module.exports = router;