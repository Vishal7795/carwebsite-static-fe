variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "microservices-cicd"
}

variable "existing_instance_id" {
  description = "Existing application EC2 instance"
  type        = string
  default     = "i-049c025e140c3c32b"
}

variable "ecr_repositories" {
  description = "Existing ECR repositories"
  type        = set(string)
  default = [
    "user-service",
    "product-service",
    "order-service",
    "carwebsite-frontend"
  ]
}
