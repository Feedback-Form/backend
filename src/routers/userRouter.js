const express = require("express");

const userRouter = new express.Router();

const chalk = require("chalk");
const jwt = require("jsonwebtoken");
// sendgrid
const sgMail = require("@sendgrid/mail");
const User = require("../models/userDocument");

// middlewares
const rateLimiterUsingThirdParty = require("../middlewares/rateLimiter");
const auth = require("../middlewares/auth");

// create a user
userRouter.post("/v1/user/create", async (req, res) => {
	// const { name, email } = req.body;

	try {
		const user = new User({
			...req.body,
			userIsVerified: true,
		});
		const savedUser = await user.save();

		// // initiate verification flow
		// const verificationToken = usePwHashToToken(user, '24h');
		// const verificationUrl = getUserVerificationURL(user, verificationToken);

		// const msg = {
		//   to: email,
		//   from: 'team@copykat.ai',
		//   subject: 'CopykatAI - Verify your email',
		//   templateId: 'd-3e96c0197aed462a9746571a8dfa751f',
		//   dynamicTemplateData: {
		//     name,
		//     verificationUrl,
		//     email: 'support@copykat.ai',
		//   },
		// };

		// await sgMail.send(msg);

		// res.status(201).send({
		//   token,
		//   message: `We've sent an email to ${email}. Please verify your account.`,
		// });
		res.status(201).send({
			payload: {
				message: `You've successfully registered.`,
				savedUser,
			},
		});
	} catch (err) {
		res.status(400).send({ payload: { message: err.message } });
	}
});

// userRouter.post('/user/verify/:userId/:token', async (req, res) => {
//   const { userId, token } = req.params;

//   try {
//     const user = await User.findOne({ _id: userId });
//     const {
//       password, createdAt, id, email, name,
//     } = await user;

//     const secret = `${password}-${createdAt}`;

//     const payload = jwt.decode(token, secret);
//     if (payload.userId !== id) {
//       throw new Error('error');
//     }

//     if (payload.passwordHash !== password) {
//       throw new Error('error');
//     }

//     // update DB
//     user.userIsVerified = true;
//     await user.save();

//     // send welcome email to user
//     const msg = {
//       to: email,
//       from: 'team@copykat.ai',
//       subject: `Welcome to CopykatAI, ${name}! 🥳`,
//       templateId: 'd-a9df852f72424095867dde7d3a9625d1',
//       dynamicTemplateData: {
//         name,
//         copykatLoginUrl: 'https://app.copykat.ai/login',
//         email: 'support@copykat.ai',
//       },
//     };
//     await sgMail.send(msg);

//     // eslint-disable-next-line no-console

//     res.status(201).send({
//       message: 'You\'ve successfully verified your account!',
//     });
//   } catch (err) {
//     res.status(400).send({ message: err });
//   }
// });

// login
userRouter.post(
	"/v1/user/login",
	rateLimiterUsingThirdParty,
	async (req, res) => {
		const { email, password } = req.body;

		try {
			const user = await User.findByCredentials(email, password);
			const token = await user.generateAuthToken();

			if (user.userIsVerified === false) {
				throw new Error(
					"Please verify your email address to activate your account."
				);
			}

			res.status(201).send({ payload: { user, token } });
		} catch (err) {
			res.status(400).send({ message: err.message });
		}
	}
);

// getUserInformation
userRouter.get("/v1/user/info", auth, async (req, res) => {
	try {
		const user = await User.findById(req.user._id);
		res.status(201).send({ payload: { user } });
	} catch (err) {
		res.status(400).send(err);
	}
});

// log out of current session
userRouter.post("/v1/user/logout", auth, async (req, res) => {
	try {
		req.user.tokens = req.user.tokens.filter(
			(token) => token.token !== req.token
		);
		await req.user.save();

		res.send({ payload: { message: "you were logged out" } });
	} catch (err) {
		res.status(500).send();
	}
});

// edit a user
userRouter.patch("/v1/user/edit", auth, async (req, res) => {
	const updates = Object.keys(req.body);

	const forbiddenUpdates = ["tokens", "_id", "userIsVerified"];
	const forbiddenOperation = updates.every((update) =>
		forbiddenUpdates.includes(update)
	);

	if (forbiddenOperation) {
		return res.status(400).send({ payload: "invalid updates" });
	}

	try {
		const user = await User.findOne({ _id: req.user._id });

		// if (updates.length === 1 ) {

		// }
		updates.forEach((i) => {
			user[i] = req.body[i];
		});

		// console.log(req.user[updates] = req.body[updates]);

		await user.save();

		res.status(201).send({
			payload: { user, message: "successfully edited user details." },
		});
	} catch (err) {
		res.status(400).send({ payload: { message: err.message } });
	}
});

// DELETE user
userRouter.delete("/v1/user/delete", auth, async (req, res) => {
	try {
		await req.user.remove();
		res.status(201).send({
			payload: { user, message: "successfully deleted the user." },
		});
	} catch (err) {
		res.status(400).send({ payload: { message: err.message } });
	}
});

// server and redirect to customer portal. Note that, in practice
// this ID should be stored in your database when you receive
// the checkout.session.completed event

module.exports = userRouter;
