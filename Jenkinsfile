
pipeline {
    agent any

    environment {
        AWS_ACCOUNT_ID = '418043655510'
        AWS_REGION = 'us-east-1'
        ECR_REGISTRY = '418043655510.dkr.ecr.us-east-1.amazonaws.com'
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo 'Source code checkout completed'
            }
        }

        stage('Validate Docker Compose') {
            steps {
                sh 'docker compose config -q'
            }
        }

        stage('ECR Login') {
            steps {
                sh '''
                    aws ecr get-login-password --region "$AWS_REGION" |
                    docker login --username AWS --password-stdin "$ECR_REGISTRY"
                '''
            }
        }

        stage('Build and Push Images') {
            steps {
                sh '''
                    set -e

                    for SERVICE in user-service product-service order-service
                    do
                        docker build \
                          -t "$ECR_REGISTRY/$SERVICE:$IMAGE_TAG" \
                          -t "$ECR_REGISTRY/$SERVICE:latest" \
                          "./services/$SERVICE"

                        docker push "$ECR_REGISTRY/$SERVICE:$IMAGE_TAG"
                        docker push "$ECR_REGISTRY/$SERVICE:latest"
                    done

                    docker build \
                      -f nginx/Dockerfile \
                      -t "$ECR_REGISTRY/carwebsite-frontend:$IMAGE_TAG" \
                      -t "$ECR_REGISTRY/carwebsite-frontend:latest" \
                      .

                    docker push "$ECR_REGISTRY/carwebsite-frontend:$IMAGE_TAG"
                    docker push "$ECR_REGISTRY/carwebsite-frontend:latest"
                '''
            }
        }

        stage('Prepare ECR Deployment') {
            steps {
                sh '''
                    cat > docker-compose.ecr.yml <<EOF
services:
  user-service:
    image: ${ECR_REGISTRY}/user-service:${IMAGE_TAG}

  product-service:
    image: ${ECR_REGISTRY}/product-service:${IMAGE_TAG}

  order-service:
    image: ${ECR_REGISTRY}/order-service:${IMAGE_TAG}

  frontend:
    image: ${ECR_REGISTRY}/carwebsite-frontend:${IMAGE_TAG}
EOF

                    docker compose \
                      -f docker-compose.yml \
                      -f docker-compose.ecr.yml config -q
                '''
            }
        }

        stage('Deploy from ECR') {
            steps {
                sh '''
                    docker compose \
                      -f docker-compose.yml \
                      -f docker-compose.ecr.yml \
                      up -d --no-build --pull always --wait
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                sh '''
                    docker compose \
                      -f docker-compose.yml \
                      -f docker-compose.ecr.yml ps

                    curl -f http://localhost/
                '''
                echo 'ECR deployment verified successfully'
            }
        }
    }

    post {
        success {
            echo 'CI/CD pipeline completed successfully!'
        }

        failure {
            echo 'Pipeline failed. Checking container logs.'
            sh 'docker compose logs --tail=50 || true'
        }
    }
}
