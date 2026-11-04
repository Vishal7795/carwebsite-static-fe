pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out car website source code'
                checkout scm
            }
        }

        stage('Validate Docker Compose') {
            steps {
                sh 'docker compose config -q'
                echo 'Docker Compose configuration is valid'
            }
        }

        stage('Build Docker Images') {
            steps {
                sh 'docker compose build'
            }
        }

        stage('Deploy Application') {
            steps {
                sh 'docker compose up -d --wait'
            }
        }

        stage('Verify Deployment') {
            steps {
                sh 'docker compose ps'
                sh 'curl -f http://localhost/'
                echo 'Car website deployment verified successfully'
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
