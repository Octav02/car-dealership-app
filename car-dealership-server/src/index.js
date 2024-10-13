const Koa = require('koa');
const app = new Koa();
const server = require('http').createServer(app.callback());
const WebSocket = require('ws');
const wss = new WebSocket.Server({server});
const Router = require('koa-router');
const cors = require('koa-cors');
const bodyparser = require('koa-bodyparser');

app.use(bodyparser());
app.use(cors());
app.use(async (ctx, next) => {
    const start = new Date();
    await next();
    const ms = new Date() - start;
    console.log(`${ctx.method} ${ctx.url} ${ctx.response.status} - ${ms}ms`);
});

app.use(async (ctx, next) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    await next();
});

app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        ctx.response.body = {message: err.message || 'Unexpected error'};
        ctx.response.status = 500;
    }
});

class Car {
    constructor(id, model, sellDate, price, isElectric) {
        this.id = id;
        this.model = model
        this.sellDate = sellDate
        this.price = price
        this.isElectric = isElectric
    }
}

const cars = [];
for (let i = 0; i < 3; i++) {
    cars.push(new Car(`${i}`, `Model ${i}`, new Date(Date.now() + i), 10000 + i * 1000, i % 2 === 0));
}
let lastUpdated = cars[cars.length - 1].date;
let lastId = cars[cars.length - 1].id;
const pageSize = 10;

const broadcast = data =>
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });

const router = new Router();

router.get('/car', ctx => {
    ctx.response.body = cars;
    ctx.response.status = 200;
});

router.get('/car/:id', async (ctx) => {
    const carId = ctx.request.params.id;
    console.log(`GET car with id: ${carId}`);
    const car = cars.find(car => carId === car.id);
    if (car) {
        ctx.response.body = car;
        ctx.response.status = 200; // ok
    } else {
        ctx.response.body = {message: `car with id ${carId} not found`};
        ctx.response.status = 404; // NOT FOUND (if you know the resource was deleted, then return 410 GONE)
    }
});

const createCar = async (ctx) => {
    const car = ctx.request.body;
    if (!car.text) { // validation
        ctx.response.body = {message: 'Text is missing'};
        ctx.response.status = 400; //  BAD REQUEST
        return;
    }
    car.id = `${parseInt(lastId) + 1}`;
    lastId = car.id;
    car.date = new Date();
    car.version = 1;
    cars.push(car);
    ctx.response.body = car;
    ctx.response.status = 201; // CREATED
    broadcast({event: 'created', payload: {car: car}});
};

router.post('/car', async (ctx) => {
    await createCar(ctx);
});

router.put('/car/:id', async (ctx) => {
    const id = ctx.params.id;
    const car = ctx.request.body;
    car.date = new Date();
    const carId = car.id;
    if (carId && id !== car.id) {
        ctx.response.body = {message: `Param id and body id should be the same`};
        ctx.response.status = 400; // BAD REQUEST
        return;
    }
    if (!carId) {
        await createCar(ctx);
        return;
    }
    const index = cars.findIndex(car => car.id === id);
    if (index === -1) {
        ctx.response.body = {message: `car with id ${id} not found`};
        ctx.response.status = 400; // BAD REQUEST
        return;
    }
    const itemVersion = parseInt(ctx.request.get('ETag')) || car.version;
    if (itemVersion < cars[index].version) {
        ctx.response.body = {message: `Version conflict`};
        ctx.response.status = 409; // CONFLICT
        return;
    }
    car.version++;
    cars[index] = car;
    lastUpdated = new Date();
    ctx.response.body = car;
    ctx.response.status = 200; // OK
    broadcast({event: 'updated', payload: {car: car}});
});

router.del('/car/:id', ctx => {
    const id = ctx.params.id;
    const index = cars.findIndex(item => id === item.id);
    if (index !== -1) {
        const car = cars[index];
        cars.splice(index, 1);
        lastUpdated = new Date();
        broadcast({event: 'deleted', payload: {item: car}});
    }
    ctx.response.status = 204; // no content
});

setInterval(() => {
    lastUpdated = new Date();
    lastId = `${parseInt(lastId) + 1}`;

    i=lastId;
    const car =new Car(i, `Model ${i}`, new Date(Date.now() + parseInt(i)), 10000 + i * 1000, i % 2 === 0);
    cars.push(car);
    console.log(`New car: ${car.model}`);
    broadcast({event: 'created', payload: {car: car}});
}, 4500);

app.use(router.routes());
app.use(router.allowedMethods());

server.listen(3000);
