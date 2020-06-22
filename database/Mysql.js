const mysql = require('mysql');
const Database = require('IDatabase')
const MysqlPoolBooster = require('mysql-pool-booster');
MysqlPoolBooster(mysql);

require('events').EventEmitter.defaultMaxListeners = 30;

module.exports = class Mysql extends Database {
    constructor() {
        super();
        this.pool = this.connect();
        if (process.env.DEBUG === 'true') {
            this.pool.on('acquire', function (connection) {
                console.log("[\x1b[31mMYSQL_POOL\x1b[0m] Connection %d acquired", connection.threadId);
            })
                .on('enqueue', function () {
                    console.log("[\x1b[31mMYSQL_POOL\x1b[0m] Waiting for available slot");
                })
                .on('release', function (connection) {
                    console.log("[\x1b[31mMYSQL_POOL\x1b[0m] Connection %d released", connection.threadId);
                })
                .on('eviction', function () {
                    console.log('[\x1b[31mMYSQL_POOL\x1b[0m] Removed : %d / Created : %d', connection.removed, connection.created);
                })
                .on('prepared', function (count) {
                    if (count > 0)
                        console.log('[\x1b[31mMYSQL_POOL\x1b[0m] Created %d initial connections', count);
                });

            console.log('[\x1b[31mINFO\x1b[0m] Connection to BDD : \x1b[32mOK\x1b[0m');
        }
    }

    connect() {
        const config = {
            connectionLimit: 50,
            host: process.env.MYSQL_HOST,
            database: process.env.MYSQL_DATABASE,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            port: process.env.MYSQL_PORT,
            debug: false
        };

        return mysql.createPool(config);
    }

    async query(sql, params) {
        try {
            return await new Promise((resolve, reject) => {
                this.pool.getConnection(function (err, connection) {
                    if (err) {
                        if (connection)
                            connection.release();
                        return reject({
                            code: 100,
                            message: 'Cannot connect to database'
                        });
                    }
                    connection.query(sql, params, (err, res) => {
                        connection.release();
                        if (err)
                            reject(err);
                        else
                            resolve(res);
                    });
                    connection.on('error', (err) => {
                        reject(err);
                    });
                });
            });
        } catch (e) {
            throw e;
        }
    }

    async insert(model, data) {
        const query = 'INSERT INTO ' + model + ' VALUES (?)';
        return await this.query(query, data)
    }

    async updateById(model, id, options = {}) {
        const toSet = options.concat(options.map(([prop, val]) => {
            return `${prop} = ${val}`
        }));
        const query = 'UPDATE ' + model + ' SET ' + toSet.join(' AND ') + ' WHERE id = ?'
        console.log(query);
        return await this.query(query, id)
    }

    async update(model, filters = {}, options= {}) {

    }

    async removeById(model, id, options = {}) {
        const query = 'DELETE FROM ' + model + ' WHERE id = ?';
        return await this.query(query, id);
    }

    async remove(model, filters = {}, options= {}) {

    }

    async find(model, filters = {}, options = {}) {

    }

    async findById(model, id, options = {}) {

    }

    async findOne(model, filters = {}, options= {}) {
        return (await this.find(model, filters, options))[0];
    }
}
