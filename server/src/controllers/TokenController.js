const { v4 } = require("uuid");
const { TokenModel } = require("../models/TokenModel");

class TokenController {
  /**
   * Get token by id
   * @param {String} id The token id
   * @returns The toke row
   */
  static getToken(id) {
    return TokenModel.query().findById(id);
  }

  /**
   * Get the token by user id
   * @param {String} userId The user id
   * @returns The token row
   */
  static getTokenByUserId(userId) {
    return TokenModel.query().select().where("userId", userId);
  }

  /**
   * Create the token row in the DB
   * @param {String} token The token string
   * @param {String} userId The user id
   * @param {Date} expiredAt The expiration date
   * @returns The created token
   */
  static createToken(userId, token) {
    return TokenModel.query().insert({
      id: v4(),
      userId: userId,
      token: token,
    });
  }

  /**
   * Remove the token by id
   * @param {String} id The token id
   * @returns
   */
  static deleteToken(id) {
    return TokenModel.query().deleteById(id);
  }
}

module.exports = { TokenController };
