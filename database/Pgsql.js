const Pool = require('pg-pool')
const Database = require('IDatabase')

module.exports = class Pgsql extends Database {
    constructor() {
        super();
        this.connection = await this.connect()
    }

    async connect() {
        const config = {
            database: process.env.PGSQL_DATABASE,
            user: process.env.PGSQL_USER,
            password: process.env.PGSQL_PASSWORD,
            port: process.env.PGSQL_PORT,
            max: 20,
            idleTimeoutMillis: 1000,
            connectionTimeoutMillis: 1000,
            maxUses: 7500,
        };
        const pool = new Pool(config);
        return await pool.connect();
    }

    private async query(sql, params) {
        try {
            return await new Promise((resolve, reject) => {
                this.connection.query(sql, params, (err, res) => {
                    connection.release();
                    if (err)
                        reject(err);
                    else
                        resolve(res);
                });
                this.connection.on('error', (err) => {
                    reject(err);
                });
            });
        } catch (e) {
            throw e;
        }
    }

    async insert(model, data) {
        const query = 'INSERT INTO ' + model + ' VALUES ($1)';
        return await this.query(query, [...data])
    }

    async updateById(model, id, options = {}) {
        const toSet = options.concat(options.map(([prop, val]) => {
            return `${prop} = ${val}`
        }));
        const query = 'UPDATE ' + model + ' SET ' + toSet.join(' AND ') + ' WHERE id = $1'
        console.log(query);
        return await this.query(query, id);
    }

    async update(model, filters = {}, options= {}) {
        const retrieve = await this.findOne(model, filters, options);
        return await this.updateById(model, retrieve.id, options);
    }

    async removeById(model, id, options = {}) {
        const query = 'DELETE FROM ' + model + ' WHERE id = $1';
        return await this.query(query, id);
    }

    async remove(model, filters = {}, options= {}) {
        const retrieve = await this.findOne(model, filters, options);
        return await this.removeById(model, retrieve.id, options);
    }

    async find(model, filters = {}, options = {}) {
        const toSet = filters.concat(filters.map(([prop, val]) => {
            return `${prop} = ${val}`
        }));
        const query = 'SELECT ' + (...options || '*') + ' FROM ' + model + toSet.join(' AND ');
        return await this.query(query, [])
    }

    async findById(model, id, options = {}) {
        const query = 'SELECT ' + (...options || '*') + ' FROM ' + model + ' WHERE id = $1';
        return await this.query(query, id);
    }

    async findOne(model, filters = {}, options= {}) {
        return (await this.find(model, filters, options))[0];
    }
}
