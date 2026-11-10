data "aws_caller_identity" "current" {}

data "aws_instance" "application" {
  instance_id = var.existing_instance_id
}

resource "aws_ecr_repository" "microservices" {
  for_each = toset([
    "user-service",
    "product-service",
    "order-service"
  ])

  name                 = each.value
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = false
  }

  encryption_configuration {
    encryption_type = "AES256"
  }
}

output "account_id" {
  value = data.aws_caller_identity.current.account_id
}

output "existing_instance" {
  value = {
    id        = data.aws_instance.application.id
    type      = data.aws_instance.application.instance_type
    public_ip = data.aws_instance.application.public_ip
  }
}

output "ecr_repository_urls" {
  value = {
    for name, repo in aws_ecr_repository.microservices :
    name => repo.repository_url
  }
}
