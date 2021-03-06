'use strict';
var bcrypt = require('bcrypt');
var utils = require('../../utils.js');

/**
 * Login action
 */

module.exports = function(req, res) {
  
  console.log("Register");
  
  var scope = require('../../scope')(waterlock.Auth, waterlock.engine);
  var params = req.params.all();

  if (typeof params[scope.type] === 'undefined') {
    // console .log('undefined shit');
    waterlock.logger.debug('phone is not defined');
    waterlock.cycle.registerFailure(req, res, null, {
      error: 'Invalid ' + scope.type
    });
  } else {
    // var pass = params.smsCode;
    var smsCode = params.smsCode = Math.floor(Math.random() * 9000) + 1000; // generate a new, random smsCode
    // console.log('reg: things defined inside else');
    scope.registerUserAuthObject(params, req, function(err, user) {
      if (err) {
        // console.log('error registering users');
        res.serverError(err);
      }
      if (user) {
        // console.log('reg: user object from auth object');
        user.phone = user.auth.phone; //save it to the user model (temp)
        
        //send the code via sms if needed
        if (params.sendSms) {
          utils.sendSmsCode(user.auth.phone, smsCode);
        }
        
        waterlock.cycle.registerSuccess(req, res, user);
        //NOTE: not sure we need to bother with bcrypt here?
/*
        if (bcrypt.compareSync(pass, user.auth.smsCode)) {
        // if (pass == user.auth.smsCode) {
          console.log('reg: correct smsCode');
          waterlock.cycle.registerSuccess(req, res, user);
        } else {
          //console.log('reg: incorrect smsCode');
          waterlock.cycle.registerFailure(req, res, user, {
            error: 'Invalid ' + scope.type + ' or smsCode'
          });
        }
*/
      } else {
        //console.log('user empty');
        waterlock.logger.debug('phone is already in use');
        waterlock.cycle.registerFailure(req, res, null, {
          error: scope.type + ' is already in use 1'
        });
      }
    });

  }
};
