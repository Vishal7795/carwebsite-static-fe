# Microservices CI/CD Automation, AWS Deployment and Monitoring

## Project Overview
This project implements an automated CI/CD pipeline for a containerized microservices application using AWS, Docker, Jenkins and Terraform.

## Technology Stack
- AWS EC2 and Amazon ECR
- Docker and Docker Compose
- Jenkins CI/CD
- Nginx Reverse Proxy
- Terraform
- Prometheus and Node Exporter
- Grafana
- GitHub

## Application Services
- Frontend: Nginx
- User Service: Node.js
- Product Service: Node.js
- Order Service: Node.js

## CI/CD Workflow
1. Source code is maintained in GitHub.
2. Jenkins checks out the configured branch.
3. Docker Compose configuration is validated.
4. Docker images are built and tagged.
5. Images are pushed to Amazon ECR.
6. Application containers are deployed from ECR.
7. Deployment is verified through health checks.

## Infrastructure as Code
Terraform configuration is maintained separately in the `terraform-aws-project` directory on the EC2 instance. It references the existing EC2 instance and manages the three microservice ECR repositories.

## Monitoring
Prometheus collects metrics from Node Exporter. Grafana dashboards visualize CPU, memory, disk utilization and server availability.

## Deployment Verification
The application and its three backend services were verified using HTTP health checks. Jenkins build #6 completed successfully with ECR deployment.

## Branch
`devops-setup`
