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
} = require('./controllers/attendance');

// MIDDLEWARES
var isAuth = require('./middlewares/isAuth');
var isNotCCI = require('./middlewares/isNotCCI');
var isCorrectCCI = require('./middlewares/isCorrectCCI');
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

app.get('/child/:id', [isAuth, isCorrectCCI], getChild);

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

app.get('/cci/children', [isAuth, isCorrectCCI], getChildrenInCCI);

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
			// check if child was added to their cci
			if (!beforeData.cci && afterData.cci) {
				// cci was added to the child. so notify the cci
				let x = await db.collection('notification').add({
					// create the notification
					createdAt: new Date().toISOString(),
					recipients: afterData.cci,
					sender: change.after.id,
					read: false,
					type: 'ChildAddedToCCI',
				});
				return;
			}

			if (beforeData.cci !== afterData.cci) {
				// cci was changed so notify the cci
				let x = await db.collection('notification').add({
					// create the notification
					createdAt: new Date().toISOString(),
					recipients: [afterData.cci],
					sender: change.after.id,
					read: false,
					type: 'ChildAddedToCCI',
				});
				return;
			}

			// if child data was updated

			if (afterData.cci) {
				let x = await db.collection('notification').add({
					// create the notification
					createdAt: new Date().toISOString(),
					recipients: [afterData.cci],
					sender: change.after.id,
					read: false,
					type: 'ChildDataUpdated',
				});
				return;
			}

			if (
				(!beforeData.review && afterData.review) ||
				beforeData.review !== afterData.review
			) {
				console.log('inside the sentiment analysis listener');
				// perform sentiment analysis
				var Analyzer = require('natural').SentimentAnalyzer;
				var stemmer = require('natural').PorterStemmer;
				var analyzer = new Analyzer('English', stemmer, 'afinn');
				// getSentiment expects an array of strings

				let data = afterData.review;

				// remove punctuations
				data = data.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');

				data = data.split(' ');

				let sentimentValue = analyzer.getSentiment(data);
				console.log('got the sentiment value');
				console.log(`value is : ${sentimentValue}`);
				let doc = await db
					.doc(`children/${change.after.id}`)
					.update({ sentiment: sentimentValue });
				return;
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
		});
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
