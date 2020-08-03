const functions = require('firebase-functions');
// var admin = require('firebase-admin');
const { body } = require('express-validator');
const cors = require('cors');

const express = require('express');
const app = express();

app.use(cors());

/**
 * we use
 * firestore
 * storage bucket
 * authentication
 *
 */

const {
	getLogin,
	postSignup,
	postLogin,
	newGetLogin,
	newnewGetlogin,
} = require('./controllers/authentication');

const { admin, db } = require('./firebaseadmin');

const firebase = require('./firebaseConfig');

// CONTROLLERS

const {
	createChild,
	updateChild,
	getChild,
	getNotPlacedChildren,
} = require('./controllers/child');
const { uploadFiles } = require('./controllers/fileUpload');
const {
	createCCI,
	editCCI,
	getCCI,
	uploadCCIFiles,
	getChildrenInCCI,
} = require('./controllers/cci');
const {
	postCCIRating,
	postReview,
	postTextToSpeech,
} = require('./controllers/kiosk');
const {
	createEmployee,
	editEmployee,
	getEmployee,
	uploadEmployeeFiles,
} = require('./controllers/employee');
const {
	createGuardian,
	updateGuardian,
	getGuardian,
} = require('./controllers/guardian');
const {
	getDCPU,
	getDCPUs,
	createDCPU,
	editDCPU,
	deleteDCPU,
} = require('./controllers/dcpu');
const {
	getCWC,
	createCWC,
	editCWC,
	deleteCWC,
	getCWCs,
} = require('./controllers/cwc');
const {
	createPO,
	editPO,
	deletePO,
	getPOs,
	getPO,
} = require('./controllers/po');
const { markNotificationsRead } = require('./controllers/notifications');
const {
	getChildrenData,
	uploadAttendance,
	postGuardianVisit,
	getVisits,
} = require('./controllers/attendance');

const { sendMessage, getMessages } = require('./controllers/message');

// MIDDLEWARES
var isAuth = require('./middlewares/isAuth');
var isNotCCI = require('./middlewares/isNotCCI');
// var isCorrectCCI = require('./middlewares/isCorrectCCI');
var { isCorrectDCPU, isDCPU } = require('./middlewares/isDCPU');
var isAdmin = require('./middlewares/isAdmin');

// TODO: validation
// returns the list of organisations in the db
/**
 * example response = 
 * {
    "cwc": [
        "S2RXMzLQrkf9UWWQmTFq",
        "chennai-cwc1"
    ],
    "cci": [
        "chennai-cci1"
    ],
    "dcpu": [
        "WaMhgeFtHnKMxr98nXwI",
        "chennai-dcpu1"
    ]
}
 */
app.get('/login', getLogin);
app.post('/getLogin', newnewGetlogin);

// signup route
// TODO: Validation
app.post(
	'/signup',
	[
		body('email').isEmail().withMessage('Email must be valid'),
		body('password')
			.trim()
			.isLength({ min: 6, max: 20 })
			.withMessage('Password must be between 6 and 20 characters'),
	],
	postSignup
);

//LOGIN ROUTE
/**
 * req.body = {
    email: String,
    password: String,
    role: "CCI" | "CWC" | "DCPU" | "PO",
    organisation: String
}
 */
app.post(
	'/login',
	[
		body('email').isEmail().withMessage('Email must be valid'),
		body('password')
			.trim()
			.isLength({ min: 6, max: 20 })
			.withMessage('Password must be between 6 and 20 characters'),
		body('role').notEmpty().withMessage('Must contain role property'),
		// body('organisation')
		// 	.notEmpty()
		// 	.withMessage('Must contain organisation property'),
	],
	postLogin
);

// create a new child in the database
app.post('/child', [isAuth, isNotCCI], createChild);

// update a child's data
app.put('/child/:id', [isAuth, isNotCCI], updateChild);

// Upload child data : cannot be accessed by CCI
app.post('/child/:id/upload/:type', [isAuth, isNotCCI], uploadFiles);

// get data about a child
// CCIs : CCI can only access child
app.get('/child/notplaced', [isAuth], getNotPlacedChildren);

app.get('/child/:id', [isAuth], getChild);

// Create a new CCI
// only allowed to DCPUs in the same district
/**
req.body = {
    district: String,
    cciName: String,
    cwc: String,
    classification: "GOVT" | "NGO",
    inChargeName: String,
    inCharge: String,
    state: String,
}
 */
app.post(
	'/cci',
	[
		body('district')
			.exists()
			.notEmpty()
			.withMessage('Must contain district field'),
		body('cciName')
			.exists()
			.notEmpty()
			.withMessage('Must contain CCI Name'),
		body('dcpu').exists().notEmpty().withMessage('Must contain DCPU field'),
		body('classification')
			.exists()
			.notEmpty()
			.withMessage('Must contain classification field'),
		body('inCharge')
			.exists()
			.notEmpty()
			.withMessage('Must contain inCharge field'),
		body('inChargeName')
			.exists()
			.notEmpty()
			.withMessage('Must contain inChargeName field'),
		body('state')
			.exists()
			.notEmpty()
			.withMessage('Must contain state field'),
		isAuth,
		isNotCCI,
		isDCPU,
		isCorrectDCPU,
	],
	createCCI
);

app.get('/cci/children', [isAuth], getChildrenInCCI);

// req.body = {
//     district: String
// }
app.put(
	'/cci/:id',
	[
		body('district')
			.exists()
			.notEmpty()
			.withMessage('Must contain district field'),
		isAuth,
		isNotCCI,
		isDCPU,
		isCorrectDCPU,
	],
	editCCI
);

app.get('/cci/:id', [isAuth], getCCI);

app.post(
	'/cci/:id/upload/:district/:type',
	[isAuth, isNotCCI, isDCPU],
	uploadCCIFiles
);

// employee routes
app.post(
	'/employees',
	[
		body('name')
			.exists()
			.notEmpty()
			.withMessage('Must have a name property'),
		body('district')
			.exists()
			.notEmpty()
			.withMessage('Must have a district property'),
		isAuth,
		isDCPU,
		isCorrectDCPU,
	],
	createEmployee
);

app.put(
	'/employees/:id',
	[
		body('district')
			.exists()
			.notEmpty()
			.withMessage('Must have a district property'),
		isAuth,
		isDCPU,
		isCorrectDCPU,
	],
	editEmployee
);

app.get('/employees/:id', [isAuth], getEmployee);

// can be any type of file. Itll be associated with the employee
app.post(
	'/employees/:id/upload/:district/:type',
	[isAuth, isDCPU],
	uploadEmployeeFiles
);

// GUARDIAN ROUTES
// childId
app.get('/guardian/:id', [isAuth], getGuardian);

app.post(
	'/guardian/:id',
	[
		body('name')
			.exists()
			.notEmpty()
			.withMessage('Must have a name property'),
		isAuth,
		isNotCCI,
	],
	createGuardian
);

app.put('/guardian/:id', [isAuth, isNotCCI], updateGuardian);

// DCPU ROUTES

app.get('/dcpu/:id', [isAuth, isNotCCI], getDCPU);

// populates dcpu - employees in the dcpu, inCharge and CCIs
app.get('/dcpu', [isAuth, isNotCCI], getDCPUs);

// body = {
// 	district: String,
// 	name: String,
// 	inCharge: String,
// 	inChargeName: String
// }
app.post(
	'/dcpu',
	[
		body('district')
			.exists()
			.notEmpty()
			.withMessage('Must have a district property'),
		body('name')
			.exists()
			.notEmpty()
			.withMessage('Must have a name property'),
		body('inCharge')
			.exists()
			.notEmpty()
			.withMessage('Must have a inCharge property'),
		body('inChargeName')
			.exists()
			.notEmpty()
			.withMessage('Must have a inChargeName property'),
		isAuth,
		isAdmin,
	],
	createDCPU
);

app.put('/dcpu/:id', [isAuth, isAdmin], editDCPU);

app.delete('/dcpu/:id', [isAuth, isAdmin], deleteDCPU);

// CWC CRUD
app.get('/cwc/:id', [isAuth, isNotCCI], getCWC);

app.get('/cwc', [isAuth, isNotCCI], getCWCs);

app.post(
	'/cwc',
	[
		body('district')
			.exists()
			.notEmpty()
			.withMessage('Must have a district property'),
		body('name')
			.exists()
			.notEmpty()
			.withMessage('Must have a name property'),
		body('inCharge')
			.exists()
			.notEmpty()
			.withMessage('Must have a inCharge property'),
		body('inChargeName')
			.exists()
			.notEmpty()
			.withMessage('Must have a inChargeName property'),
		isAuth,
		isAdmin,
	],
	createCWC
);

app.put('/cwc/:id', [isAuth, isAdmin], editCWC);

app.delete('/cwc/:id', [isAuth, isAdmin], deleteCWC);

// PO CRUD

app.post(
	'/po',
	[
		body('district')
			.exists()
			.notEmpty()
			.withMessage('Must have a district property'),
		body('name')
			.exists()
			.notEmpty()
			.withMessage('Must have a name property'),
		isAuth,
		isAdmin,
	],
	createPO
);

app.put('/po/:id', [isAuth, isAdmin], editPO);

app.delete('/po/:id', [isAuth, isAdmin], deletePO);

app.get('/po/:id', [isAuth, isNotCCI], getPO);
app.get('/po', [isAuth, isNotCCI], getPOs);

app.post('/notifications', [isAuth], markNotificationsRead);

// TODO: ATTENDANCE ROUTES
app.get('/attendance/children', getChildrenData);

app.post('/attendance/children', uploadAttendance);

app.post('/message', [isAuth], sendMessage);

app.get('/message', [isAuth], getMessages);

app.get('/attendance/guardians', getVisits);

app.post('/attendance/guardians', postGuardianVisit);

app.post('/kiosk', postCCIRating);

app.post('/kiosk/feedback', postReview);

app.post('/kiosk/tts', postTextToSpeech);

// exports.api = functions.https.onRequest(app);
exports.api = functions.region('asia-east2').https.onRequest(app);

exports.createNotificationOnCCICreate = functions
	.region('asia-east2')
	.firestore.document('cci/{id}')
	.onCreate(async (snapshot, context) => {
		try {
			console.log(context);
			console.log(snapshot);

			// notify CWC, DCPU and PO in the district

			//dcpu
			let dcpuDoc = await db
				.collection('dcpu')
				.where('district', '==', snapshot.data().district)
				.get();
			let dcpuIds = [];
			for (const dcpu of dcpuDoc.docs) {
				if (snapshot.data().createdBy === dcpu) {
					continue;
				}
				dcpuIds.push(dcpu.id);
			}

			// cwc
			let cwcDoc = await db
				.collection('cwc')
				.where('district', '==', snapshot.data().district)
				.get();
			let cwcIds = [];
			for (const cwc of cwcDoc.docs) {
				cwcIds.push(cwc.id);
			}

			//po
			let poDoc = await db
				.collection('po')
				.where('district', '==', snapshot.data().district)
				.get();
			let poIds = [];
			for (const cwc of poDoc.docs) {
				poIds.push(cwc.id);
			}

			let x = await db.collection('notification').add({
				// create the notification
				createdAt: new Date().toISOString(),
				recipients: [...dcpuIds, ...cwcIds, ...poIds],
				sender: snapshot.id,
				read: false,
				type: 'CCICreation',
				message: `A CCI has been created in your district. Please take a look`,
				link: `/cci/${snapshot.id}`,
			});
		} catch (err) {
			console.error(err);
			return;
		}
	});

exports.createNotificationOnChildAdded = functions
	.region('asia-east2')
	.firestore.document('children/{id}')
	.onUpdate(async (change, context) => {
		try {
			let afterData = change.after.data();
			let beforeData = change.before.data();

			var Analyzer = require('natural').SentimentAnalyzer;
			var stemmer = require('natural').PorterStemmer;

			performSentiment = async (data) => {
				console.log('inside the sentiment analysis listener');
				// perform sentiment analysis

				var analyzer = new Analyzer('English', stemmer, 'afinn');
				// // getSentiment expects an array of strings

				// data = afterData.review;

				// remove punctuations

				data = data.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');

				data = data.split(' ');

				let sentimentValue = analyzer.getSentiment(data);
				console.log('got the sentiment value');
				console.log(`value is : ${sentimentValue}`);
				return sentimentValue;

				// let doc = await db
				// 	.doc(`children/${change.after.id}`)
				// 	.update({ sentiment: sentimentValue.toString() });
			};

			// if child data was updated
			if (afterData.cci) {
				let x = await db.collection('notification').add({
					// create the notification
					createdAt: new Date().toISOString(),
					recipients: [afterData.cci],
					sender: change.after.id,
					read: false,
					type: 'ChildDataUpdated',
					message: `A child's information in your CCI has be updated. Please take a look`,
					link: `/child/${change.after.id}`,
				});
			}

			// check if child was added to their cci
			// if (!beforeData.cci && afterData.cci) {
			// 	// cci was added to the child. so notify the cci
			// 	let x = await db.collection('notification').add({
			// 		// create the notification
			// 		createdAt: new Date().toISOString(),
			// 		recipients: afterData.cci,
			// 		sender: change.after.id,
			// 		read: false,
			// 		type: 'ChildAddedToCCI',
			// 		message: `A Child has been added to your CCI. Please take a look`,
			// 		link: `/child/${change.after.id}`,
			// 	});
			// 	return;
			// }

			if (
				(!beforeData.cci && afterData.cci) ||
				beforeData.cci !== afterData.cci
			) {
				let doc = await db.doc(`children/${change.after.id}`).update({
					previousInstitutions: admin.firestore.FieldValue.arrayUnion(
						beforeData.cci
					),
				});

				// cci was changed so notify the cci
				let x = await db.collection('notification').add({
					// create the notification
					createdAt: new Date().toISOString(),
					recipients: [afterData.cci],
					sender: change.after.id,
					read: false,
					type: 'ChildAddedToCCI',
					message: `A Child has been added to your CCI. Please take a look`,
					link: `/child/${change.after.id}`,
				});
				// performSentiment();
				return;
			}

			// if (
			// 	(!beforeData.review && afterData.review) ||
			// 	beforeData.review !== afterData.review
			// ) {
			// 	performSentiment();
			// }

			// new sentiment analysis

			if (
				(!beforeData.reviews && afterData.reviews) ||
				beforeData.reviews.length !== afterData.reviews.length
			) {
				// perform sentiment analysis
				console.log('secret secret');

				let sentiments = [],
					total = 0;
				for (let i = 0; i < afterData.reviews.length; i++) {
					let review = afterData.reviews[i];
					let sentiment = await performSentiment(review);
					total += sentiment;
					sentiments.push(sentiment.toFixed(2).toString());
				}
				let sentiment = total / afterData.reviews.length;
				sentiment.toFixed(2);
				let doc = await db.doc(`children/${change.after.id}`).update({
					sentiments: [...sentiments],
					sentiment: sentiment.toFixed(2).toString(),
				});
			}
		} catch (err) {
			return;
		}
	});

exports.createNotificationOnDCPUCreated = functions
	.region('asia-east2')
	.firestore.document('dcpu/{id}')
	.onCreate(async (snapshot, context) => {
		let dcpuDoc = await db
			.collection('dcpu')
			.where('district', '==', snapshot.data().district)
			.get();
		let dcpuIds = [];
		for (const dcpu of dcpuDoc.docs) {
			if (snapshot.data().createdBy === dcpu) {
				continue;
			}
			dcpuIds.push(dcpu.id);
		}

		// cwc
		let cwcDoc = await db
			.collection('cwc')
			.where('district', '==', snapshot.data().district)
			.get();
		let cwcIds = [];
		for (const cwc of cwcDoc.docs) {
			cwcIds.push(cwc.id);
		}

		//po
		let poDoc = await db
			.collection('po')
			.where('district', '==', snapshot.data().district)
			.get();
		let poIds = [];
		for (const cwc of poDoc.docs) {
			poIds.push(cwc.id);
		}

		let x = await db.collection('notification').add({
			// create the notification
			createdAt: new Date().toISOString(),
			recipients: [...dcpuIds, ...cwcIds, ...poIds],
			sender: snapshot.id,
			read: false,
			type: 'DCPUCreation',
			message:
				'A new DCPU has been established to your district. Please take a look',
			link: `/dcpu/${change.after.id}`,
		});
	});

exports.createNotificationOnCWCCreated = functions
	.region('asia-east2')
	.firestore.document('cwc/{id}')
	.onCreate(async (snapshot, context) => {
		let dcpuDoc = await db
			.collection('dcpu')
			.where('district', '==', snapshot.data().district)
			.get();
		let dcpuIds = [];
		for (const dcpu of dcpuDoc.docs) {
			if (snapshot.data().createdBy === dcpu) {
				continue;
			}
			dcpuIds.push(dcpu.id);
		}

		// cwc
		let cwcDoc = await db
			.collection('cwc')
			.where('district', '==', snapshot.data().district)
			.get();
		let cwcIds = [];
		for (const cwc of cwcDoc.docs) {
			cwcIds.push(cwc.id);
		}

		//po
		let poDoc = await db
			.collection('po')
			.where('district', '==', snapshot.data().district)
			.get();
		let poIds = [];
		for (const cwc of poDoc.docs) {
			poIds.push(cwc.id);
		}

		let x = await db.collection('notification').add({
			// create the notification
			createdAt: new Date().toISOString(),
			recipients: [...dcpuIds, ...cwcIds, ...poIds],
			sender: snapshot.id,
			read: false,
			type: 'CWCCreation',
			message:
				'A new CWC has been established to your district. Please take a look',
			link: `/cwc/${change.after.id}`,
		});
	});

exports.createNotificationOnPOCreated = functions
	.region('asia-east2')
	.firestore.document('po/{id}')
	.onCreate(async (snapshot, context) => {
		let dcpuDoc = await db
			.collection('dcpu')
			.where('district', '==', snapshot.data().district)
			.get();
		let dcpuIds = [];
		for (const dcpu of dcpuDoc.docs) {
			if (snapshot.data().createdBy === dcpu) {
				continue;
			}
			dcpuIds.push(dcpu.id);
		}

		// cwc
		let cwcDoc = await db
			.collection('cwc')
			.where('district', '==', snapshot.data().district)
			.get();
		let cwcIds = [];
		for (const cwc of cwcDoc.docs) {
			cwcIds.push(cwc.id);
		}

		//po
		let poDoc = await db
			.collection('po')
			.where('district', '==', snapshot.data().district)
			.get();
		let poIds = [];
		for (const cwc of poDoc.docs) {
			poIds.push(cwc.id);
		}

		let x = await db.collection('notification').add({
			// create the notification
			createdAt: new Date().toISOString(),
			recipients: [...dcpuIds, ...cwcIds, ...poIds],
			sender: snapshot.id,
			read: false,
			type: 'POCreation',
			message:
				'A new Probation officer has been appointed to your district. Please take a look',
			link: `/po/${change.after.id}`,
		});
	});

exports.createNotificationOnCCIUpdated = functions
	.region('asia-east2')
	.firestore.document('cci/{id}')
	.onUpdate(async (change, context) => {
		// code
		// notify the cci which was updated
		let x = await db.collection('notification').add({
			// create the notification
			createdAt: new Date().toISOString(),
			recipients: [change.after.id],
			sender: change.after.id,
			read: false,
			type: 'CCIUpdated',
			message: 'Your data has been updated. Please take a look',
			link: `/cci/${change.after.id}`,
		});

		try {
			let afterData = change.after.data();
			let beforeData = change.before.data();

			var Analyzer = require('natural').SentimentAnalyzer;
			var stemmer = require('natural').PorterStemmer;

			performSentiment = async (data) => {
				console.log('inside the sentiment analysis listener');
				// perform sentiment analysis

				var analyzer = new Analyzer('English', stemmer, 'afinn');
				// // getSentiment expects an array of strings

				// data = afterData.review;

				// remove punctuations

				data = data.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');

				data = data.split(' ');

				let sentimentValue = analyzer.getSentiment(data);
				console.log('got the sentiment value');
				console.log(`value is : ${sentimentValue}`);
				return sentimentValue;

				// let doc = await db
				// 	.doc(`children/${change.after.id}`)
				// 	.update({ sentiment: sentimentValue.toString() });
			};

			if (
				(!beforeData.reviews && afterData.reviews) ||
				beforeData.reviews.length !== afterData.reviews.length
			) {
				// perform sentiment analysis
				console.log('secret secret');

				let sentiments = [],
					total = 0;
				for (let i = 0; i < afterData.reviews.length; i++) {
					let review = afterData.reviews[i];
					let sentiment = await performSentiment(review);
					total += sentiment;
					sentiments.push(sentiment.toFixed(2).toString());
				}
				let sentiment = total / afterData.reviews.length;

				let doc = await db.doc(`cci/${change.after.id}`).update({
					sentiment: sentiment.toFixed(2).toString(),
					sentiments: [...sentiments],
				});
			}
		} catch (err) {
			return;
		}
	});

exports.createNotificationOnMessageCreated = functions
	.region('asia-east2')
	.firestore.document('message/{id}')
	.onCreate(async (snapshot, context) => {
		// code
		let data = snapshot.data();

		let resp = await db.collection('notification').add({
			createdAt: new Date().toISOString(),
			recipients: [data.receiver],
			sender: data.sender,
			read: false,
			type: 'MessageSent',
			message: `${data.sender} just sent you a message. Please take a look`,
			link: `/message`,
		});
		return;
	});

// firebase pubsub functions

const twilio = require('twilio');
const accountSid = functions.config().twilio.sid;
const authToken = functions.config().twilio.token;

const client = new twilio(accountSid, authToken);

const twilioNumber = '+12058507105';

// exports.taskRunner = functions
// 	.region('asia-east2')
// 	.pubsub.schedule('* * * * *')
// 	.onRun(async (context) => {
// 		// this runs every 1 minute
// 		const now = new Date().toISOString();
// 		const query = db.collection('visits').where('startTime', '<=', now);
// 		const tasks = await query.get();

// 		const jobs = [];

// 		// tasks.forEach(snapshot => {
// 		// 	let { guardianId } = snapshot.data();
// 		// 	let guardianDoc = await db.doc(`/guardian/${guardianId}`).get();

// 		// })

// 		// makeCall = (number) => {
// 		// 	const textMessage = {
// 		// 		body: 'give appropriate content',
// 		// 		to: number,
// 		// 		from: twilioNumber,
// 		// 	};

// 		// 	return client.messages.create(textMessage);
// 		// };

// 		tasks.forEach(async (snapshot) => {
// 			let { guardianId } = snapshot.data();
// 			let guardianDoc = await db.doc(`guardians/${guardianId}`).get();
// 			if (guardianDoc.exists) {
// 				let data = guardianDoc.data();
// 				if (data.phoneNumber) {
// 					let number = `+91${data.phoneNumber}`;
// 					if (/^\+?[1-9]\d{1,14}$/.test(number)) {
// 						// number is valid
// 						// do the call
// 						let job = makeCall(number);
// 						jobs.push(job);
// 					} else {
// 						return;
// 					}
// 				}
// 			}
// 		});

// 		return await Promise.all(jobs);
// 	});

// 0 0 * * 0 - every week

// lastVisitedUpdate
exports.guardianVisitsCronJob = functions
	.region('asia-east2')
	.pubsub.schedule('* * * * *')
	.onRun(async (context) => {
		// run this function to calculate whether the guardian is visiting or not
		let now = new Date();
		console.log('inside the cron job');
		try {
			let guardianDocs = await db.collection('guardians').get();

			let dcpuDoc = await db.collection('dcpu').get();
			let dcpus = dcpuDoc.docs;
			console.log('got dcpu data');

			// guardianDocs.forEach(el => el.)

			for (const guardianDoc of guardianDocs.docs) {
				let guardianData = guardianDoc.data();

				console.log('im ehere');

				let lastVisited = guardianData['lastVisited']; // should be an ISOString
				if (lastVisited) {
					let dcpuIds = [];
					for (const dcpu of dcpus) {
						dcpuIds.push(dcpu.id);
					}
					console.log('got dcpu ids array', dcpuIds);

					const date1 = new Date(lastVisited);
					const date2 = new Date();
					const diffTime = Math.abs(date2 - date1);
					const diffDays = Math.ceil(
						diffTime / (1000 * 60 * 60 * 24)
					);
					// console.log(diffTime + ' milliseconds');
					console.log(diffDays + ' days');
					if (
						// diffDays >= 60  => actual implementation
						diffDays >= 1
					) {
						// create notification
						let resp = await db.collection('notification').add({
							createdAt: new Date().toISOString(),
							recipients: [...dcpuIds],
							sender: guardianDoc.id,
							read: false,
							type: 'GuardianNotVisiting',
							message: `A Guardian has not visited his ward for the past ${diffDays} days. Please look into it`,
							link: `/guardian/${guardianDoc.id}`,
						});
					}
				}
			}
		} catch (err) {
			console.log(err);
			return;
		}
	});

// notifications for
// CCI created - DCPU, CWC and PO in the district are notified
// Child added to cci or data is updated - The CCI where the child is placed in is notified
// DCPU created - other DCPUs, POs and CWCs in the district are notified
// PO created - other DCPUs, POs and CWCs in the district are notified
// CWC created - other DCPUs, POs and CWCs in the district are notified
// CCI updated - that CCI is notified that their data was updated
// all updates
// all messages
// all deletes

exports.sendSMSOnVisitCreate = functions
	.region('asia-east2')
	.firestore.document('visits/{id}')
	.onCreate(async (snapshot, context) => {
		console.log('msg function');
		let makeCall = (number, data, startTime) => {
			console.log('inside helper function');
			let d = new Date(startTime);
			const textMessage = {
				body: `Dear ${
					data.name
				}, your appointment to visit your ward has been scheduled on ${d.toLocaleString()}`,
				to: number,
				from: twilioNumber,
			};

			return client.messages.create(textMessage);
		};

		try {
			let { guardianId, startTime } = snapshot.data();
			let guardianDoc = await db.doc(`guardians/${guardianId}`).get();
			console.log('get the guardiandoc function');

			if (guardianDoc.exists) {
				let data = guardianDoc.data();
				if (data.phoneNumber) {
					let number = `+91${data.phoneNumber}`;
					if (/^\+?[1-9]\d{1,14}$/.test(number)) {
						// number is valid
						// do the call
						console.log('inside if before calling');

						let job = await makeCall(number, data, startTime);
						console.log('after calling');

						let x = await snapshot.ref.update({
							status: 'SMS Sent',
						});
					} else {
						return;
					}
				}
			}
		} catch (err) {
			console.error(err);
			return;
		}
	});
