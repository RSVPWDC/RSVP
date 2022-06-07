var express = require('express');
var router = express.Router();
const moment = require('moment');
const Uuid = require('uuid');

//will set up blanks for harrison to fill out
//get friends
router.get('/', function(req,res,next){
  let user = req.session.user_name;
  let requester = req.body.requester;
  let requestee = req.body.requestee;
  req.pool.getConnection(function(error, connection){
    if(error){
      console.log(error);
      res.sendStatus(500);
      return;
    }

    let query = `select
    f.requester as user_name,
    u.first_name,
    u.last_name
   from
    friends as f
   left join users as u on u.user_name=f.requester
   where f.requestee=?
   and
      f.friendship_start_date is not null
   union
   select
    f.requestee as user_name,
    u.first_name,
    u.last_name
   from
    friends as f
   left join users as u on u.user_name=f.requestee
   where requester=?
   and
   f.friendship_start_date is not null;`;
    connection.query(query, [user,user], function(error, rows, fields) {
      connection.release();
      if (error) {
        console.log(error);
        res.sendStatus(500);
        return;
      }
      res.send(rows);
    });
  });
});
//get requests
router.get('/requests', function(req,res,next){
  let user = req.session.user_name;
  let requester = req.body.requester;
  let requestee = req.body.requestee;
  req.pool.getConnection(function(error, connection){
    if(error){
      console.log(error);
      res.sendStatus(500);
      return;
    }

    let query = `select
    f.requester as user_name,
    u.first_name,
    u.last_name
   from
    friends as f
   left join users as u on u.user_name=f.requester
   where f.requestee=?
   and
      f.friendship_start_date is null
   union
   select
    f.requestee as user_name,
    u.first_name,
    u.last_name
   from
    friends as f
   left join users as u on u.user_name=f.requestee
   where requester=?
   and
   f.friendship_start_date is null;`;
    connection.query(query, [user,user], function(error, rows, fields) {
      connection.release();
      if (error) {
        console.log(error);
        res.sendStatus(500);
        return;
      }
      res.send(rows);
    });
  });
});

router.post('/acceptRequest', function(req,res,next){
  if (!('requester' in req.body) || !('requestee' in req.body)){
    res.sendStatus(400);
    return;
  }else{
    let user = req.session.user_name;
    let requester = req.body.requester;
    let requestee = req.body.requestee;
    let friendshipStartDate = moment(req.body.date + ' ' + req.body.friendship_start_date,"YYYY-MM-DD HH:mm");
    const ID = Uuid.v4();
    req.pool.getConnection(function(error, connection){
      if(error){
        console.log(error);
        res.sendStatus(500);
        return;
      }

      let query = "update friends set friendship_start_date=? where requester=? and requestee=? or requestee=? and reqester=?";
      connection.query(query, [friendshipStartDate.format(),requester,requestee,requestee,requester], function(error, rows, fields) {
        connection.release();
        if (error) {
          console.log(error);
          res.sendStatus(500);
          return;
        }
        res.sendStatus(200);
      });
    });
  }
});

router.post('/declineRequest', function(req,res,next){
  if (!('requester' in req.body) || !('requestee' in req.body)){
    res.sendStatus(400);
    return;
  }else{
    let user = req.session.user_name;
    let requester = req.body.requester;
    let requestee = req.body.requestee;
    req.pool.getConnection(function(error, connection){
      if(error){
        console.log(error);
        res.sendStatus(500);
        return;
      }
      let unavailabilityID = req.body.id;
      let query = "delete from friends where requester=? and resquestee=?";
      connection.query(query, [requester, requestee], function(error, rows, fields) {
        connection.release();
        if (error) {
          console.log(error);
          res.sendStatus(500);
          return;
        }
        res.sendStatus(200);
      });
    });
  }
});

router.post('/sendRequest', function(req,res,next){
  if (!('requester' in req.body) || !('requestee' in req.body)){
    res.sendStatus(400);
    return;
  }else{
    let user = req.session.user_name;
    let requester = req.body.requester;
    let requestee = req.body.requestee;
    let requestDate = moment(req.body.date + ' ' + req.body.request_date,"YYYY-MM-DD HH:mm");
    const unavailabilityID = Uuid.v4();
    req.pool.getConnection(function(error, connection){
      if(error){
        console.log(error);
        res.sendStatus(500);
        return;
      }

      let query = "insert into friends (requester,requestee,request_date,friendship_start_date) values(?,?,?,?)";
      connection.query(query, [requester,requestee,requestDate.format(),null], function(error, rows, fields) {
        connection.release();
        if (error) {
          console.log(error);
          res.sendStatus(500);
          return;
        }
        res.sendStatus(200);
      });
    });
  }
});

router.post('/removeFriend', function(req,res,next){
  if (!('requester' in req.body) || !('requestee' in req.body)){
    res.sendStatus(400);
    return;
  }else{
    let user = req.session.user_name;
    let requester = req.body.requester;
    let requestee = req.body.requestee;
    req.pool.getConnection(function(error, connection){
      if(error){
        console.log(error);
        res.sendStatus(500);
        return;
      }
      let unavailabilityID = req.body.id;
      let query = "delete from friends where requester=? and resquestee=?";
      connection.query(query, [requester,requestee], function(error, rows, fields) {
        connection.release();
        if (error) {
          console.log(error);
          res.sendStatus(500);
          return;
        }
        res.sendStatus(200);
      });
    });
  }
});

  router.get('/search', function(req,res,next){
    if (req.query.searchTerm == undefined){
      res.sendStatus(400);
    }else{
      let searchTerm = '%' + req.query.searchTerm + '%';
      let user = req.session.user_name
      req.pool.getConnection(function(error, connection){
        if(error){
          console.log(error);
          res.sendStatus(500);
          return;
        }

        let query = `SELECT user_name, first_name, last_name FROM users
                     where
                     (user_name LIKE ?
                     OR first_name like ?
                     OR last_name like ?
                     OR concat(first_name, ' ', last_name) like ?)
                     AND
                     user_name NOT IN (select requester from friends where requestee = ? UNION select requestee from friends where requester=?)
                     order by first_name, last_name, user_name;
                    `;
        connection.query(query, [searchTerm,searchTerm,searchTerm,searchTerm,user,user], function(error, rows, fields) {
          connection.release();
          if (error) {
            console.log(error);
            res.sendStatus(500);
            return;
          }
          res.json(rows)
        });
      });
    }
  });

module.exports = router;