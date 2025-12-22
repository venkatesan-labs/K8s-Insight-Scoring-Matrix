pipeline{
    agent any
    parameters {
        choice(name: 'ENV', choices: ["test", "dev", "prod"], description: 'Select the environment')
        choice(name: 'ACTION', choices: ["DEPLOY", "UPDATE", "DELETE"], description: 'Select the environment')
        string(name: 'FRONTEND_IMAGE_TAG', defaultValue: 'latest', description: 'Frontend Docker image tag')
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
                expression { (params.FRONTEND_IMAGE_TAG.trim() == 'latest') && (params.ACTION == "DEPLOY" || params.ACTION == "UPDATE") }
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
                expression { (params.BACKEND_IMAGE_TAG.trim() == 'latest') && (params.ACTION == "DEPLOY" || params.ACTION == "UPDATE") }
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
        stage ('Deploy Ngrok Ingress Controller'){
            when {
                expression { (params.ACTION == "DEPLOY" || params.ACTION == "UPDATE") }
            }
            steps {
                withCredentials([file(credentialsId: 'K8S_CREDENTIAL', variable: 'KUBECONFIG'),
                                string(credentialsId: 'NGROK_API_KEY', variable: 'NGROK_API_KEY'),
                                string(credentialsId: 'NGROK_AUTH_KEY', variable: 'NGROK_AUTH_KEY')]) {
                script {
                    sh """
                        echo "Ngrok Operator installation in process."
                        helm upgrade --install ngrok-operator ./ngrok-operator --set credentials.apiKey="${NGROK_API_KEY}" --set credentials.authtoken="${NGROK_API_KEY}"
                        echo "Ngrok Operator installation Completed."
                    """
                }
                }
            }
        }
        stage ('Deploy to Kubernetes'){
            when {
                expression { (params.ACTION == "DEPLOY") || (params.ACTION == "UPDATE") }
            }
            steps {
                withCredentials([file(credentialsId: 'K8S_CREDENTIAL', variable: 'KUBECONFIG')]) {
                script {
                    def FRONT_TAG = "${env.BUILD_NUMBER}"
                    if (params.FRONTEND_IMAGE_TAG.trim() !=  'latest') {
                        FRONT_TAG = params.FRONTEND_IMAGE_TAG.trim()
                    }
                    def BACK_TAG = "${env.BUILD_NUMBER}"
                    if (params.BACKEND_IMAGE_TAG.trim() !=  'latest') {
                        BACK_TAG = params.BACKEND_IMAGE_TAG.trim()
                    }
                    sh """
                        # Add your kubectl deployment commands here
                        echo "Deploying to ${params.ENV} environment with Frontend Image Tag: ${FRONT_TAG} and Backend Image Tag: ${BACK_TAG}"
                        helm upgrade --install k8s-insight-${params.ENV} ./k8s-insight \\
                            --set frontend.container.image=${GIT_REGISTRY}/${FRONTEND_IMAGE_NAME}:${FRONT_TAG} \\
                            --set backend-deployment.container.image=${GIT_REGISTRY}/${BACKEND_IMAGE_NAME}:${BACK_TAG} 
                        
                    """               
                    }
                }
            }
        }
        stage ('Deployment Cleanup') {
            when {
                expression { (params.ACTION == "DELETE") }
            }
            steps {
                withCredentials([file(credentialsId: 'K8S_CREDENTIAL', variable: 'KUBECONFIG')]) {
                   sh """
                        # Add your kubectl deployment commands here
                        echo "Deleting helm k8s-insight-${params.ENV} in ${params.ENV} environment "

                        kubectl patch ingress ngrok-ingress -n k8s-insight-${params.ENV} --type merge -p '{"metadata":{"finalizers":null}}'
                        kubectl patch domain dianna-beholdable-larissa-ngrok-free-dev -n k8s-insight-${params.ENV} --type merge -p '{"metadata":{"finalizers":null}}';
                        
                        helm uninstall k8s-insight-${params.ENV}
                        helm uninstall ngrok-operator

                        echo "Cleanup completed."
                    """
                }
            }
        }
    }
}