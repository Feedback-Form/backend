const express = require("express");
const appRouter = new express.Router();
const auth = require("../middlewares/auth");

//schemes
const Form = require("../models/formSchema");
const Response = require("../models/responseSchema");
const User = require("../models/userDocument");

//modules
const { classifyText } = require("./modules/classifier/classifyText");
const {
	suggestResponse,
} = require("./modules/suggestResponse/suggestResponse");

/*
 *
 *FORM
 *
 */

appRouter.post("/v1/form", auth, async (req, res) => {
	const form = new Form({
		...req.body,
		owner: req.user._id,
	});
	try {
		const savedForm = await form.save();
		res.status(201).send({
			payload: {
				savedForm,
			},
		});
	} catch (err) {
		res.status(400).send({ payload: { message: err.message } });
	}
});

appRouter.delete("/v1/form/:formId", auth, async (req, res) => {
	try {
		const form = await Form.findOneAndDelete({
			_id: req.params.formId,
			owner: req.user._id,
		});

		if (!form) {
			throw new Error("no document found.");
		}
		res.status(201).send({
			payload: { message: `You've successfully deleted the form.`, form },
		});
	} catch (err) {
		res.status(400).send({ payload: { message: err.message } });
	}
});

appRouter.get("/v1/form/:formId", async (req, res) => {
	try {
		const form = await Form.findOne({
			_id: req.params.formId,
		});

		if (!form) {
			throw new Error("no document found.");
		}
		res.status(201).send({
			payload: { form },
		});
	} catch (err) {
		res.status(400).send({ payload: { message: err.message } });
	}
});

appRouter.get("/v1/forms", auth, async (req, res) => {
	try {
		const forms = await Form.find({ owner: req.user._id });

		res.status(201).send({ payload: { forms } });
	} catch (err) {
		res.status(400).send({ payload: { message: err.message } });
	}
});

/*
 *
 *Response
 *
 */

appRouter.post("/v1/response/:formId", async (req, res) => {
	try {
		const { personalDetails, questionResponses, allowPublishing } =
			req.body;

		const taggedQuestions = [];
		for (const item of questionResponses) {
			const tags = await classifyText(item.response, req.params.formId);
			const taggedResponse = {
				...item,
				tags,
			};
			taggedQuestions.push(taggedResponse);
		}
		const response = new Response({
			allowPublishing,
			questionResponses: taggedQuestions,
			personalDetails,
			formId: req.params.formId,
		});
		const savedResponse = await response.save();
		res.status(201).send({ payload: { savedResponse } });
	} catch (err) {
		res.status(400).send({ payload: { message: err.message } });
	}
});
appRouter.get("/v1/response/:id", auth, async (req, res) => {
	try {
		const response = await Response.findOne({ _id: req.params.id });

		res.status(201).send({ payload: { response } });
	} catch (err) {
		res.status(400).send({ payload: { message: err.message } });
	}
});

appRouter.get("/v1/responses/:formId", auth, async (req, res) => {
	try {
		const responses = await Response.find({ formId: req.params.formId });

		res.status(201).send({ payload: { responses } });
	} catch (err) {
		res.status(400).send({ payload: { message: err.message } });
	}
});

appRouter.post("/v1/response/suggestion/:formId", async (req, res) => {
	try {
		const { question, rating, maxRating } = req.body;
		// get the company Description of the owner's form
		const form = await Form.findOne({ _id: req.params.formId });
		const user = await User.findOne({ _id: form.owner });
		const { productServiceDescription, _id } = user;
		const suggestedResponse = await suggestResponse(
			question,
			rating,
			maxRating,
			productServiceDescription,
			_id.toString()
		);
		res.status(201).send({ payload: { suggestedResponse } });
	} catch (err) {
		res.status(400).send({ payload: { message: err.message } });
	}
});

module.exports = appRouter;
