require("dotenv").config();
const { fetchData } = require("../libs/fetchData");
const jwt = require("jsonwebtoken");

const { getObjectId } = require("../libs/id");
const { response } = require("../response");
const { RunQuery, RunTransactionQuery } = require("../services");
const bcrypt = require("bcrypt");

const config = require("./../config");

var nodemailer = require("nodemailer");

const uuid = require("uuid");

const {
  beginTransaction,
  rollbackTransaction,
  commitTransaction,
} = require("../connection");

async function generateAndSetToken(connection, userId, res) {
  try {
    // Generate and set access token in client's browser
    const accessToken = jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, {
      expiresIn: process.env.JWT_ACCESS_EXPIRY_TIME,
    });
    if (accessToken) {
      res.cookie("AccessToken", accessToken, {
        maxAge: 31536000000,
        httpOnly: true,
        secure: true,
      });
    } else {
      throw new Error("ACCESS TOKEN NOT GENERATED!");
    }

    // Generate and store refresh token in database
    const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRY_TIME,
    });
    if (refreshToken) {
      var updateUserQuery = `UPDATE users SET refresh_token=? where user_id=? `;
      const updateValues = [refreshToken, userId];
      const resultu = await RunTransactionQuery(
        updateUserQuery,
        connection,
        updateValues
      );

      if (!resultu?.success) {
        await rollbackTransaction(connection);
        return res.status(500).json({ message: "Failed to insert user data" });
      }
    } else {
      throw new Error("REFRESH TOKEN NOT GENERATED!");
    }
  } catch (error) {
    return res.status(500).json(response(null, null, error.message, false));
  }
}

async function loginCommonSection(Udata, res, loginType) {
  // Start a transaction
  const connection = await beginTransaction();

  WebOrGoogle = loginType === "google" ? "web" : "google";

  if (Udata?.login_type === WebOrGoogle) {
    // if user is already signup from web and then signin from google then change the status of user in db
    var updateLoginTypeQuery = `UPDATE users SET login_type=?, verified=1 where user_id=? `;

    const updateLoginTypeValues = [loginType, Udata?.user_id];
    const updateLoginTypeResult = await RunTransactionQuery(
      updateLoginTypeQuery,
      connection,
      updateLoginTypeValues
    );

    if (!updateLoginTypeResult?.success) {
      return res
        .status(500)
        .json(response(null, null, "Failed to insert login type in user"));
    }

    Udata.login_type = loginType;
  }

  if (Udata && Udata?.password) {
    delete Udata.password; // Remove the "password" field from the object
  }

  if (Udata && Udata?.refresh_token) {
    delete Udata.refresh_token; // Remove the "refresh_token" field from the object
  }

  if (Udata?.status === "inactive")
    return res
      .status(401)
      .json(response(null, null, "USER HAS BEEN INACTIVE!"));

  if (!Udata?.email)
    return res
      .status(401)
      .json(response(null, null, "Invalid email or password"));

  if (Udata?.verified == 0) {
    return res.status(403).json(response(null, null));
  }

  // Call the function for token generation
  try {
    generateAndSetToken(connection, Udata?.user_id, res);
  } catch (error) {
    return res.status(500).json(response(null, null, error.message));
  }

  // Commit the transaction
  await commitTransaction(connection);

  res.status(200).json(response({ user_data: Udata }, null, ""));
}

async function login(req, res) {
  try {
    let { email_id, password } = req.body;

    var query = `
    SELECT users.* FROM users WHERE email = "${email_id}"`;

    const result = await RunQuery(query);

    if (!result?.success) {
      return res
        .status(400)
        .json(response(null, null, "username or password is incorrect"));
    }

    const Udata = fetchData(result?.success);

    if (!Udata || !(await bcrypt.compare(password, Udata.password))) {
      return res
        .status(400)
        .json(response(null, null, "username or password is incorrect"));
    }

    loginCommonSection(Udata, res, "web");
  } catch (error) {
    res
      .status(500)
      .json(response(null, null, "username or password is incorrect"));
  }
}

function generateToken() {
  // Get current date and time
  const currentDate = new Date();

  // Add 24 hours (24 * 60 * 60 * 1000 milliseconds) to the current date
  const expiryDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);

  // Convert the expiryDate to a MySQL-compatible format (YYYY-MM-DD HH:MM:SS)
  const mysqlDatetime = expiryDate.toISOString().slice(0, 19).replace("T", " ");

  return {
    token: uuid.v4(),
    tokenExpiry: mysqlDatetime,
  };
}

async function signup(req, res) {
  let connection;

  try {
    let { email_id, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if email already exists
    var checkQuery = `SELECT * FROM users WHERE email = ?`;
    const checkResult = await RunQuery(checkQuery, [email_id]);
    const existingUser = checkResult?.success;

    if (existingUser.length) {
      return res
        .status(400)
        .json(response(null, null, "User with this email already exists"));
    }

    const user_id = getObjectId();

    // Generate a verification token
    const verificationToken = generateToken();

    // Start a transaction
    connection = await beginTransaction();

    var query = `INSERT INTO users (user_id, email, password, status, login_type, verified, plan_name) 
    VALUES (?, ?, ?, "active", "web", 0, "free");`;

    const usersValues = [user_id, email_id, hashedPassword];
    const resultu = await RunTransactionQuery(query, connection, usersValues);

    if (!resultu?.success) {
      await rollbackTransaction(connection);
      return res
        .status(500)
        .json(response(null, null, "Failed to insert user data"));
    }

    var query = `INSERT INTO verify_email (user_id,verification_token, token_expiry) 
    VALUES (?,?,?);`;

    const verifyEmailValues = [
      user_id,
      verificationToken.token,
      verificationToken.tokenExpiry,
    ];
    const resultv = await RunTransactionQuery(
      query,
      connection,
      verifyEmailValues
    );

    if (!resultv?.success) {
      await rollbackTransaction(connection);
      return res
        .status(500)
        .json(response(null, null, "Failed to insert verification data"));
    }

    ///send email logic
    sendMail(verifyMailOptions(email_id, verificationToken?.token));

    // Commit the transaction
    await commitTransaction(connection);

    // await sendVerificationEmail(email_id, verificationToken);

    return res
      .status(200)
      .json(response({ email_id }, null, "Signup Successfull!", false));
  } catch (error) {
    if (connection) {
      await rollbackTransaction(connection);
    }
    return res.status(500).json(response(null, null, "Failed to Signup User!"));
  }
}

async function verify(req, res) {
  try {
    // Extract the verification token from the URL query parameters
    const token = req?.body?.token;

    var query = `
    select * from verify_email ve inner join users us on ve.user_id=us.user_id WHERE ve.verification_token = ? ORDER BY created_at DESC LIMIT 1`;
    const result = await RunQuery(query, [token]);
    const user = fetchData(result?.success);

    if (!user || user.verification_token !== token) {
      // Invalid or expired token
      return res
        .status(400)
        .json(response(null, null, "Oops, Invalid Link.", false));
    }

    const currentTime = new Date();
    const tokenExpiry = user && new Date(user?.token_expiry);

    if (!user || tokenExpiry <= currentTime) {
      return res
        .status(410)
        .json(
          response(
            null,
            { email: user.email },
            "Oops, verification expired.",
            false
          )
        );
    }

    var query = `
    update users set verified=1 where user_id=?;`;

    const updateResult = await RunQuery(query, [user.user_id]);

    if (updateResult.success !== null) {
      user.verified = 1;
      loginCommonSection(user, res, "web");
    }
  } catch (error) {
    res.status(500).json(response(null, null, "SOMETHING WENTS WRONG", false));
  }
}

async function reSendVerifyEmail(req, res) {
  try {
    // Extract the verification token from the URL query parameters
    const email = req?.body?.email;
    var getUserQuery = `SELECT user_id FROM users WHERE email = ?`;

    const userResult = await RunQuery(getUserQuery, [email]);
    if (!userResult?.success) {
      return res
        .status(400)
        .json(response(null, null, "Can't find relevant user"));
    }
    const user = fetchData(userResult?.success);

    var getVerifyQuery = `select created_at from verify_email WHERE user_id = ? ORDER BY created_at DESC LIMIT 1;`;

    const verifyResult = await RunQuery(getVerifyQuery, [user?.user_id]);
    if (!verifyResult?.success) {
      return res
        .status(400)
        .json(response(null, null, "Can't find relevant verfication data"));
    }
    const lastEmail = fetchData(verifyResult?.success);

    const canSendEmail = checkIfEmailCanBeSent(lastEmail?.created_at);

    if (!canSendEmail) {
      res
        .status(400)
        .json(response(null, null, "Cannot send email at this time", false));
      return;
    }

    const verificationToken = generateToken();

    var query = `INSERT INTO verify_email (user_id, verification_token, token_expiry) VALUES (?, ?, ?);`;

    const resultv = await RunQuery(query, [
      user?.user_id,
      verificationToken?.token,
      verificationToken?.tokenExpiry,
    ]);

    if (!resultv?.success) {
      return res
        .status(500)
        .json(
          response(null, null, "Failed to insert verification data", false)
        );
    }

    ///send email logic
    sendMail(verifyMailOptions(email, verificationToken?.token));

    res
      .status(200)
      .json(response(resultv, null, "Email sent successfully!", false));
  } catch (error) {
    res.status(500).json(response(null, null, "SOMETHING WENTS WRONG", false));
  }
}

function checkIfEmailCanBeSent(lastSendTime) {
  if (!lastSendTime) {
    // If no previous send time is available, a new email can be sent
    return true;
  }

  // Parse the lastSendTime string into a Date object
  const lastSendDate = new Date(lastSendTime);

  // Get the current time
  const currentTime = new Date();

  // Calculate the time difference in milliseconds
  const timeDiff = currentTime - lastSendDate;

  // Convert the time difference to seconds
  const timeDiffSeconds = Math.floor(timeDiff / 1000);

  // Check if the time difference is greater than or equal to 60 seconds
  if (timeDiffSeconds >= 60) {
    // If the last email was sent more than 60 seconds ago, a new email can be sent
    return true;
  }

  // If the last email was sent within the last 60 seconds, a new email cannot be sent yet
  return false;
}

async function logindetails(req, res) {
  try {
    const user_id = req.headers["userid"];

    var query = `
    SELECT users.* FROM users WHERE user_id = ?;`;

    const result = await RunQuery(query, [user_id]);

    if (!result?.success) {
      return res.status(400).json(response(null, null, "Can't find user data"));
    }

    const Udata = fetchData(result?.success);

    if (Udata && Udata?.password) {
      delete Udata.password; // Remove the "password" field from the object
    }

    if (Udata && Udata?.refresh_token) {
      delete Udata.refresh_token; // Remove the "refresh_token" field from the object
    }

    if (Udata?.status === "inactive")
      return res
        .status(401)
        .json(response(null, null, "USER HAS BEEN INACTIVE!"));

    if (!Udata?.email)
      return res.status(401).json(response(null, null, "Invalid email!"));

    if (Udata?.verified === 0) {
      return res.status(403).json(response(null, null));
    }

    res.status(200).json(response({ user_data: Udata }, null, ""));
  } catch (error) {
    return res
      .status(500)
      .json(response(null, null, "user_name or password incorrect"));
  }
}

async function google(req, res) {
  try {
    let { email_id } = req.body;

    // Check if email already exists
    var query = `
    SELECT users.* FROM users WHERE email = ?;`;

    const result = await RunQuery(query, [email_id]);

    if (!result?.success) {
      return res.status(400).json(response(null, null, "Can't find user data"));
    }

    const Udata = fetchData(result?.success);

    const connection = await beginTransaction();

    if (Udata && Udata?.user_id) {
      //email exist
      loginCommonSection(Udata, res, "google");
    } else {
      const user_id = getObjectId();

      var query = `INSERT INTO users (user_id, email, status, login_type, verified, plan_name) 
    VALUES (?, ?, "active", ?, 1, "free");`;

      const userValues = [user_id, email_id, "google"];
      const resultu = await RunTransactionQuery(query, connection, userValues);

      if (!resultu?.success) {
        return res
          .status(500)
          .json(response(null, null, "Failed to insert user data"));
      }

      // Commit the transaction

      const user_data = {
        user_id,
        plan_name: "free",
        email: email_id,
        status: "active",
        stripe_cus_id: null,
        login_type: "google",
      };

      generateAndSetToken(connection, user_id, res);

      await commitTransaction(connection);

      return res.status(200).json(response({ user_data }, null, ""));
    }
  } catch (error) {
    return res
      .status(500)
      .json(response(null, null, "username or password is incorrect"));
  }
}

function verifyMailOptions(toEmail, verificationToken) {
  return {
    from: process.env.MAIL_USER,
    to: toEmail,
    subject: `Verify Your Email Address for ${config.name}`,
    html: verifyEmailContent(verificationToken),
  };
}

function verifyEmailContent(verificationToken) {
  return `
      <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body
      style="
        font-family: 'Google Sans', Roboto, RobotoDraft, Helvetica, Arial,
          sans-serif;
        margin: 0;
        font-weight: 400;
      "
    >
      <div class="row" style="background-color: white">
        <div
          class="column"
          style="width: 100%; margin-bottom: 16px; padding: 0 50px"
        >
          <div
            class="card"
            style="
              margin: 8px;
              padding: 5% 10%;
              background: linear-gradient(0deg, #EAECEB 100%);
              display: flex;
              justify-content: center;
              align-items: center;
            "
          >
            <div
              class="container-email"
              style="
                text-align: center;
                box-shadow: rgba(157, 157, 167, 0.2) 0px 7px 29px 0px;
                border: 1px solid rgba(180, 180, 180, 0.344);
                width: 600px;
                border-radius: 5px;
                background-color: white;
                padding: 20px 50px;
              "
            >
              <img src="https://${config.url}/images/icon.png" alt="aiIcon" style="background-color:white; width:80px"/>
              <h2 style="text-align: center">VERIFICATION REQUIRED!</h2>
              <br />

              <p style=" text-align: start;">
              Dear User,
              <br/>
              <br/>
              Thank you for signing up with ${config.name}. To get started and enjoy all the benefits of our platform, we need to verify your email address.
              <br/>
              <br/>
              Please click the button below to complete the verification process:
              </p>
              <br />
              <!-- Button for verification link -->
              <a href="https://${config.url}/verify?token=${verificationToken}" style="background-color: #4CAF50; color: white; padding: 14px 25px; text-align: center; text-decoration: none; display: inline-block; border-radius: 5px;">Verify</a>
              <br />
              <p></p>
              <br />
              <p style=" text-align: start;">
              Best regards,
              <br />
              <br />
              Team ${config.name}
              </p>
            </div>
          </div>
        </div>
      </div>
    </body>`;
}

function resetPasswordMailOptions(toEmail, verificationToken) {
  return {
    from: process.env.MAIL_USER,
    to: toEmail,
    subject: `Reset Your Password for ${config.name}`,
    html: resetPasswordEmailContent(verificationToken),
  };
}

function resetPasswordEmailContent(resetToken) {
  return `
      <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body
      style="
        font-family: 'Google Sans', Roboto, RobotoDraft, Helvetica, Arial,
          sans-serif;
        margin: 0;
        font-weight: 400;
      "
    >
      <div class="row" style="background-color: white">
        <div
          class="column"
          style="width: 100%; margin-bottom: 16px; padding: 0 50px"
        >
          <div
            class="card"
            style="
              margin: 8px;
              padding: 5% 10%;
              background: linear-gradient(0deg, #EAECEB 100%);
              display: flex;
              justify-content: center;
              align-items: center;
            "
          >
            <div
              class="container-email"
              style="
                text-align: center;
                box-shadow: rgba(157, 157, 167, 0.2) 0px 7px 29px 0px;
                border: 1px solid rgba(180, 180, 180, 0.344);
                width: 600px;
                border-radius: 5px;
                background-color: white;
                padding: 20px 50px;
              "
            >
              <img src="https://${config.url}/images/icon.png" alt="Website Icon" style="background-color:white; width:80px"/>
              <h2 style="text-align: center">PASSWORD RESET REQUEST</h2>
              <br />

              <p style=" text-align: start;">
              Dear User,
              <br/>
              <br/>
              We received a request to reset the password for your account associated with this email address. If you did not request a password reset, please ignore this email.
              <br/>
              <br/>
              To reset your password, please click the button below:
              </p>
              <br />
              <!-- Button for password reset link -->
              <a href="https://${config.url}/reset-password?token=${resetToken}" style="background-color: #4CAF50; color: white; padding: 14px 25px; text-align: center; text-decoration: none; display: inline-block; border-radius: 5px;">Reset Password</a>
              <br />
              <p></p>
              <br />
              <p style=" text-align: start;">
              Best regards,
              <br />
              <br />
              Team ${config.name}
              </p>
            </div>
          </div>
        </div>
      </div>
    </body>`;
}

async function sendMail(mailOptions) {
  try {
    var transporter = nodemailer.createTransport({
      port: 465,
      host: "smtp.mail.us-east-1.awsapps.com",
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    return false;
  }
}

async function reset(req, res) {
  let connection;

  try {
    const email_id = req?.body?.email_id;

    // Check if email exists
    var checkQuery = `SELECT * FROM users WHERE email = ?`;
    const userQueryResult = await RunQuery(checkQuery, [email_id]);
    const userResult = userQueryResult?.success;
    if (!userResult.length) {
      return res.status(400).json(response(null, null, "Email does not exist"));
    }
    const user = fetchData(userQueryResult?.success);

    const user_id = user?.user_id;

    //check if one minute time is pass to send last email
    var getResetQuery = `select created_at from reset_password WHERE user_id = ? ORDER BY created_at DESC LIMIT 1;`;

    const verifyResult = await RunQuery(getResetQuery, [user?.user_id]);
    if (!verifyResult?.success) {
      return res
        .status(400)
        .json(response(null, null, "Can't find relevant verfication data"));
    }
    const lastEmail = fetchData(verifyResult?.success);
    const canSendEmail = checkIfEmailCanBeSent(lastEmail?.created_at);

    if (!canSendEmail) {
      res
        .status(410)
        .json(
          response(
            null,
            null,
            "Can't send another email right now. Please try again later.",
            false
          )
        );
      return;
    }

    // Generate a verification token
    const resetToken = generateToken();

    // Start a transaction
    connection = await beginTransaction();

    var query = `INSERT INTO reset_password (user_id,reset_token, token_expiry) 
    VALUES (?,?,?);`;

    const resetValues = [user_id, resetToken.token, resetToken.tokenExpiry];
    const resultv = await RunTransactionQuery(query, connection, resetValues);

    if (!resultv?.success) {
      await rollbackTransaction(connection);
      return res
        .status(500)
        .json(response(null, null, "Failed to insert reset values"));
    }

    ///send email logic
    sendMail(resetPasswordMailOptions(email_id, resetToken?.token));

    // Commit the transaction
    await commitTransaction(connection);

    return res
      .status(200)
      .json(response({ email_id }, null, "reset password mail sent!", false));
  } catch (error) {
    if (connection) {
      await rollbackTransaction(connection);
    }
    return res.status(500).json(response(null, null, "Failed to reset User!"));
  }
}

async function reSendResetEmail(req, res) {
  try {
    // Extract the verification token from the URL query parameters
    const email = req?.body?.email;

    var getUserQuery = `SELECT user_id FROM users WHERE email = ?`;

    const userResult = await RunQuery(getUserQuery, [email]);
    if (!userResult?.success) {
      return res
        .status(400)
        .json(response(null, null, "Can't find relevant user"));
    }
    const user = fetchData(userResult?.success);

    var getResetQuery = `select created_at from reset_password WHERE user_id = ? ORDER BY created_at DESC LIMIT 1;`;

    const verifyResult = await RunQuery(getResetQuery, [user?.user_id]);
    if (!verifyResult?.success) {
      return res
        .status(400)
        .json(response(null, null, "Can't find relevant verfication data"));
    }
    const lastEmail = fetchData(verifyResult?.success);

    const canSendEmail = checkIfEmailCanBeSent(lastEmail?.created_at);

    if (!canSendEmail) {
      res
        .status(410)
        .json(
          response(
            null,
            null,
            "Can't send another email right now. Please try again later.",
            false
          )
        );
      return;
    }

    const token = generateToken();

    var query = `INSERT INTO reset_password (user_id, reset_token, token_expiry) VALUES (?, ?, ?);`;

    const resultv = await RunQuery(query, [
      user?.user_id,
      token?.token,
      token?.tokenExpiry,
    ]);

    if (!resultv?.success) {
      return res
        .status(500)
        .json(response(null, null, "Failed to insert reset data", false));
    }

    // send email logic
    sendMail(resetPasswordMailOptions(email, token?.token));

    return res
      .status(200)
      .json(
        response(
          resultv,
          null,
          "Reset password email resend successfully!",
          false
        )
      );
  } catch (error) {
    res.status(500).json(response(null, null, "SOMETHING WENTS WRONG", false));
  }
}

async function verifyResetPasswordLink(req, res) {
  try {
    // Extract the verification token from the URL query parameters
    const token = req?.body?.token;

    var query = `
    select * from reset_password re inner join users us on re.user_id=us.user_id WHERE re.reset_token = ? ORDER BY re.created_at DESC LIMIT 1`;
    const result = await RunQuery(query, [token]);
    const user = fetchData(result?.success);

    if (!user || user.reset_token !== token) {
      // Invalid or expired token
      return res
        .status(400)
        .json(response(null, null, "Oops, Invalid Link.", false));
    }

    const currentTime = new Date();
    const tokenExpiry = user && new Date(user?.token_expiry);

    if (!user || tokenExpiry <= currentTime || user?.consume == 1) {
      return res
        .status(410)
        .json(
          response(null, { email: user.email }, "Oops, link is expired.", false)
        );
    }

    res
      .status(200)
      .json(response(null, null, "Reset password link is authentic!", false));
  } catch (error) {
    res.status(500).json(response(null, null, "SOMETHING WENTS WRONG", false));
  }
}

async function resetPassword(req, res) {
  try {
    // Extract the verification token from the URL query parameters
    const token = req?.body?.token;
    const password = req?.body?.password;

    var query = `
    select * from reset_password re inner join users us on re.user_id=us.user_id WHERE re.reset_token = ? ORDER BY re.created_at DESC LIMIT 1`;
    const result = await RunQuery(query, [token]);
    const user = fetchData(result?.success);

    if (!user || user.reset_token !== token) {
      // Invalid or expired token
      return res
        .status(400)
        .json(response(null, null, "Oops, Invalid Link.", false));
    }

    const currentTime = new Date();
    const tokenExpiry = user && new Date(user?.token_expiry);

    if (!user || tokenExpiry <= currentTime || user?.consume == 1) {
      return res
        .status(410)
        .json(
          response(null, { email: user.email }, "Oops, link is expired.", false)
        );
    }

    // Start a transaction
    connection = await beginTransaction();

    const hashedPassword = await bcrypt.hash(password, 10);

    var query = `update users set password=? where user_id=?;`;

    const usersValues = [hashedPassword, user?.user_id];
    const resultu = await RunTransactionQuery(query, connection, usersValues);

    if (!resultu?.success) {
      await rollbackTransaction(connection);
      return res
        .status(500)
        .json(response(null, null, "Failed to update user password"));
    }

    var query = `
    update reset_password set consume=1 where reset_token=?;`;

    const updateResult = await RunTransactionQuery(query, connection, [token]);

    if (!updateResult?.success) {
      await rollbackTransaction(connection);
      return res
        .status(500)
        .json(response(null, null, "Failed to update reset password", false));
    }

    await commitTransaction(connection);

    return res
      .status(200)
      .json(response(null, null, "password reset successfully", false));
  } catch (error) {
    return res
      .status(500)
      .json(response(null, null, "SOMETHING WENTS WRONG", false));
  }
}

async function changePassword(req, res) {
  try {
    // Extract user ID, new password, and current password from the request body
    const userId = req.headers["userid"];
    const currentPassword = req?.body?.password;
    const newPassword = req?.body?.newPassword;

    // Check if the current password and new password are the same
    if (currentPassword === newPassword) {
      // If the passwords are the same, return an error
      return res
        .status(400)
        .json(
          response(
            null,
            null,
            "The new password cannot be the same as the current password.",
            true
          )
        );
    }

    // Query to find the user by ID and get their current password hash
    var query = `SELECT password FROM users WHERE user_id = ?`;
    const result = await RunQuery(query, [userId]);
    const user = fetchData(result?.success);

    if (!user) {
      // User not found
      return res
        .status(404)
        .json(response(null, null, "User not found.", true));
    }

    // Verify the current password matches the stored hash
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      // Password does not match
      return res
        .status(401)
        .json(response(null, null, "Incorrect current password.", true));
    }

    // Start a transaction
    connection = await beginTransaction();

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password with the new hashed password
    var updateQuery = `UPDATE users SET password = ? WHERE user_id = ?;`;
    const updateResult = await RunTransactionQuery(updateQuery, connection, [
      hashedPassword,
      userId,
    ]);

    if (!updateResult?.success) {
      await rollbackTransaction(connection);
      // If the update fails, rollback the transaction
      return res
        .status(500)
        .json(response(null, null, "Failed to update password", true));
    }

    // Commit the transaction if everything is successful
    await commitTransaction(connection);

    return res
      .status(200)
      .json(response(null, null, "Password updated successfully", true));
  } catch (error) {
    // Handle any errors that occur during the process
    return res
      .status(500)
      .json(response(null, null, "Something went wrong", true));
  }
}

module.exports = {
  login,
  logindetails,
  signup,
  verify,
  reSendVerifyEmail,
  reSendResetEmail,
  google,
  reset,
  verifyResetPasswordLink,
  resetPassword,
  generateAndSetToken,
  changePassword,
};
