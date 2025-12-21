pipeline{
    agent any
    parameters {
        choice(name: 'ENV', choices: ["test", "dev", "prod"], description: 'Select the environment')
        string(name: 'FRONTEND_IMAGE_TAG', defaultValue: 'latest', description: 'Docker image tag')
        string(name: 'BACKEND_IMAGE_TAG', defaultValue: 'latest', description: 'Backend Docker image tag')
    }
    environment {
        GIT_REGISTRY = 'ghcr.io/kodecloud95'
        FRONTEND_IMAGE_NAME = "k8s-insight-frontend-${params.ENV}"
        BACKEND_IMAGE_NAME = "k8s-insight-backend-${params.ENV}"
    }
    stages {
        stage ('Checkout Code') {
            steps {
                script {
                    if (params.ENV == "test") {
                        git branch: 'test', url: 'https://github.com/kodecloud95/K8s-Insight-Scoring-Matrix-Venkatesan.git'
                    } else if (params.ENV == "dev") {
                        git branch: 'dev', url: 'https://github.com/kodecloud95/K8s-Insight-Scoring-Matrix-Venkatesan.git'
                    } else if (params.ENV == "prod") {
                        git branch: 'prod', url: 'https://github.com/kodecloud95/K8s-Insight-Scoring-Matrix-Venkatesan.git'
                    }
                }
            }
        }
        stage ('Build and Push Frontend Image') {
            when {
                expression { (params.FRONTEND_IMAGE_TAG.trim()) == 'latest' }
                }             
            steps { 
                withCredentials([usernamePassword(credentialsId: 'GIT_PACKAGE', 
                                usernameVariable: 'REGISTRY_CREDENTIALS_USR', 
                                passwordVariable: 'REGISTRY_CREDENTIALS_PSW')]) {            
                script {
                    def frontendImage = "${GIT_REGISTRY}/${FRONTEND_IMAGE_NAME}:${env.BUILD_NUMBER}"
                    sh """
                        docker build -f ./frontend/Dockerfile -t ${frontendImage} .
                        echo ${REGISTRY_CREDENTIALS_PSW} | docker login ghcr.io -u ${REGISTRY_CREDENTIALS_USR} --password-stdin
                        docker push ${frontendImage}
                    """                    
                }
                }  
            }
        }
        stage ('Build and Push Backend Image') {
            when {
                expression { (params.BACKEND_IMAGE_TAG.trim()) == 'latest' }
                }
            steps {
                withCredentials([usernamePassword(credentialsId: 'GIT_PACKAGE', 
                                usernameVariable: 'REGISTRY_CREDENTIALS_USR', 
                                passwordVariable: 'REGISTRY_CREDENTIALS_PSW')]) {
                script {
                    def backendImage = "${GIT_REGISTRY}/${BACKEND_IMAGE_NAME}:${env.BUILD_NUMBER}"
                    sh """
                        docker build -f ./backend/Dockerfile -t ${backendImage} .
                        echo ${REGISTRY_CREDENTIALS_PSW} | docker login ghcr.io -u ${REGISTRY_CREDENTIALS_USR} --password-stdin
                        docker push ${backendImage}
                    """
                }
            }
            }
        }
        stage ('Deploy to Kubernetes'){
            steps {
                withCredentials([file(credentialsId: 'K8S_CREDENTIAL', variable: 'KUBECONFIG_PATH')]) {
                script {
                    def kubeconfig = "${KUBECONFIG_PATH}"
                    sh """
                        # Add your kubectl deployment commands here
                        echo "Deploying to ${params.ENV} environment"
                        helm upgrade --install k8s-insight-${params.ENV} ./k8s-insight-chart \\
                            --set frontend.image=${GIT_REGISTRY}/${FRONTEND_IMAGE_NAME}:${env.BUILD_NUMBER} \\
                            --set backend.image=${GIT_REGISTRY}/${BACKEND_IMAGE_NAME}:${env.BUILD_NUMBER} \\
                            --namespace k8s-insight-${params.ENV} --create-namespace
                    """
                }
                }
            }
        }
    }
}