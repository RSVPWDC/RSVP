var express = require('/express');
var router = express.router();

//This function generates a 6 digit code, stores it in the database in the user's information and sends an email to the user containing the code
router.get('/code', function(req, res, next){

    req.pool.getConnection(function (error, connection) {
        if(error) {
            console.log(error);
            res.sendStatus(500);
            return;
        }

        let query = "INSERT INTO users (forgotten_password_code)
    })

});

module.exports = router;