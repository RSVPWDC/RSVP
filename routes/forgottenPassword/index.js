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

        let query = "UPDATE users SET forgotten_password_code = (SELECT RAND()*(1000000-100000)+100000) WHERE user_id=?";
        connection.query(query, [req.session.user_id], function(error, rows, fields){
            connection.release();
            if(error) {
                console.log(error);
                res.sendStatus(500);
                return;
            }
            res.sendStatus(200);
        })
    })

});

router.post('/newPassword', function(req, res, next){

    //verifies the code
})

module.exports = router;