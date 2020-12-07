module.exports = {
  OTP_MAX_NUMBER: 9999,
  OTP_MIN_NUMBER: 1000,
  DEFAULT_QUERY: {
    is_deleted: false,
  },
  USER_DEFAULT_QUERY: function (value) {
    return {
      userstate: value || 'registered',
    };
  },
  EMPLOYEE_STATUS: {
    applied: 'applied',
    accepted: 'accepted',
    later: 'later',
  },
};
