const mongoose = require('mongoose')
const mongoURI = 'mongodb+srv://aryan-server:aryan_server_cluster_192.168.0.0.1@react.pi9pmgy.mongodb.net/inotebook'

const connectToMongo = () => {
    mongoose.connect(mongoURI).then(() => console.log("Database connected!")).catch(err => console.log(err));
}
module.exports = connectToMongo