import http, { request } from 'node:http';
import { MongoClient } from 'mongodb';
const PORT = process.env.PORT || 5000;

const client = new MongoClient(process.env.MONGODB_URL);
client
    .connect()
    .then(() => console.log('connected to db'))
    .catch((err) => console.error('an error occured'));

const db = client.db('sophomore');
const Persons = db.collection('Persons');
Persons.createIndex({ name: 1 }, { unique: true });

const controllers = {
    async createPerson(requestBody) {
        const insertResult = await Persons.insertOne({
            name: requestBody.name.toLowerCase(),
        });
        return { id: insertResult.insertedId, name: requestBody.name };
    },
    async readPersons() {
        try {
            const persons = await Persons.find({}).toArray();
            return persons;
        } catch (err) {
            console.error(err);
        }
    },
    async readPerson(name) {
        try {
            const findResult = await Persons.findOne({
                name: name.toLowerCase(),
            });
            return findResult;
        } catch (err) {
            console.error(err);
        }
    },
    async editPerson(identifier, bodyObj) {
        const updateResult = await Persons.findOneAndUpdate(
            { name: identifier },
            { $set: { name: bodyObj.name } },
            { returnDocument: 'after' }
        );

        return updateResult;
    },
    async deletePerson(name) {
        try {
            const deleteResult = await Persons.findOneAndDelete({ name });
            return deleteResult;
        } catch (err) {
            console.error(err);
        }
    },
};

const server = http.createServer(async function (request, response) {
    const matchPersonRoute = request.url.match(/\/api\/persons\/[A-Za-z]+/);
    if (request.url === '/api/persons' && request.method === 'GET') {
        try {
            const persons = await controllers.readPersons();
            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify(persons));
        } catch (err) {
            response.writeHead(500, { 'Content-Type': 'application/json' });
            response.end({
                error: 'An error occurred during the request. Our devs are looking into the cause',
            });
        }
    } else if (matchPersonRoute && request.method === 'GET') {
        const params = request.url.split('/')[3];
        const person = await controllers.readPerson(params);
        if (!person) {
            response.writeHead(404, { 'Content-Type': 'application/json' });
            return response.end(JSON.stringify({ error: 'Person not found' }));
        }
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(person));
    } else if (request.url === '/api/persons' && request.method === 'POST') {
        try {
            const requestBody = await reqBodyParser(request);

            if (!containsOnlyAlphabet(requestBody.name)) {
                response.writeHead(400, {
                    'Content-Type': 'application/json`',
                });
                return response.end(
                    JSON.stringify({
                        error: 'name cannot contain number or alphanumeric characters e.g. [- _$!^]',
                    })
                );
            }

            const newPerson = await controllers.createPerson(requestBody);
            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify(newPerson));
        } catch (err) {
            if (err.code === 11000) {
                response.writeHead(400, { 'Content-Type': 'application/json' });
                return response.end(
                    JSON.stringify({ error: 'name has been taken.' })
                );
            }
        }
    } else if (matchPersonRoute && request.method === 'PUT') {
        try {
            const params = request.url.split('/')[3];
            const requestBody = await reqBodyParser(request);
            if (!requestBody) {
                response.writeHead(400, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ error: 'name cannot be empty' }));
            }
            if (!containsOnlyAlphabet(requestBody.name)) {
                response.writeHead(400, {
                    'Content-Type': 'application/json`',
                });
                return response.end(
                    JSON.stringify({
                        error: 'name cannot contain number or alphanumeric characters e.g. [- _$!^]',
                    })
                );
            }

            const updatedPerson = await controllers.editPerson(
                params,
                requestBody
            );
            if (!updatedPerson) {
                response.writeHead(404, { 'Content-Type': 'application/json' });
                return response.end(
                    JSON.stringify({ error: 'Person not found' })
                );
            }
            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify(updatedPerson));
        } catch (err) {
            if (err.code === 11000) {
                response.writeHead(400, { 'Content-Type': 'application/json' });
                return response.end(
                    JSON.stringify({ error: 'name has been taken.' })
                );
            }
        }
    } else if (matchPersonRoute && request.method === 'DELETE') {
        const params = request.url.split('/')[3];
        const person = await controllers.deletePerson(params);
        if (!person) {
            response.writeHead(404, { 'Content-Type': 'application/json' });
            return response.end(JSON.stringify({ error: 'Person not found' }));
        }
        response.writeHead(204, { 'Content-Type': 'application/json' });
        response.end();
    } else {
        response.writeHead(404);
        response.end('Invalid endpoint!');
    }
});

server.listen(PORT, function () {
    console.log('Server is active');
});
server.on('error', (err) => {
    console.error(err);
});

function reqBodyParser(req) {
    return new Promise((resolve, reject) => {
        try {
            let bodyString = '';
            req.on('data', (slug) => {
                bodyString += slug.toString();
            });
            req.on('end', () => {
                resolve(JSON.parse(bodyString));
            });
        } catch (error) {
            reject(error);
        }
    });
}

function containsOnlyAlphabet(name) {
    return name.match(/^[A-Za-z]+$/);
}
