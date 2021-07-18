const express = require("express");
const statisticsRouter = new express.Router();
const auth = require("../middlewares/auth");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
//schemes
const Form = require("../models/formSchema");
const Response = require("../models/responseSchema");
const User = require("../models/userDocument");

statisticsRouter.get(
	"/v1/statistics/reviews/:formId/:interval",
	auth,
	async (req, res) => {
		try {
			const { interval, formId } = req.params;
			//let { start, end } = req.query;
			const start = new Date(2021, 6, 18);
			const end = new Date(2021, 7, 19);
			// const responses = await Response.find({
			// 	formId: req.params.formId,
			// });

			/*
			 * RESPONSE COUNT
			 * FILTER BY WEEK, NO DELTA
			 */

			const responseCountWeeklyQuery = await Response.aggregate([
				{
					$match: {
						createdAt: {
							$gte: start,
							$lte: end,
						},
						formId: ObjectId(formId),
					},
				},
				{
					$group: {
						_id: { $week: "$createdAt" },
						count: { $sum: 1 },
						first: { $min: "$createdAt" },
					},
				},
				{ $sort: { first: 1 } },
				{
					$project: {
						weekNumber: "$_id",
						responseCountWeekly: "$count",
						date: "$first",
						_id: false,
					},
				},
			]);

			/*
			 * RESPONSE COUNT
			 * FILTER DAILY, NO DELTA
			 */
			const responseCountDailyQuery = await Response.aggregate([
				{
					$match: {
						createdAt: {
							$gte: start,
							$lte: end,
						},
						formId: ObjectId(formId),
					},
				},
				{
					$group: {
						_id: { $dayOfYear: "$createdAt" },
						count: { $sum: 1 },
						first: { $min: "$createdAt" },
					},
				},

				{ $sort: { first: 1 } },
				{
					$project: {
						dayNumber: "$_id",
						responseCountDaily: "$count",
						date: "$first",
						_id: false,
					},
				},
			]);

			/*
			 * RESPONSE AVERAGE
			 * FILTER DAILY, NO DELTA
			 */
			const averageRatingDailyQuery = await Response.aggregate([
				{
					$match: {
						createdAt: {
							$gte: start,
							$lte: end,
						},
						formId: ObjectId(formId),
					},
				},
				{ $unwind: "$questionResponses" },
				{
					$group: {
						_id: { $dayOfYear: "$createdAt" },
						averageRatingDaily: {
							$avg: "$questionResponses.rating",
						},
						first: { $min: "$createdAt" },
					},
				},
				{ $sort: { first: 1 } },
				{
					$project: {
						dayNumber: "$_id",
						date: "$first",
						_id: false,
						averageRatingDaily: "$averageRating",
					},
				},
			]);

			/*
			 * RESPONSE AVERAGE
			 * FILTER BY WEEK, NO DELTA
			 */

			const averageRatingWeeklyQuery = await Response.aggregate([
				{
					$match: {
						createdAt: {
							$gte: start,
							$lte: end,
						},
						formId: ObjectId(formId),
					},
				},
				{
					$group: {
						_id: { $week: "$createdAt" },
						count: { $sum: 1 },
						first: { $min: "$createdAt" },
					},
				},
				{ $sort: { first: 1 } },
				{
					$project: {
						weekNumber: "$_id",
						averageRatingWeekly: "$count",
						date: "$first",
						_id: false,
					},
				},
			]);

			res.status(201).send({
				payload: {
					filterParameters: {
						interval,
						start,
						end,
						formId,
					},
					reviewsCount: {
						averageResponseRatingDaily: averageRatingDailyQuery,
						averageRatingWeekly: averageRatingWeeklyQuery,
						responseCountDaily: responseCountDailyQuery,
						responseCountWeekly: responseCountWeeklyQuery,
					},
					averageRating: {},
				},
			});
		} catch (err) {
			res.status(400).send({ payload: { message: err.message } });
		}
	}
);

module.exports = statisticsRouter;
