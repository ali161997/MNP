const express = require('express')
const router = express.Router();
const auth = require('../controllers/auth')
const requestController = require('../controllers/requests');

//get requests
router.get('/all', auth, requestController.getAll)

//make porting request
router.post('/porting', auth, requestController.porting)

//find request by phone
router.get('/:phone', auth, requestController.getRequestByPhone)


//delete request by phone
router.delete('/:phone', auth, requestController.deleteRequestByPhone)


//update request from donor only
router.put('/:phone', auth, requestController.updateRequestByPhone)

module.exports = router;