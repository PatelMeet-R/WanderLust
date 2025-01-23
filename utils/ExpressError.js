class ExpressError extends Error {
  constructor(statusCode, message) {
    super();
    this.statusCode = this;
    this.massage = this;
  }
}
module.exports = ExpressError;
 