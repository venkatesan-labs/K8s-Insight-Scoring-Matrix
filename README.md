# K8s-Insight-Scoring-Matrix-Venkatesan
Web app hosted with work profile, kubernetes guide and quiz with 3 tire microservice architecture

<img width="3033" height="1014" alt="image" src="https://github.com/user-attachments/assets/f2edbc29-3e6f-42cc-87a8-9f35d2547855" />

K8S INSIGHT SCORING MATRIX - INSTALLATION GUIDE
============================================================

PROJECT OVERVIEW:
This project automates the deployment of a Frontend and Backend
application to Kubernetes, integrated with Ngrok Ingress Controller 
for external access, managed via a Jenkins Declarative Pipeline.

PREREQUISITES:
1. Ensure a Kubernetes cluster is running.
2. Install Jenkins and configure the credentials listed in requirements.txt.
3. Ensure the 'ngrok-operator' Helm chart is available in the local directory.

INSTALLATION STEPS:

Step 1: Code Synchronization
- Ensure the 'main' branch content is merged into your environment 
  branch (test, dev, or prod).

Step 2: Jenkins Pipeline Setup
- Create a 'Pipeline' job in Jenkins.
- Select 'Pipeline script from SCM'.
- Repository URL: https://github.com/kodecloud95/K8s-Insight-Scoring-Matrix-Venkatesan.git
- Branch Specifier: */test (or your preferred branch).

Step 3: Execution (Deploy/Update)
1. Click 'Build with Parameters'.
2. Select ENV (test/dev/prod).
3. Set ACTION to 'DEPLOY'.
4. Set NGROK to 'DEPLOY'.
5. Click 'Build'.

Step 4: Verification
- Check Pod status: kubectl get pods -n k8s-insight-<env>
- Check Ingress: kubectl get ingress -n k8s-insight-<env>
- The Ngrok operator will automatically tunnel the 'ngrok-ingress' 
  to your reserved ngrok domain.

CLEANUP STEPS:
1. Run the Jenkins job with ACTION = 'DELETE'.
2. Set NGROK = 'DELETE' if you wish to remove the controller.
3. The pipeline will clear finalizers and uninstall Helm releases.

FEATURES:
- Dynamic Image Tagging: Uses Jenkins Build Number for traceability.
- Environment Isolation: Separate namespaces for dev, test, and prod.
- Automated Ingress: Real-time external URLs via Ngrok.
- Safe Cleanup: Automated finalizer patching to prevent stuck namespaces.
============================================================
