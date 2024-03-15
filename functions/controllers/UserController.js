const admin = require('firebase-admin');


/*const createUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        console.log(email, password);
        const userRecord = await admin.auth().createUser({
            email,
            password
        });
        console.log('Successfully created new user:', userRecord.uid);
        res.status(201).send('User created successfully');
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send('Error creating user');
    }
};*/

const createUser = async (req, res) => {
    const { email, password, age, location, username } = req.body;
    try {
        // Create user in Firebase Authentication
        const userRecord = await admin.auth().createUser({
            email,
            password
        });
        console.log('Successfully created new user:', userRecord.uid);

        // Store additional user data in Firestore
        await admin.firestore().collection('Players').doc(userRecord.uid).set({
            email,
            age,
            location,
            username
        });

        res.status(201).send('User created successfully');
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send('Error creating user');
    }
};
const getUser = async (req, res) => {
    const { uid } = req.params;

    try {
        const userRecord = await admin.auth().getUser(uid);
        console.log('Successfully fetched user data:', userRecord.toJSON());
        res.status(200).json(userRecord.toJSON());
    } catch (error) {
        console.error('Error fetching user data:', error);
        console.log("error heere");
        res.status(404).send('User not found');
    }
};

const getAllUsers = async (req, res) => {
    try {
        const listUsersResult = await admin.auth().listUsers();
        const users = listUsersResult.users.map(userRecord => userRecord.toJSON());
        console.log('Successfully fetched users data:', users);
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users data:', error);
        res.status(500).send('Error fetching users');
    }
};



module.exports = {
    createUser,
    getUser,
    getAllUsers
};
