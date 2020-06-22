import mysql = require('mysql');
import {IMysql} from '../interfaces/IMysql'
import {ERRORS} from "../interfaces/EErrors";
const MysqlPoolBooster = require('mysql-pool-booster');
MysqlPoolBooster(mysql);

const config: mysql.PoolConfig = {
    connectionLimit: 50,
    host: process.env.MYSQL_HOST,
    database: process.env.MYSQL_DATABASE,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    // @ts-ignore
    port: process.env.MYSQL_PORT,
    debug: false
};

const pool: mysql.Pool = mysql.createPool(config);

require('events').EventEmitter.defaultMaxListeners = 30;

/**
 * Set logs for debugs
 */

if (process.env.DEBUG === 'true') {
    pool.on('acquire', function (connection: mysql.Connection): void {
        console.log("[\x1b[31mMYSQL_POOL\x1b[0m] Connection %d acquired", connection.threadId);
    })
        .on('enqueue', function (): void {
            console.log("[\x1b[31mMYSQL_POOL\x1b[0m] Waiting for available slot");
        })
        .on('release', function (connection: mysql.Connection): void {
            console.log("[\x1b[31mMYSQL_POOL\x1b[0m] Connection %d released", connection.threadId);
        })
        .on('eviction', function (connection: {
            removed: number,
            created: number
        }): void {
            console.log('[\x1b[31mMYSQL_POOL\x1b[0m] Removed : %d / Created : %d', connection.removed, connection.created);
        })
        .on('prepared', function (count: number): void {
            if (count > 0)
                console.log('[\x1b[31mMYSQL_POOL\x1b[0m] Created %d initial connections', count);
        });

    console.log('[\x1b[31mINFO\x1b[0m] Connection to BDD : \x1b[32mOK\x1b[0m');
}

module.exports = async function promisedQuery(sql: string, params: mysql.QueryOptions): Promise<IMysql> {
    try {
        return await new Promise((resolve, reject) => {
            pool.getConnection(function (err: mysql.MysqlError, connection: mysql.PoolConnection) {
                if (err) {
                    if (connection)
                        connection.release();
                    return reject({
                        code: 100,
                        message: ERRORS.DB_CONNECTION
                    });
                }
                connection.query(sql, params, (err: mysql.MysqlError | null, res: IMysql) => {
                    connection.release();
                    if (err)
                        reject(err);
                    else
                        resolve(res);
                });
                connection.on('error', (err: mysql.MysqlError) => {
                    reject(err);
                });
            });
        });
    } catch (e) {
        throw e;
    }
};
