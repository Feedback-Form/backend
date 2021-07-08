const express = require("express");
const appRouter = new express.Router();
const chalk = require("chalk");
const OpenAI = require("./modules/openai");
const openai = new OpenAI(process.env.OPENAI_API_KEY);
const auth = require("../middlewares/auth");

//schemes
const Form = require("../models/formSchema");
const Response = require("../models/responseSchema");
const Tag = require("../models/tagSchema");

appRouter.post("/generate/feedback", async (req, res) => {
	const { question, customerSentiment, productServiceDescription } = req.body;
	/*
            very happy
            happy
            neutral
            unhappy
            very unhappy
*/

	try {
		const gptCommand =
			"Create insightful feedback, from the customer's personal view, according to the service/product description and according to the customer's sentiment.";
		const gptConfig = {
			engine: "davinci-instruct-beta",
			prompt: `${gptCommand}\n\nservice/product description:\n${productServiceDescription}\n\nquestion for the customer:\n${question}\n\ncustomer's sentiment:\n${customerSentiment}\n\nthe customer feedback:\n`,
			maxTokens: 100,
			temperature: 0.7,
			topP: 1,
			presencePenalty: 0,
			frequencyPenalty: 1,
			bestOf: 1,
			n: 1,
			stream: false,
			userId: "1a69aa0c-cb7b-11eb-b8bc-0242ac130003",
			stop: ["\n\n"],
		};

		// config to evaluate the risk group of the given input
		const gptSafetyConfig = {
			engine: "content-filter-alpha-c4",
			prompt: `<|endoftext|>${question}\n--\nLabel:`,
			maxTokens: 1,
			temperature: 0,
			topP: 1,
			logProps: 10,
			presencePenalty: 0,
			frequencyPenalty: 0,
			userId: "1a69aa0c-cb7b-11eb-b8bc-0242ac130003",
		};

		// flag the input text for it's risk group
		const gptSafetyFlag = await openai.complete(gptSafetyConfig);

		// throws an Error if the input is flagged a 2
		if (gptSafetyFlag.data.choices[0].text === "2") {
			throw new Error("The Input is too risky!");
		}
		// complete the text according to the user's config.
		const gptOutput = await openai.complete(gptConfig);
		const output = gptOutput.data.choices[0].text;

		res.status(200).send({
			payload: {
				feedbackSuggestion: output,
			},
		});
	} catch (err) {
		res.status(400).send({ payload: { message: err.message } });
	}
});

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
		const sort = {};
	
		if (req.query.sortBy) {
		  const parts = req.query.sortBy.split('_');
		  sort[parts[0]] = parts[1] === 'asc' ? 1 : -1;
		}
	
		await req.user
		  .populate({
			path: 'documents',
			options: {
			  limit: parseInt(req.query.limit, 10),
			  skip: parseInt(req.query.skip, 10),
			  sort,
			},
		  })
		  .execPopulate();
	
		res.status(201).send({payload: { documents}});
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
		const sort = {};
	
		if (req.query.sortBy) {
		  const parts = req.query.sortBy.split('_');
		  sort[parts[0]] = parts[1] === 'asc' ? 1 : -1;
		}
	
		await req.user
		  .populate({
			path: 'documents',
			options: {
			  limit: parseInt(req.query.limit, 10),
			  skip: parseInt(req.query.skip, 10),
			  sort,
			},
		  })
		  .execPopulate();
	
		res.status(201).send({payload: { tags}});
	} catch (err) {
		res.status(400).send({ payload: { message: err.message } });
	}
});

module.exports = appRouter;
