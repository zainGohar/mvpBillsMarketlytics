const { response } = require("../response");
const { RunQuery } = require("../services");

const Stripe = require("stripe");
require("dotenv").config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function paymentSuccess(req, res) {
  try {
    const session = await stripe.checkout.sessions.retrieve(
      req.body.session_id,
      {
        expand: [
          "line_items.data.price.product",
          "subscription.default_payment_method",
          "subscription.plan.product",
        ],
      }
    );

    if (
      session &&
      session?.status != "complete" &&
      session?.payment_status != "paid"
    ) {
      return response
        .status(400)
        .json(response(null, null, "Payment is not paid."));
    }

    const item = session?.line_items?.data[0];
    const email = session?.customer_details?.email;

    const object = {
      invoiceHeadingLine: getInvoiceHeadingLine(item),
      amount: getAmount(item),
      invoiceDuration: getInvoiceDuration(item),
      itemName: getItemName(item),
      descriptionHeading: getDescriptionHeading(item),
      itemDurationDescription: getItemDurationDescription(item),
      planName: getPlanName(item),
    };

    res.status(200).json(
      response(
        {
          object,
          email,
        },
        null,
        ""
      )
    );
  } catch (error) {
    res.status(500).json(response(null, null, "SOMETHING WENTS WRONG"));
  }
}

async function createCustomerPortalSession(req, res) {
  try {
    const email = req.headers["useremail"];

    let stripeCustomerId = "";
    // Check if customer exist
    const customerList = await stripe.customers.list({ email: email });

    if (customerList.data.length <= 0) {
      return res.status(404).json(response(null, null, "Customer not found!"));
    }

    stripeCustomerId = customerList.data[0].id;

    // Authenticate your user.
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${process.env.BASE_URL}`,
    });

    res.status(200).json(response({ url: session.url }, null, ""));
  } catch (error) {
    res.status(500).json(response(null, null, `${error}`));
  }
}

async function createCheckoutSession(req, res) {
  try {
    const price_id = req.body?.price_id;
    const payment_mode = req.body?.payment_mode;
    const email = req.headers["useremail"];

    data = {
      line_items: [
        {
          price: price_id,
          quantity: 1,
        },
      ],
      mode: payment_mode,
      success_url: `${process.env.BASE_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BASE_URL}pricing`,
      allow_promotion_codes: true,
    };

    // Check if customer exist
    const customerList = await stripe.customers.list({ email: email });

    if (customerList.data.length <= 0) {
      data.customer_email = email;
    } else {
      stripeCustomerId = customerList.data[0].id;
      data.customer = stripeCustomerId;
    }

    const session = await stripe.checkout.sessions.create(data);

    res.status(200).json(response({ url: session.url }, null, ""));
  } catch (error) {
    res.status(500).json(response(null, null, `${error}`));
  }
}

const getInvoiceHeadingLine = (item) => {
  if (item?.price?.type === "recurring")
    return `Subscribe to ${item?.price?.product?.name}`;
  else return `Lifetime ${item?.price?.product?.name} Deal`;
};

const getAmount = (item) => {
  return item?.price?.unit_amount / 100;
};

const getInvoiceDuration = (item) => {
  if (item?.price?.type === "recurring") return `Per month`;
  else return "Lifetime";
};

const getDescriptionHeading = (item) => {
  if (item?.price?.type === "recurring") return `Thanks for subscribing`;
  else return `Thanks for purchasing`;
};

const getItemName = (item) => {
  return item?.price?.product?.name;
};

const getItemDurationDescription = (item) => {
  if (item?.price?.type === "recurring") return `Billed Monthly`;
  else return `Lifetime`;
};

const getSubscriptionId = (item, session) => {
  if (item?.price?.type === "recurring") {
    return session?.subscription?.id;
  } else return null;
};

const getPlanName = (item) => {
  if (item?.price?.type === "recurring") {
    return item?.price?.product?.name.toLowerCase().concat(getduration(item));
  } else {
    return item?.price?.product?.name.toLowerCase().concat("monthly");
  }
};

const getduration = (item) => {
  if (item?.price?.type === "recurring") {
    if (item?.price?.recurring?.interval === "month") return "monthly";
    else return "yearly";
  } else return "monthly";
};

const getStripePriceNickname = (item) => {
  return item?.price?.nickname;
};

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = process.env.STRIPE_WEBHOOK_END_POINT_SECRET;

async function webhook(req, res) {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    return res
      .status(400)
      .json(response(null, null, `Webhook Error: ${err.message}`, false));
  }

  try {
    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        {
          const session = await stripe.checkout.sessions.retrieve(
            event.data.object.id,
            {
              expand: [
                "line_items.data.price.product",
                "subscription.default_payment_method",
                "subscription.plan.product",
              ],
            }
          );

          const item = session.line_items.data[0];
          const email = session.customer_details.email;

          if (
            session &&
            session?.status != "complete" &&
            session?.payment_status != "paid"
          ) {
            return res
              .status(400)
              .json(response(null, null, "Payment is not paid.", false));
          }

          var query = `
        Update users set plan_name=?, subscription_id=?, 
        subscription_status=?,  
        stripe_cus_id=? where email=?;`;

          const QueryValues = [
            getStripePriceNickname(item),
            getSubscriptionId(item, session),
            session?.subscription?.status,
            session.customer,
            email,
          ];

          const resultSubscription = await RunQuery(query, QueryValues);

          if (!resultSubscription?.success) {
            return res
              .status(500)
              .json(
                response(
                  null,
                  null,
                  "Failed to insert subscription data of user",
                  false
                )
              );
          }

          // void all open invoices so that user can't subscribe twice
          const openInvoices = await stripe.invoices.list({
            customer: session.customer,
            status: "open",
          });

          // Loop through each open invoice and set it to "void"
          for (const invoice of openInvoices.data) {
            await stripe.invoices.voidInvoice(invoice.id);
          }
        }
        // Then define and call a function to handle the event checkout.session.completed
        break;

      case "customer.created":
        {
          const customerCreated = event.data.object;

          var query = `
      Update users set 
       stripe_cus_id=?  
       where email=?`;

          const QueryValues = [customerCreated?.id, customerCreated.email];
          const updateUserquery = await RunQuery(query, QueryValues);

          if (!updateUserquery?.success) {
            return res
              .status(500)
              .json(
                response(null, null, "Failed to insert customer details", false)
              );
          }
        }

        // Then define and call a function to handle the event customer.created
        break;

      case "customer.subscription.deleted":
        {
          const customerSubscriptionDeleted = event.data.object;
          const customerId = customerSubscriptionDeleted?.customer;
          const customer = await stripe.customers.retrieve(customerId);
          const customerEmail = customer.email;

          var query = `
       Update users set 
       plan_name='free', 
       stripe_cus_id=?, 
       subscription_status=? 
       where email=? ;`;

          const QueryValues = [
            customerSubscriptionDeleted?.customer,
            customerSubscriptionDeleted?.status,
            customerEmail,
          ];

          const updateUserquery = await RunQuery(query, QueryValues);

          if (!updateUserquery?.success) {
            return res
              .status(500)
              .json(
                response(
                  null,
                  null,
                  "Failed to insert user subscription details",
                  false
                )
              );
          }
        }

        // Then define and call a function to handle the event customer.subscription.deleted
        break;

      case "customer.subscription.updated":
        {
          const customerSubscriptionUpdated = event.data.object;
          const customerId = customerSubscriptionUpdated?.customer;
          const customer = await stripe.customers.retrieve(customerId);
          const customerEmail = customer.email;

          const PriceObject = await stripe.prices.retrieve(
            customerSubscriptionUpdated?.plan?.id
          );

          const planName = PriceObject?.nickname;

          var query = `
      Update users set plan_name=?, 
       stripe_cus_id=?, 
       subscription_status=?  
       where email=?;`;

          const QueryValues = [
            planName,
            customerId,
            customerSubscriptionUpdated?.status,
            customerEmail,
          ];
          const updateUserquery = await RunQuery(query, QueryValues);

          if (!updateUserquery?.success) {
            return res
              .status(500)
              .json(
                response(null, null, "Failed to update user details", false)
              );
          }
        }

        // Then define and call a function to handle the event customer.subscription.updated
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.send();
  } catch (err) {
    return res
      .status(400)
      .json(response(null, null, `Webhook Error: ${err.message}`, false));
  }
}

module.exports = {
  paymentSuccess,
  webhook,
  createCustomerPortalSession,
  createCheckoutSession,
};
