const express = require("express");
const appRouter = new express.Router();
const chalk = require("chalk");
const auth = require("../middlewares/auth");

//schemes
const Form = require("../models/formSchema");
const Response = require("../models/responseSchema");
const Tag = require("../models/tagSchema");

//modules
const classifyText = require("./modules/classifier/classifyText");

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

appRouter.delete("/v1/form/:id", auth, async (req, res) => {
	try {
		const form = await Form.findOneAndDelete({
			_id: req.params.id,
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

appRouter.get("/v1/form/:id", async (req, res) => {
	try {
		const form = await Form.findOne({
			_id: req.params.id,
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

appRouter.get("/v1/forms", auth, async (req, res) => {
	try {
		const documents = await Form.find({ owner: req.user._id });

		res.status(201).send({ payload: { documents } });
	} catch (err) {
		res.status(400).send({ payload: { message: err.message } });
	}
});

/*
 *
 *TAG
 *
 */

appRouter.get("/v1/tags", auth, async (req, res) => {
	try {
		const tags = await Tag.find({ owner: req.user._id });

		res.status(201).send({ payload: { tags } });
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
		const { personalDetails, questionResponses } = req.body;

		const response = new Response({
			...req.body,
			personalDetails,
			formId: req.params.formId,
		});
		questionResponses.forEach((question) => {
			const tags = await classifyText(question, "xy-xy3-jfs");
			console.log(tags);
		});
		const savedResponse = await response.save();
		res.status(201).send({ payload: { savedResponse } });
	} catch (err) {
		res.status(400).send({ payload: { message: err.message } });
	}
});
appRouter.get("/v1/response/:id", auth, async (req, res) => {
	try {
		const response = await Response.findOne({ owner: req.params.id });

		res.status(201).send({ payload: { response } });
	} catch (err) {
		res.status(400).send({ payload: { message: err.message } });
	}
});
appRouter.get("/v1/responses/:formId", auth, async (req, res) => {
	try {
		const responses = await Response.find({ owner: req.params.formId });

		res.status(201).send({ payload: { responses } });
	} catch (err) {
		res.status(400).send({ payload: { message: err.message } });
	}
});

module.exports = appRouter;
