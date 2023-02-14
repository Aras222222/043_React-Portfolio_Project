import React, { useContext } from "react";
import useInput from "../../hooks/use-input";
import checkIP from "../../utils/checkIP";
import sendEmailData from "../../utils/sendEmailData.js";

import Button from "../ui/buttons/Button";
import classes from "./Contact.module.css";

import DarkModeContext from "../../store/color-context";

const Contact = () => {
  const darkCtx = useContext(DarkModeContext);

  const {
    value: enteredName,
    valueChangeHandler: nameChangeHandler,
    onBlurHandler: nameOnBlurHandler,
    isValueValid: isNameValid,
    inputClasses: nameInputClasses,
    errorMessage: nameErrorMessage,
    reset: resetName,
  } = useInput("Name");

  const {
    value: enteredSubject,
    valueChangeHandler: subjectChangeHandler,
    onBlurHandler: subjectOnBlurHandler,
    isValueValid: isSubjectValid,
    inputClasses: subjectInputClasses,
    errorMessage: subjectErrorMessage,
    reset: resetSubject,
  } = useInput("Subject");

  const {
    value: enteredMessage,
    valueChangeHandler: messageChangeHandler,
    onBlurHandler: messageOnBlurHandler,
    isValueValid: isMessageValid,
    inputClasses: messageInputClasses,
    errorMessage: messageErrorMessage,
    reset: resetMessage,
  } = useInput("Message");

  const formSubmitHandler = async (event) => {
    event.preventDefault();
    const ip = await checkIP();

    let isFormValid = false;

    if (isNameValid && isSubjectValid && isMessageValid) {
      isFormValid = true;
    } else {
      isFormValid = false;
    }

    if (!isFormValid) {
      return;
    }

    const emailData = {
      IP: ip,
      Name: enteredName,
      Subject: enteredSubject,
      Message: enteredMessage,
    };

    const emailSendRes = await sendEmailData(emailData);

    if (emailSendRes.message === "Successfully sent email data!") {
      console.log("Something right!");
      resetName();
      resetSubject();
      resetMessage();
      return;
    } else {
      console.log("Something wrong!");

      resetName();
      resetSubject();
      resetMessage();
    }
  };

  const contactColor = darkCtx.isDarkMode
    ? "contact-color-dark"
    : "contact-color-light";

  return (
    <section className={classes["form-card"]} id="contact">
      <div className={contactColor}>
        <form onSubmit={formSubmitHandler}>
          <h3>Contact Form</h3>
          <div className={classes["input-div"]}>
            <label htmlFor="name">Your Name</label>
            <input
              className={nameInputClasses}
              type="text"
              id="name"
              placeholder="Name..."
              onChange={nameChangeHandler}
              value={enteredName}
              onBlur={nameOnBlurHandler}
            />
            {nameErrorMessage}
          </div>

          <div className={classes["input-div"]}>
            <label htmlFor="subject">Your Subject</label>
            <input
              className={subjectInputClasses}
              type="text"
              id="subject"
              placeholder="Subject..."
              onChange={subjectChangeHandler}
              value={enteredSubject}
              onBlur={subjectOnBlurHandler}
            />
            {subjectErrorMessage}
          </div>

          <div className={classes["input-div"]}>
            <label htmlFor="message">Your Message</label>
            <textarea
              className={messageInputClasses}
              type="text"
              id="message"
              placeholder="Message..."
              onChange={messageChangeHandler}
              value={enteredMessage}
              onBlur={messageOnBlurHandler}
            />
            {messageErrorMessage}
          </div>

          <Button padding="true">Shoot!</Button>
        </form>
      </div>
    </section>
  );
};

export default Contact;
