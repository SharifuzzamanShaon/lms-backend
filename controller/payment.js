const Enrollment = require("../model/enrollModel");

const stripe = require("stripe")(
  "sk_test_51Qq6EcK5LodKUJLl0HG1snEOb78wvVIY70sNfQgkI5GTmTRZWqNcRhRRmXA0XGOCXgdWqNdxk26e4dzC09xbOQd800HodFA48a"
);
const makePayment = async (req, res, next) => {
  try {
    const course = req.body;
    console.log("Course Details:", course);
    console.log(course.price);
    const price = parseFloat(course.price);
    if (isNaN(price)) {
      throw new Error("Invalid course price. Price must be a valid number.");
    }
    const priceInCents = Math.round(price * 100);
    const lineItems = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: course.name,
          },
          unit_amount: course.price * 100, // Use the calculated price in cents
        },
        quantity: 1,
      },
    ];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      success_url: `http://localhost:3000/payment/success?courseId=${course._id}&sessionId={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:3000/payment/cancel`,
    });
    console.log(session.id);
    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error("Stripe Error:", error);
    next(error);
  }
};

const enrollUser = async (req, res, next) => {
  try {
    // const sessionId = req.body
    // console.log(sessionId);
    // console.log("payment success | ready to enroll");
    const newEnrollment = new Enrollment({ user: req.user._id, course: req.body.courseId })
   const response =  await newEnrollment.save();
   console.log(response);
   
    return res.status(200).send({success: true, message: "Payment successful! You are now enrolled."})
  } catch (error) {
    next(error);
  }
};

module.exports = {
  makePayment,
  enrollUser,
};
