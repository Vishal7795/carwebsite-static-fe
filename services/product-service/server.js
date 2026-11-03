const http = require("http");

const PORT = 3002;

const server = http.createServer((req, res) => {
    res.setHeader("Content-Type", "application/json");

    if (req.url === "/health") {
        res.writeHead(200);
        return res.end(JSON.stringify({
            service: "product-service",
            status: "healthy"
        }));
    }

    if (req.url === "/api/products") {
        res.writeHead(200);
        return res.end(JSON.stringify({
            products: [
                { id: 1, name: "Car", price: 500000 },
                { id: 2, name: "Bike", price: 100000 }
            ]
        }));
    }

    res.writeHead(404);
    res.end(JSON.stringify({ message: "Route not found" }));
});

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Product Service running on port ${PORT}`);
});
