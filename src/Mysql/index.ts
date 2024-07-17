import mysql from 'mysql2/promise';
import { BufferJSON, initAuthCreds, fromObject } from '../Utils';
import {
    mysqlConfig,
    mysqlData,
    AuthenticationCreds,
    AuthenticationState,
    SignalDataTypeMap
} from '../Types';

export const useSqlAuthState = async (mysqlURI: string, config: mysqlConfig): Promise<{
    state: AuthenticationState;
    saveCreds: () => Promise<void>;
    clear: () => Promise<void>;
    removeCreds: () => Promise<void>;
    query: (table: string, docId: string) => Promise<mysqlData | null>;
}> => {
    const connection = await mysql.createConnection(mysqlURI);
    const tableName = config.tableName ?? 'amiruldev_auth';
    const session = config.session ?? 'amiruldev_waAuth';

    const query = async (table: string, docId: string): Promise<mysqlData | null> => {
        const [rows] = await connection.execute('SELECT * FROM ?? WHERE id = ?', [`${session}_${table}`, docId]);
        if (rows.length === 0) {
            return null;
        }
        return rows[0] as mysqlData;
    };

    const readData = async (id: string) => {
        const data = await query(tableName, id);
        if (!data || !data.value) {
            return null;
        }
        const creds = typeof data.value === 'object'
            ? JSON.stringify(data.value)
            : data.value;
        return JSON.parse(creds, BufferJSON.reviver);
    };

    const writeData = async (id: string, value: object) => {
        const valueFixed = JSON.stringify(value, BufferJSON.replacer);
        await connection.execute(
            'INSERT INTO ?? (id, value, session) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE value = ?, session = ?',
            [`${session}_${tableName}`, id, valueFixed, session, valueFixed, session]
        );
    };

    const removeData = async (id: string) => {
        await connection.execute('DELETE FROM ?? WHERE id = ?', [`${session}_${tableName}`, id]);
    };

    const clearAll = async () => {
        await connection.execute('DELETE FROM ?? WHERE session = ? AND id != "creds"', [`${session}_${tableName}`, session]);
    };

    const removeAll = async () => {
        await connection.execute('DELETE FROM ?? WHERE session = ?', [`${session}_${tableName}`, session]);
    };

    const creds: AuthenticationCreds = (await readData('creds')) || initAuthCreds();

    return {
        state: {
            creds,
            keys: {
                get: async (type, ids) => {
                    const data: {
                        [id: string]: SignalDataTypeMap[typeof type];
                    } = {};
                    for (const id of ids) {
                        let value = await readData(`${type}-${id}`);
                        if (type === 'app-state-sync-key' && value) {
                            value = fromObject(value);
                        }
                        data[id] = value;
                    }
                    return data;
                },
                set: async data => {
                    for (const category in data) {
                        for (const id in data[category]) {
                            const value = data[category][id];
                            const name = `${category}-${id}`;
                            if (value) {
                                await writeData(name, value);
                            } else {
                                await removeData(name);
                            }
                        }
                    }
                }
            }
        },
        saveCreds: async () => {
            await writeData('creds', creds);
        },
        clear: async () => {
            await clearAll();
        },
        removeCreds: async () => {
            await removeAll();
        },
        query: async (table: string, docId: string) => {
            return await query(table, docId);
        }
    };
};
