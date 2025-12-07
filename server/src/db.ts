import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const DATA_DIR = path.join(__dirname, '../data');

interface BaseDocument {
    id: string;
    [key: string]: any;
}

class Collection<T extends BaseDocument> {
    private name: string;
    private filePath: string;

    constructor(name: string) {
        this.name = name;
        this.filePath = path.join(DATA_DIR, `${name}.json`);
    }

    private async readData(): Promise<T[]> {
        try {
            await fs.mkdir(DATA_DIR, { recursive: true });
            const data = await fs.readFile(this.filePath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            if ((error as any).code === 'ENOENT') {
                return [];
            }
            throw error;
        }
    }

    private async writeData(data: T[]): Promise<void> {
        await fs.mkdir(DATA_DIR, { recursive: true });
        await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
    }

    async find(): Promise<T[]> {
        return this.readData();
    }

    async findById(id: string): Promise<T | undefined> {
        const data = await this.readData();
        return data.find((doc) => doc.id === id);
    }

    async add(doc: Omit<T, 'id'>): Promise<T> {
        const data = await this.readData();
        const newDoc = { ...doc, id: uuidv4() } as T;
        data.push(newDoc);
        await this.writeData(data);
        return newDoc;
    }

    async update(id: string, updates: Partial<T>): Promise<T | null> {
        const data = await this.readData();
        const index = data.findIndex((doc) => doc.id === id);
        if (index === -1) return null;

        data[index] = { ...data[index], ...updates };
        await this.writeData(data);
        return data[index];
    }

    async delete(id: string): Promise<boolean> {
        const data = await this.readData();
        const filtered = data.filter((doc) => doc.id !== id);
        if (filtered.length === data.length) return false;

        await this.writeData(filtered);
        return true;
    }
}

export const db = {
    collection: <T extends BaseDocument>(name: string) => new Collection<T>(name),
};
