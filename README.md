# Microservices CI/CD Automation, AWS Deployment and Monitoring

## 1. Project Overview

This project demonstrates an end-to-end CI/CD workflow for a static frontend served by Nginx and three Node.js microservices (user, product and order). Jenkins builds and tags Docker images, scans them with Trivy, pushes them to Amazon ECR, deploys the selected image versions to an Ubuntu EC2 host using Docker Compose, and runs HTTP checks through Nginx.

## 2. Architecture

```text
Developer
   |
   v
GitHub (devops-setup branch)
   |
   v
Jenkins (SCM polling / pipeline)
   |-- Validate Docker Compose
   |-- Build and tag four Docker images
   |-- Push images to Amazon ECR
   |-- Trivy image reports (table + JSON)
   |-- Pull and deploy versioned images
   |-- Run six API/health checks
   v
Ubuntu EC2
   |
   v
Docker Compose network
   |-- Nginx frontend :80
   |-- user-service :3001
   |-- product-service :3002
   |-- order-service :3003

Monitoring on the EC2 host:
Prometheus <- Node Exporter -> Grafana dashboards
```

## 3. Technology Stack

- AWS EC2 (Ubuntu), IAM instance role and Amazon ECR
- Docker Engine, Docker Compose and Nginx
- Jenkins Pipeline and GitHub source control
- Terraform for infrastructure configuration
- Trivy for container image vulnerability/secret scanning
- Prometheus, Node Exporter and Grafana

## 4. Repository Layout

- `Jenkinsfile`: CI/CD stages, deployment, API tests, verification and report archiving.
- `docker-compose.yml`: application services, health checks, restart policies and dependencies.
- `nginx/`: frontend Dockerfile and reverse-proxy routes.
- `services/{user,product,order}-service/`: Node.js service code and Dockerfiles.
- `.github/workflows/`: GitHub Actions workflow file(s).
- `Task-4.docx`: supplementary DOCX file included at the repository root; verify its contents and role before treating it as submission evidence.

Terraform configuration and monitoring Compose/configuration were maintained on the EC2 host during this exercise; they are not present in this repository snapshot.

## 5. Application Routes

| Purpose | Nginx route |
|---|---|
| Website | `/` |
| User API | `/api/users` |
| Product API | `/api/products` |
| Order API | `/api/orders` |
| User health | `/health/user` |
| Product health | `/health/product` |
| Order health | `/health/order` |

The backend containers are exposed to the internal Compose network; Nginx publishes port 80.

## 6. Prerequisites

On the EC2 deployment host:
- Ubuntu Linux with Docker Engine and Docker Compose plugin.
- AWS CLI configured through an attached IAM instance role.
- ECR permissions for authentication and image push/pull.
- Jenkins agent access to Docker, AWS CLI and Trivy.
- Inbound security group rule for HTTP 80. Restrict SSH 22 and Jenkins 8080 to the administrator's trusted IP (/32). Do not expose Grafana, Prometheus or Node Exporter publicly.

Do not store AWS access keys, passwords, tokens, or other secrets in Git. Prefer an EC2 IAM role and a managed secret store/credential mechanism.

## 7. CI/CD Pipeline

The Jenkinsfile on `devops-setup` contains these stages:

1. Checkout source from GitHub.
2. Validate the Compose configuration with `docker compose config -q`.
3. Authenticate to ECR using `aws ecr get-login-password` and Docker's password-stdin.
4. Build and push versioned and `latest` images for three microservices and the Nginx frontend.
5. Scan all four images with Trivy and generate text and JSON reports under `trivy-reports/`.
6. Create an ECR Compose override and validate the merged Compose configuration.
7. Deploy the versioned ECR images using Compose with `--pull always`, `--no-build` and `--wait`.
8. Run HTTP checks for the six API/health endpoints listed above.
9. Verify running containers and fetch the website homepage.
10. Archive Trivy reports; print container logs on pipeline failure.

SCM polling is configured in the Jenkins job. Confirm the job's polling log and a change-triggered build as part of the demonstration.

### ECR image naming

```text
<account>.dkr.ecr.<region>.amazonaws.com/user-service:<build-number>
<account>.dkr.ecr.<region>.amazonaws.com/product-service:<build-number>
<account>.dkr.ecr.<region>.amazonaws.com/order-service:<build-number>
<account>.dkr.ecr.<region>.amazonaws.com/carwebsite-frontend:<build-number>
```

Use the account ID and region configured in the Jenkinsfile/EC2 environment. Build-number tags provide immutable deployment references; `latest` is also pushed for convenience.

### Trivy interpretation

The current pipeline uses `--exit-code 0`, so findings are reported and archived but do not fail the build. A successful scan means the scan ran successfully, not that the images are vulnerability-free. Review the generated reports and plan package/base-image updates for applicable findings before enabling a blocking security gate.

## 8. Operational Commands

Run these from the project directory on the EC2 host:

```bash
# Validate Compose configuration
docker compose config -q

# Start the local-build stack (for local development)
docker compose up -d --build

# View current services and health
docker compose ps

# Follow application logs
docker compose logs -f --tail=100

# View a single service's logs
docker logs --tail=100 user-service
docker logs --tail=100 product-service
docker logs --tail=100 order-service
docker logs --tail=100 car-website

# Check endpoints locally through Nginx
curl -fsS http://localhost/
curl -fsS http://localhost/health/user
curl -fsS http://localhost/health/product
curl -fsS http://localhost/health/order
curl -fsS http://localhost/api/users
curl -fsS http://localhost/api/products
curl -fsS http://localhost/api/orders
```

The Jenkins pipeline uses an ECR Compose override generated during the deployment stage; the local-build command above is for local development and is not the release deployment procedure.

## 9. ECR Deployment and Rollback

For a manual rollback, select a previously verified image tag from ECR and deploy only the affected service using a temporary Compose override. Example for user-service (replace the tag with a known-good version and use the actual ECR account/region):

```yaml
services:
  user-service:
    image: <account>.dkr.ecr.<region>.amazonaws.com/user-service:<known-good-tag>
```

Authenticate to ECR, pull the known-good image, validate the combined Compose files, and recreate only that service:

```bash
aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <account>.dkr.ecr.<region>.amazonaws.com
docker compose -f docker-compose.yml -f rollback-user.yml config -q
docker compose -f docker-compose.yml -f rollback-user.yml up -d --no-build --pull always --no-deps user-service
docker inspect user-service --format '{{.Config.Image}}'
curl -fsS http://localhost/health/user
```

Keep the rollback override as a temporary operational file unless it is intentionally maintained in source control. Record the previous and restored image tags in the deployment evidence. Repeat the same pattern for another service only after changing its service name and image.

## 10. Monitoring

Prometheus scrapes Node Exporter metrics; Grafana uses Prometheus as its data source. The dashboards prepared for this exercise cover CPU, memory, disk utilization and host availability.

Keep monitoring endpoints private. Access Grafana through an SSH tunnel or an approved private network path rather than opening port 3000 or 9090 to the internet. Example tunnel (replace the host IP and SSH key path):

```bash
ssh -i <key-file.pem> -L 3000:127.0.0.1:3000 ubuntu@<EC2-public-IP>
```

Then open `http://localhost:3000` in the local browser. Use the same approach for Prometheus with a separate local port-forward if needed.

## 11. Failure Simulation and Recovery

A service failure was simulated by stopping `user-service`. The Nginx health route returned an error while the backend was unavailable. The service was then restarted and the route returned HTTP 200 with a healthy response.

```bash
docker stop user-service
curl -i http://localhost/health/user
docker start user-service
curl -i http://localhost/health/user
```

Capture the failure response, recovery command and healthy response in the evidence document.

## 12. Terraform and Infrastructure

Terraform files were maintained in the EC2 host directory `terraform-aws-project` during the exercise. The completed run used init, validate, plan and apply, with the existing EC2 instance and three microservice ECR repositories represented in state. The frontend ECR repository was handled separately.

Because the Terraform configuration/state is not included in this repository snapshot, do not assume the local directory is reproducible from this repo. For a fresh environment, obtain and review the actual Terraform files and backend/state arrangement first.

Typical review commands (run in the Terraform directory):

```bash
terraform init
terraform fmt -check
terraform validate
terraform plan
terraform state list
terraform output
```

Do not run `terraform destroy` as part of normal verification. Before any cleanup, review the plan, confirm resource ownership and backups, and remove only resources intentionally created for this assignment. Protect state files because they can contain sensitive infrastructure details.

## 13. Evidence and Submission Checklist

Attach the actual screenshots/log exports to the supplied task document or a dedicated evidence folder before submission:

- [ ] GitHub branch and repository file list.
- [ ] Jenkins successful pipeline, including ECR push, Trivy scans, six API tests and final verification.
- [ ] ECR repositories and versioned image tags.
- [ ] EC2 instance details and restricted security-group inbound rules.
- [ ] Terraform init/validate/plan/apply output and state resource list.
- [ ] Prometheus targets showing expected targets UP.
- [ ] Grafana dashboard panels for CPU, memory, disk and availability.
- [ ] Failure simulation and successful service recovery.
- [ ] Rollback to a known-good ECR tag and healthy endpoint after rollback.
- [ ] AWS monthly budget and configured alerts.
- [ ] README and cleanup guidance.

Do not add fabricated screenshots or credentials to the repository. Store real review evidence in the supplied task document or a clearly named `evidence/` folder.

## 14. Cost and Safe Cleanup

The project assignment calls for cost awareness and safe cleanup. Check the AWS billing dashboard and monthly budget alerts during the exercise. Identify resources created specifically for the task before cleanup.

- Stop or terminate only the EC2 resources that are confirmed no longer needed.
- Review ECR image retention and delete only unneeded image tags/repositories.
- Review EBS volumes and snapshots before deleting any unattached storage.
- Review Terraform state and plan before removing infrastructure.
- Do not delete shared IAM roles, repositories, state files or resources used by other workloads.
- Preserve the repository, README, build logs, Trivy reports and review evidence for submission.

## 15. Current Evidence Status

The latest Jenkins console log supplied for this exercise shows build #13 completing successfully: four images pushed to ECR, all four images scanned, ECR deployment and container health checks completed, six application endpoints passed, and the homepage verification completed. Trivy findings remain report-only under the current `--exit-code 0` configuration.


