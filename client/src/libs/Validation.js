import { object, string, boolean } from "yup";

export const validateFunc = async (data, formName) => {
  try {
    const validationResult = await Schema[formName].validate(data, {
      abortEarly: false,
    });
    return null; // In case of successful validation
  } catch (error) {
    const formattedErrors = {};
    if (error.inner) {
      let isFirstError = true;
      for (let item of error.inner) {
        if (!formattedErrors.hasOwnProperty(item.path)) {
          formattedErrors[item.path] = {
            message: item.message,
            focus: isFirstError,
          };
          isFirstError = false;
        }
      }
    }
    return formattedErrors; // Returning the formatted errors
  }
};

export const validateProperty = async (name, value) => {
  try {
    const validationResult = await object()
      .shape({
        [name]: validationObject[name],
      })
      .validate({ [name]: value }, { abortEarly: false });
    return null; // In case of successful validation
  } catch (error) {
    const formattedErrors = {};
    if (error.inner) {
      for (let item of error.inner) {
        if (!formattedErrors.hasOwnProperty(item.path)) {
          formattedErrors[item.path] = { message: item.message, focus: false };
        }
      }
    }
    return formattedErrors; // Returning the formatted errors
  }
};

const validationObject = {
  email_id: string().required().email().label("Email"),
  password: string()
    .required("Current Password is required")
    .test(
      "not-only-spaces",
      "Password must not be only blank spaces",
      (value) =>
        value === null || value === undefined || value.trim().length > 0
    )
    .label("Password"),
  new_password: string()
    .required("New Password is required")
    .test(
      "not-only-spaces",
      "Password must not be only blank spaces",
      (value) =>
        value === null || value === undefined || value.trim().length > 0
    )
    .label("Password"),
  CheckBox: boolean().required().oneOf([true], "checkbox must be true"),
};

const Schema = {
  signin: object().shape({
    email_id: validationObject["email_id"],
    password: validationObject["password"],
  }),

  signup: object().shape({
    email_id: validationObject["email_id"],
    password: validationObject["password"],
    CheckBox: validationObject["CheckBox"],
  }),

  forgetpassword: object().shape({
    email_id: validationObject["email_id"],
  }),

  resetpassword: object().shape({
    password: validationObject["password"],
  }),

  changepassword: object().shape({
    password: validationObject["password"],
    new_password: validationObject["new_password"],
  }),
};
