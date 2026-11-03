const http = require("http");

const PORT = 3003;

const server = http.createServer((req, res) => {
    res.setHeader("Content-Type", "application/json");

    if (req.url === "/health") {
        res.writeHead(200);
        return res.end(JSON.stringify({
            service: "order-service",
            status: "healthy"
        }));
    }

    if (req.url === "/api/orders") {
        res.writeHead(200);
        return res.end(JSON.stringify({
            orders: [
                { id: 101, product: "Car", status: "Confirmed" },
                { id: 102, product: "Bike", status: "Pending" }
            ]
        }));
    }

    res.writeHead(404);
    res.end(JSON.stringify({ message: "Route not found" }));
});

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Order Service running on port ${PORT}`);
});
