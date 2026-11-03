const http = require("http");

const PORT = 3001;

const server = http.createServer((req, res) => {
    res.setHeader("Content-Type", "application/json");

    if (req.url === "/health") {
        res.writeHead(200);
        return res.end(JSON.stringify({
            service: "user-service",
            status: "healthy"
        }));
    }

    if (req.url === "/api/users") {
        res.writeHead(200);
        return res.end(JSON.stringify({
            users: [
                { id: 1, name: "Vishal" },
                { id: 2, name: "Rahul" }
            ]
        }));
    }

    res.writeHead(404);
    res.end(JSON.stringify({ message: "Route not found" }));
});

server.listen(PORT, "0.0.0.0", () => {
    console.log(`User Service running on port ${PORT}`);
});
