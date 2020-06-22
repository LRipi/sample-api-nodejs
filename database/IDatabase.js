module.exports = class IDatabase {
    connect() {
        throw new TypeError("Abstract methods cannot be called.")
    }

    async insert(model, data) {
        throw new TypeError("Abstract methods cannot be called.")
    }

    async updateById(model, id, options = {}) {
        throw new TypeError("Abstract methods cannot be called.")
    }

    async update(model, filters = {}, options= {}) {
        throw new TypeError("Abstract methods cannot be called.")
    }

    async removeById(model, id, options = {}) {
        throw new TypeError("Abstract methods cannot be called.")
    }

    async remove(model, filters = {}, options= {}) {
        throw new TypeError("Abstract methods cannot be called.")
    }

    async find(model, filters = {}, options = {}) {
        throw new TypeError("Abstract methods cannot be called.")
    }

    async findById(model, id, options = {}) {
        throw new TypeError("Abstract methods cannot be called.")
    }

    async findOne(model, filters = {}, options= {}) {
        throw new TypeError("Abstract methods cannot be called.")
    }
}
