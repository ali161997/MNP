const express = require('express')
const router = express.Router();
const auth = require('../controllers/auth')
const requestController = require('../controllers/requests');

//operator is NOT a recipient or donor so he can view the accepted requests
router.get('/accepted', auth, requestController.allAccepted)

// operator is a recipient or donor so he can view the request
router.get('/allPending', auth, requestController.allPending)

//make porting request
router.post('/porting', auth, requestController.porting)

//find request by phone
router.get('/:phone', auth, requestController.getRequestByPhone)

//delete request by phone
router.delete('/:phone', auth, requestController.deleteRequestByPhone)


//Only the donor can accept or reject the porting request
router.put('/:phone', auth, requestController.updateRequestByPhone)


//operator agent should be able to get the current phone number status
router.get('/status/:phone', auth, requestController.getCurrentPhoneStatus)


module.exports = router;