const jwt = require("jsonwebtoken");
const { beginTransaction, commitTransaction } = require("../connection");
const { RunTransactionQuery } = require("../services");
const { generateAndSetToken } = require("../controllers/user-controller");
const { fetchData } = require("../libs/fetchData");
const { response } = require("../response");

module.exports = async function authenticateToken(req, res, next) {
  const cookies = req.headers.cookie;

  if (!cookies) {
    return res
      .status(419)
      .json(
        response(null, null, "Cookies not found in request headers.", false)
      );
  }

  const cookieArray = cookies.split("; ");
  const accessTokenCookie = cookieArray.find((cookie) =>
    cookie.startsWith("AccessToken=")
  );

  if (!accessTokenCookie) {
    return res
      .status(419)
      .json(response(null, null, "AccessToken cookie not found.", false));
  }

  const accessToken = accessTokenCookie.split("=")[1];

  if (!accessToken) {
    return res
      .status(419)
      .json(response(null, null, "Access token not found", false));
  }

  const parts = accessToken.split(".");
  const decodedPayload = JSON.parse(
    Buffer.from(parts[1], "base64").toString("utf-8")
  );
  const userId = decodedPayload?.userId;

  jwt.verify(
    accessToken,
    process.env.JWT_ACCESS_SECRET,
    async (err, decoded) => {
      if (err) {
        let errorMessage;

        switch (err.name) {
          case "TokenExpiredError":
            let refreshToken;
            try {
              const connection = await beginTransaction();
              const query = `SELECT refresh_token FROM users WHERE user_id = ?;`;
              const result = await RunTransactionQuery(query, connection, [
                userId,
              ]);
              refreshToken = fetchData(result?.success)?.refresh_token;
              if (!refreshToken) {
                return res
                  .status(419)
                  .json(
                    response(null, null, "refresh token not found.", false)
                  );
              }
              jwt.verify(
                refreshToken,
                process.env.JWT_REFRESH_SECRET,
                async (err, decoded) => {
                  if (err) {
                    switch (err.name) {
                      case "TokenExpiredError":
                        errorMessage = "Refresh token expired";
                        break;
                      case "JsonWebTokenError":
                        errorMessage = "Invalid refresh token";
                        break;
                      default:
                        errorMessage = "Failed to verify refresh token";
                    }
                    return res
                      .status(419)
                      .json(response(null, null, errorMessage, false));
                  }
                  await generateAndSetToken(connection, userId, res);
                  await commitTransaction(connection);
                  return next(); // Call next only after all async operations are done
                }
              );
              return; // Stop further execution after sending response
            } catch (error) {
              return res
                .status(419)
                .json(response(null, null, error.message, false));
            }
          case "JsonWebTokenError":
            errorMessage = "Invalid token";
            break;
          default:
            errorMessage = "Failed to verify token";
        }
        return res.status(419).json(response(null, null, errorMessage, false));
      }
      return next();
    }
  );
};
