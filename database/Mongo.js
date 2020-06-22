const mongoose = require('mongoose');
const Database = require('IDatabase')

class Mongo extends Database {
    constructor() {
        super();
        this.connect()
        this.connection = mongoose.connection
    }

    connect() {
        const mongoOptions = {
            uri: `mongodb://${process.env.MONGO_HOST}:27017/`,
            useNewUrlParser: true
        };

        mongoose.connect(mongoOptions.uri)
            .then(() => console.log('Server is connected to mongoDB.'))
            .catch((err) => throw err);
    }

    async insert(model, data) {
        return await new model(data).save();
    }

    async updateById(model, id, options = {}) {
        return model.findByIdAndUpdate(id, options);
    }

    async update(model, filters = {}, options= {}) {
        return model.findOneAndUpdate(filters, options);
    }

    async removeById(model, id, options = {}) {
        return model.findByIdAndRemove(id, options);
    }

    async remove(model, filters = {}, options= {}) {
        return model.findOneAndRemove(filters, options);
    }

    async find(model, filters = {}, options = {}) {
        return model.find(filters, null, options);
    }

    async findById(model, id, options = {}) {
        return model.findById(id, null, options);
    }

    async findOne(model, filters = {}, options= {}) {
        return model.findOne(filters, null, options);
    }
}
